"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RequestModal } from "@/components/dashboard/RequestModal";
import { useAppStore } from "@/lib/store";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { useRBAC } from "@/hooks/useRBAC";
import { DbRequest } from "@/lib/server-db";

// Adaptador de interfaz para la vista
interface RequestView extends DbRequest {
    type: string;
    territory: string;
    responsible: string; // Mapped from submittedBy
    initials: string;
    color: string;
    status: "pending" | "approved" | "rejected" | "needs_changes";
    statusColor: string;
}

export default function AdminDashboardDesktop() {
    const { user, hasPermission } = useRBAC();
    const territoryFilter = useAppStore((state) => state.territoryFilter);
    const territoryLabel = territoryFilter.section
        ? `${territoryFilter.section}${territoryFilter.district ? ` > ${territoryFilter.district}` : ""}`
        : "Territorio Provincial";

    const [requests, setRequests] = useState<RequestView[]>([]);

    // Cargar datos reales del Backend
    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (res.ok) {
                const data: DbRequest[] = await res.json();
                // Mapear DB a Vista (Enriquecer datos visuales)
                const viewData: RequestView[] = data.filter(r => r.status === 'pending').map(r => ({
                    ...r,
                    responsible: r.submittedBy === 'user-1' ? 'Juan Pérez' : 'Usuario Móvil',
                    initials: r.submittedBy === 'user-1' ? 'JP' : 'UM',
                    color: "purple",
                    statusColor: r.status === 'pending' ? 'yellow' : r.status === 'approved' ? 'green' : 'red'
                }));
                // Ordenar por fecha reciente
                setRequests(viewData.reverse());
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestView | null>(null);
    const [modalMode, setModalMode] = useState<"approve" | "manage">("approve");

    const openApproveModal = (req: RequestView) => {
        setSelectedRequest(req);
        setModalMode("approve");
        setModalOpen(true);
    };

    const openManageModal = (req: RequestView) => {
        setSelectedRequest(req);
        setModalMode("manage");
        setModalOpen(true);
    };

    const confirmApprove = async (id: string) => {
        // Llamada API Real
        await fetch('/api/requests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'approved' })
        });

        await fetchRequests(); // Recargar datos
        setModalOpen(false);
        // Toast simulado
        alert("¡Solicitud aprobada y sincronizada con el territorio!");
    };

    const confirmReject = async (id: string, reason: string) => {
        await fetch('/api/requests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'rejected', feedback: reason })
        });

        await fetchRequests();
        setModalOpen(false);
        alert(`Solicitud rechazada. Motivo enviado al territorio.`);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // Mapeo simple de estados visuales a DB
        const dbStatus = newStatus === 'Urgente' ? 'needs_changes' : 'pending';

        await fetch('/api/requests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: dbStatus })
        });

        await fetchRequests();
        setModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <RequestModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                request={selectedRequest as any} // Casting rápido para compatibilidad
                mode={modalMode}
                onApprove={confirmApprove}
                onReject={confirmReject}
                onUpdateStatus={updateStatus}
            />

            {/* Sección Superior: KPIs Principales */}
            <section className="bg-white dark:bg-[#20121d] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Resumen Territorial</h3>
                        <p className="text-sm text-[#851c74] font-medium">{territoryLabel}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {hasPermission("incidents:view") && (
                        <Link href="/incidents" className="block p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-purple-100/50">
                            <div className="flex flex-col h-full justify-between">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-[#851c74] transition-colors">Alertas Activas</p>
                                <div>
                                    <p className="text-3xl font-extrabold text-[#851c74] group-hover:scale-105 transition-transform origin-left">
                                        {territoryFilter.section ? "12" : "24"}
                                    </p>
                                    <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-2 truncate">
                                        <span className="material-symbols-outlined text-sm">trending_up</span>
                                        +4 vs ayer
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {hasPermission("forms:view") && (
                        <Link href="/tasks" className="block p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-blue-100/50">
                            <div className="flex flex-col h-full justify-between">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-blue-700 transition-colors">Relevamientos</p>
                                <div>
                                    <p className="text-3xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform origin-left">
                                        {territoryFilter.section ? "45" : "158"}
                                    </p>
                                    <span className="text-xs font-medium text-green-500 flex items-center gap-1 mt-2 truncate">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        98% complet
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* KPI ACTUALIZADO: Referentes */}
                    {hasPermission("users:view") && (
                        <Link href="/team" className="block p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-orange-100/50">
                            <div className="flex flex-col h-full justify-between">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-orange-700 transition-colors">Referentes</p>
                                <div>
                                    <p className="text-3xl font-extrabold text-orange-600 group-hover:scale-105 transition-transform origin-left">
                                        {territoryFilter.section ? "85" : "420"}
                                    </p>
                                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-2 truncate">
                                        En zona operativa
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}

                    {hasPermission("projects:view") && (
                        <Link href="/projects" className="block p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-green-100/50">
                            <div className="flex flex-col h-full justify-between">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-green-700 transition-colors">Proyectos</p>
                                <div>
                                    <p className="text-3xl font-extrabold text-green-600 group-hover:scale-105 transition-transform origin-left">
                                        {territoryFilter.section ? "4" : "12"}
                                    </p>
                                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-2 truncate">
                                        Por aprobar
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            </section>

            {/* Gráficos de Analítica */}
            <DashboardAnalytics />

            {/* Centro de Acciones y Gestión */}
            <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <span className="material-symbols-outlined text-[#851c74]">grid_view</span>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Centro de Gestión</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {/* 1. Programar Alerta */}
                    {hasPermission("incidents:create") && (
                        <Link href="/alerts/schedule" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">notification_add</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Programar Alerta</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Gestión de avisos</p>
                            </div>
                        </Link>
                    )}

                    {/* 2. Bandeja de Revisión */}
                    {hasPermission("forms:review") && (
                        <Link href="/inbox/review" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">inbox</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Bandeja Revisión</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Solicitudes entrantes</p>
                            </div>
                        </Link>
                    )}

                    {/* 3. Detalle de Aprobación */}
                    {hasPermission("documents:version") && (
                        <Link href="/approvals" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">approval_delegation</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Aprobaciones</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Control de firmas</p>
                            </div>
                        </Link>
                    )}

                    {/* 4. Historial */}
                    {hasPermission("audit:view") && (
                        <Link href="/history" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 group-hover:bg-gray-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">history</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Historial</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Log de actividades</p>
                            </div>
                        </Link>
                    )}

                    {/* 5. Reasignar */}
                    {hasPermission("roles:manage") && (
                        <Link href="/tasks/reassign" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">assignment_return</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Reasignar</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Cambio responsable</p>
                            </div>
                        </Link>
                    )}

                    {/* 6. Baja Definitiva */}
                    {hasPermission("users:delete") && (
                        <Link href="/users/delete" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">person_remove</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Baja Definitiva</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Gestión usuarios</p>
                            </div>
                        </Link>
                    )}

                    {/* 7. Comprobante */}
                    {hasPermission("documents:upload") && (
                        <Link href="/documents/receipts" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">receipt_long</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Comprobante</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Generar recibos</p>
                            </div>
                        </Link>
                    )}

                    {/* 8. Firma Digital */}
                    {hasPermission("documents:version") && (
                        <Link href="/signatures" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">draw</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Firma Digital</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Certificación</p>
                            </div>
                        </Link>
                    )}

                    {/* 9. Biblioteca */}
                    {hasPermission("content:view") && (
                        <Link href="/library" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">library_books</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Biblioteca</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Recursos y Guías</p>
                            </div>
                        </Link>
                    )}

                    {/* 10. Hitos y Riesgos */}
                    {hasPermission("projects:manage") && (
                        <Link href="/milestones" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">flag</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Hitos y Riesgos</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Matriz de seguimiento</p>
                            </div>
                        </Link>
                    )}

                    {/* Extras: Comunicado */}
                    {hasPermission("content:publish") && (
                        <Link href="/news/create" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all group flex flex-col gap-2 opacity-80 hover:opacity-100">
                            <div className="w-8 h-8 rounded-lg bg-[#851c74]/10 flex items-center justify-center text-[#851c74] group-hover:bg-[#851c74] group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">campaign</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-white leading-tight">Comunicado</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">Difusión masiva</p>
                            </div>
                        </Link>
                    )}
                </div>
            </section>

            {/* Sección Central, Actividad y Tablas */}
            {hasPermission("audit:view") && (
                <section className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 space-y-6">
                        <div className="bg-white dark:bg-[#20121d] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-[300px] overflow-hidden flex flex-col">
                            <h3 className="font-bold mb-4">Actividad en Tiempo Real</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-3 items-start pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                            JP
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200">
                                                <span className="font-bold">Juan Perez</span> completó un relevamiento en <span className="text-[#851c74]">La Plata</span>.
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Hace {i * 10} minutos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tabla de Gestión */}
            {hasPermission("forms:review") && (
                <section className="bg-white dark:bg-[#20121d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="font-bold">Solicitudes Pendientes</h3>
                        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{requests.length} total</span>
                    </div>
                    <div className="overflow-x-auto">
                        {requests.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Territorio</th>
                                        <th className="px-6 py-4">Responsable</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">{req.id}</td>
                                            <td className="px-6 py-4">{req.type}</td>
                                            <td className="px-6 py-4">{req.territory}</td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-full bg-${req.color}-100 text-${req.color}-600 flex items-center justify-center text-[10px] font-bold`}>{req.initials}</div>
                                                {req.responsible}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`bg-${req.statusColor}-100 text-${req.statusColor}-700 px-2 py-1 rounded-full text-xs font-bold`}>{req.status}</span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-3">
                                                {hasPermission("forms:approve") && (
                                                    <button onClick={() => openApproveModal(req)} className="text-[#851c74] font-bold hover:underline">Aprobar</button>
                                                )}
                                                {hasPermission("forms:review") && (
                                                    <button onClick={() => openManageModal(req)} className="text-gray-500 font-bold hover:underline">Gestionar</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">inbox</span>
                                <p>No hay solicitudes pendientes.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
