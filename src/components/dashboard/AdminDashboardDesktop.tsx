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

    // Summary State
    const [summary, setSummary] = useState<any>(null);
    const [requests, setRequests] = useState<RequestView[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestView | null>(null);
    const [modalMode, setModalMode] = useState<"approve" | "manage">("approve");

    const fetchSummary = async () => {
        try {
            const res = await fetch('/api/dashboard/summary');
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (error) { console.error(error); }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (res.ok) {
                const data: any[] = await res.json();
                const viewData: any[] = data.filter(r => r.status === 'pending').map(r => ({
                    ...r,
                    responsible: r.submittedBy?.name || 'Usuario Móvil',
                    initials: (r.submittedBy?.name || 'UM').substring(0, 2).toUpperCase(),
                    color: "purple",
                    statusColor: 'amber',
                    territory: r.territory?.name || 'Nacional'
                }));
                setRequests(viewData);
            }
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        fetchSummary();
        fetchRequests();
    }, []);

    const confirmApprove = async (id: string) => {
        const res = await fetch(`/api/requests/${id}/approve`, { method: 'POST' });
        if (res.ok) {
            fetchRequests();
            fetchSummary();
            setModalOpen(false);
        }
    };

    const confirmReject = async (id: string, reason: string) => {
        const res = await fetch(`/api/requests/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: reason })
        });
        if (res.ok) {
            fetchRequests();
            fetchSummary();
            setModalOpen(false);
        }
    };

    const handleOpenRequest = (req: RequestView) => {
        setSelectedRequest(req);
        setModalMode("approve");
        setModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <RequestModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                request={selectedRequest as any}
                mode={modalMode}
                onApprove={confirmApprove}
                onReject={confirmReject}
                onUpdateStatus={() => { }}
            />

            {/* KPIs Reales */}
            <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Panel de Control Real</h3>
                        <p className="text-[10px] font-black uppercase text-[#851c74] tracking-[0.2em]">{territoryLabel}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPIComponent
                        href="/alerts"
                        label="Alertas Activas"
                        value={summary?.alerts?.active}
                        subLabel="Requieren atención"
                        color="purple"
                    />
                    <KPIComponent
                        href="/tasks"
                        label="Tareas Pendientes"
                        value={summary?.tasks?.pending}
                        subLabel={`De ${summary?.tasks?.total || 0} totales`}
                        color="blue"
                    />
                    <KPIComponent
                        href="/incidents"
                        label="Incidencias"
                        value={summary?.incidents?.total}
                        subLabel="Reportadas"
                        color="orange"
                    />
                    <KPIComponent
                        href="/projects"
                        label="Proyectos"
                        value={summary?.projects?.total}
                        subLabel="En ejecución"
                        color="green"
                    />
                </div>
            </section>

            {/* Analytics y Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <DashboardAnalytics />

                    {/* Nueva Sección: Solicitudes Pendientes */}
                    <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black uppercase tracking-tight">Validación de Solicitudes</h3>
                            <Link href="/requests" className="text-[10px] font-black uppercase text-[#851c74]">Ver todo</Link>
                        </div>

                        {requests.length === 0 ? (
                            <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/10 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">fact_check</span>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Al día. Sin solicitudes pendientes.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.slice(0, 4).map((req) => (
                                    <div
                                        key={req.id}
                                        onClick={() => handleOpenRequest(req)}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-[#851c74]/20 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center font-black">
                                                {req.initials}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm group-hover:text-[#851c74] transition-colors">{req.type}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{req.territory} • {req.responsible}</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-all">chevron_right</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
                <div className="space-y-6">
                    <AnnouncementFeed />
                    {summary?.requests?.pending > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 p-6 rounded-[2rem]">
                            <h4 className="font-black text-amber-700 dark:text-amber-500 text-xs uppercase mb-2">Solicitudes Pendientes</h4>
                            <p className="text-2xl font-black text-amber-800 dark:text-amber-400">{summary.requests.pending}</p>
                            <button
                                onClick={() => {
                                    if (requests[0]) handleOpenRequest(requests[0]);
                                }}
                                className="mt-4 w-full block text-[10px] font-black uppercase text-amber-700 bg-white shadow-sm py-2 text-center rounded-xl"
                            >
                                APROBAR PRIMERA
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Accesos Rápidos */}
            <section className="space-y-4">
                <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest ml-2">Accesos Directos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickAccess icon="record_voice_over" label="Difundir Alerta" href="/alerts" color="text-red-500" />
                    <QuickAccess icon="person_add" label="Alta Voluntario" href="/team" color="text-blue-500" />
                    <QuickAccess icon="add_task" label="Asignar Tarea" href="/new-task" color="text-green-500" />
                    <QuickAccess icon="cloud_upload" label="Biblioteca" href="/library" color="text-purple-500" />
                </div>
            </section>
        </div>
    );
}

function KPIComponent({ href, label, value, subLabel, color }: any) {
    const colors = {
        purple: "bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-900/10 dark:border-purple-800",
        blue: "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/10 dark:border-blue-800",
        orange: "bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-900/10 dark:border-orange-800",
        green: "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-800",
    } as any;

    return (
        <Link href={href} className={`block p-6 rounded-3xl border transition-all hover:shadow-lg active:scale-95 ${colors[color]}`}>
            <p className="text-[10px] font-black uppercase opacity-60 mb-2 truncate">{label}</p>
            <p className="text-4xl font-black mb-1">{value ?? '...'}</p>
            <p className="text-[10px] font-bold opacity-60">{subLabel}</p>
        </Link>
    );
}

function QuickAccess({ icon, label, href, color }: any) {
    return (
        <Link href={href} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-50 dark:border-gray-800 flex flex-col items-center gap-3 hover:border-[#851c74]/30 hover:shadow-md transition-all group">
            <span className={`material-symbols-outlined text-3xl group-hover:scale-110 transition-transform ${color}`}>{icon}</span>
            <span className="text-[10px] font-black uppercase text-center tracking-widest">{label}</span>
        </Link>
    );
}
