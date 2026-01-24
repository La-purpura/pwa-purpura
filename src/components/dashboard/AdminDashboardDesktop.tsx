"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RequestModal } from "@/components/dashboard/RequestModal";
import { useAppStore } from "@/lib/store";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { useRBAC } from "@/hooks/useRBAC";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";

interface RequestView {
    id: string;
    type: string;
    territory: string;
    responsible: string;
    initials: string;
    color: string;
    status: string;
    statusColor: string;
    [key: string]: any;
}

export default function AdminDashboardDesktop() {
    const { hasPermission } = useRBAC();
    const territoryFilter = useAppStore((state) => state.territoryFilter);
    const territoryLabel = territoryFilter.section ? "Territorio Filtrado" : "Vista Global";

    // Stats State
    const [stats, setStats] = useState({
        activeAlerts: 0,
        totalTasks: 0,
        pendingTasks: 0,
        totalUsers: 0
    });

    const [requests, setRequests] = useState<RequestView[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestView | null>(null);
    const [modalMode, setModalMode] = useState<"approve" | "manage">("approve");

    // Fetch Data
    useEffect(() => {
        // 1. Stats
        fetch('/api/reports/stats')
            .then(res => res.json())
            .then(data => { if (data.totalTasks !== undefined) setStats(data); })
            .catch(console.error);

        // 2. Requests
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (res.ok) {
                const data: any[] = await res.json();
                // Adapter
                const viewData: any[] = data.filter(r => r.status === 'pending').map(r => ({
                    ...r,
                    responsible: 'Usuario Móvil',
                    initials: 'UM',
                    color: "purple",
                    statusColor: 'yellow'
                }));
                setRequests(viewData.reverse());
            }
        } catch (error) { console.error(error); }
    };

    // Modal Handlers
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
        const res = await fetch(`/api/requests/${id}/approve`, {
            method: 'POST'
        });
        if (res.ok) {
            await fetchRequests();
            setModalOpen(false);
            alert("Solicitud aprobada");
        } else {
            alert("Error al aprobar");
        }
    };

    const confirmReject = async (id: string, reason: string) => {
        const res = await fetch(`/api/requests/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: reason })
        });
        if (res.ok) {
            await fetchRequests();
            setModalOpen(false);
            alert("Solicitud rechazada");
        } else {
            alert("Error al rechazar");
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        // En un dashboard real, este 'updateStatus' podría ser un PATCH directo si es un cambio genérico
        await fetch(`/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus === 'Urgente' ? 'pending' : 'pending' }) // Placeholder logic
        });
        await fetchRequests();
        setModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <RequestModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                request={selectedRequest as any}
                mode={modalMode}
                onApprove={confirmApprove}
                onReject={confirmReject}
                onUpdateStatus={updateStatus}
            />

            {/* KPIs */}
            <section className="bg-white dark:bg-[#20121d] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Resumen Operativo</h3>
                        <p className="text-sm text-[#851c74] font-medium">{territoryLabel}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/alerts" className="block p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-purple-100/50">
                        <div className="flex flex-col h-full justify-between">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-[#851c74] transition-colors">Alertas Activas</p>
                            <div>
                                <p className="text-3xl font-extrabold text-[#851c74] group-hover:scale-105 transition-transform origin-left">
                                    {stats.activeAlerts}
                                </p>
                                <span className="text-xs font-medium text-gray-500 mt-2 block">Monitoreo activo</span>
                            </div>
                        </div>
                    </Link>

                    <Link href="/tasks" className="block p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-blue-100/50">
                        <div className="flex flex-col h-full justify-between">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-blue-700 transition-colors">Tareas Totales</p>
                            <div>
                                <p className="text-3xl font-extrabold text-blue-600 group-hover:scale-105 transition-transform origin-left">
                                    {stats.totalTasks}
                                </p>
                                <span className="text-xs font-medium text-blue-500 mt-2 block">
                                    {stats.pendingTasks} pendientes
                                </span>
                            </div>
                        </div>
                    </Link>

                    <Link href="/team" className="block p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-orange-100/50">
                        <div className="flex flex-col h-full justify-between">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-orange-700 transition-colors">Usuarios</p>
                            <div>
                                <p className="text-3xl font-extrabold text-orange-600 group-hover:scale-105 transition-transform origin-left">
                                    {stats.totalUsers}
                                </p>
                                <span className="text-xs font-medium text-gray-500 mt-2 block">Registrados</span>
                            </div>
                        </div>
                    </Link>

                    <Link href="/projects" className="block p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 transition-hover hover:shadow-md min-w-0 group cursor-pointer hover:bg-green-100/50">
                        <div className="flex flex-col h-full justify-between">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1 truncate group-hover:text-green-700 transition-colors">Proyectos</p>
                            <div>
                                <p className="text-3xl font-extrabold text-green-600 group-hover:scale-105 transition-transform origin-left">
                                    -
                                </p>
                                <span className="text-xs font-medium text-gray-500 mt-2 block">En desarrollo</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Gráficos y Comunicados */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <DashboardAnalytics />
                </div>
                <div>
                    <AnnouncementFeed />
                </div>
            </div>

            {/* Accesos Directos */}
            <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <span className="material-symbols-outlined text-[#851c74]">grid_view</span>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">Centro de Gestión</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {hasPermission("incidents:create") && (
                        <Link href="/alerts" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all flex flex-col gap-2 group">
                            <span className="material-symbols-outlined text-orange-600 group-hover:scale-110 transition-transform">notification_add</span>
                            <span className="font-bold text-sm">Alertas</span>
                        </Link>
                    )}
                    {hasPermission("users:invite") && (
                        <Link href="/team" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all flex flex-col gap-2 group">
                            <span className="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">person_add</span>
                            <span className="font-bold text-sm">Invitar Usuario</span>
                        </Link>
                    )}
                    {hasPermission("forms:create") && (
                        <Link href="/new-task" className="p-4 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-md hover:border-[#851c74]/30 transition-all flex flex-col gap-2 group">
                            <span className="material-symbols-outlined text-green-600 group-hover:scale-110 transition-transform">add_task</span>
                            <span className="font-bold text-sm">Nueva Tarea</span>
                        </Link>
                    )}
                </div>
            </section>

            {/* Tabla de Requests (Solo visible si hay requests) */}
            {requests.length > 0 && hasPermission("forms:review") && (
                <section className="bg-white dark:bg-[#20121d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold">Solicitudes Recientes</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-500">Listado de solicitudes pendientes de aprobación...</p>
                        {/* Tabla simplificada por brevedad en M7 */}
                    </div>
                </section>
            )}
        </div>
    );
}
