"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";
import { CriticalReports } from "@/components/dashboard/CriticalReports";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminDashboardMobile() {
    const { hasPermission } = useRBAC();
    const [summary, setSummary] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [summaryRes, requestsRes] = await Promise.all([
                fetch('/api/dashboard/summary'),
                fetch('/api/requests')
            ]);

            if (summaryRes.ok) setSummary(await summaryRes.json());
            if (requestsRes.ok) {
                const data = await requestsRes.json();
                setRequests(data.filter((r: any) => r.status === 'pending').slice(0, 3));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#851c74]/20 border-t-[#851c74]"></div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sincronizando Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 px-1 animate-in slide-in-from-bottom-4 duration-500">
            {/* Resumen Operativo Compacto */}
            <section className="grid grid-cols-2 gap-3">
                <DashboardCard
                    href="/alerts"
                    icon="notifications"
                    label="Alertas"
                    value={summary?.alerts?.active}
                    color="bg-purple-50 text-[#851c74] dark:bg-purple-900/20"
                />
                <DashboardCard
                    href="/team"
                    icon="group"
                    label="Agentes"
                    value={summary?.users?.active}
                    color="bg-orange-50 text-orange-600 dark:bg-orange-900/20"
                />
                <DashboardCard
                    href="/tasks"
                    icon="assignment"
                    label="Pendientes"
                    value={summary?.tasks?.pending}
                    color="bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                />
                <DashboardCard
                    href="/requests"
                    icon="pending_actions"
                    label="Solicitudes"
                    value={summary?.requests?.pending}
                    color="bg-amber-50 text-amber-600 dark:bg-amber-900/20"
                />
            </section>

            {/* Analíticas Simplificadas */}
            <section className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-black text-xs uppercase tracking-widest">Actividad Semanal</h3>
                    <span className="material-symbols-outlined text-gray-300">query_stats</span>
                </div>
                <div className="p-2 overflow-x-auto no-scrollbar">
                    <div className="min-w-[450px]">
                        <DashboardAnalytics />
                    </div>
                </div>
            </section>

            <AnnouncementFeed />
            <CriticalReports />

            {/* Solicitudes de Revisión */}
            {requests.length > 0 && (
                <section className="space-y-3">
                    <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest ml-2">Revisión de Datos</h3>
                    {requests.map((req) => (
                        <Link
                            key={req.id}
                            href="/requests"
                            className="bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 active:scale-[0.98] transition-all"
                        >
                            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center font-black text-amber-600">
                                <span className="material-symbols-outlined text-sm">contact_support</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold leading-tight mb-0.5 truncate text-gray-900 dark:text-white">
                                    Solicitud de {req.type}
                                </p>
                                <p className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter">Pendiente de validación final</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                        </Link>
                    ))}
                </section>
            )}

            {/* Acciones de Liderazgo */}
            <section className="grid grid-cols-2 gap-3">
                {hasPermission("forms:create") && (
                    <Link href="/new-task" className="p-5 bg-[#851c74] text-white rounded-[2rem] flex flex-col items-center gap-2 shadow-lg shadow-purple-900/20 active:scale-95 transition-all">
                        <span className="material-symbols-outlined">add_task</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Asignar Tarea</span>
                    </Link>
                )}
                <Link href="/alerts" className="p-5 bg-black text-white rounded-[2rem] flex flex-col items-center gap-2 shadow-lg active:scale-95 transition-all">
                    <span className="material-symbols-outlined">campaign</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Difundir</span>
                </Link>
            </section>
        </div>
    );
}

function DashboardCard({ href, icon, label, value, color }: any) {
    return (
        <Link href={href} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between aspect-square active:scale-95 transition-all">
            <div className={`size-10 rounded-2xl flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div>
                <span className="text-2xl font-black text-gray-900 dark:text-white block leading-none">{value ?? '0'}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 block">{label}</span>
            </div>
        </Link>
    );
}
