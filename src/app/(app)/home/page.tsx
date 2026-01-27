"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityItem {
    id: string;
    type: 'TASK' | 'INCIDENT' | 'ALERT';
    title: string;
    timestamp: string;
    user: string;
    status: string;
}

export default function HomePage() {
    const { user } = useAppStore();
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [sumRes, taskRes, incidentRes] = await Promise.all([
                    fetch('/api/dashboard/summary'),
                    fetch('/api/tasks?limit=5'),
                    fetch('/api/incidents?limit=5')
                ]);

                const sumData = await sumRes.json();
                const taskData = await taskRes.json();
                const incidentData = await incidentRes.json();

                setSummary(sumData);

                // Merge and sort activity
                const activities: ActivityItem[] = [
                    ...((Array.isArray(taskData) ? taskData : [])).map((t: any) => ({
                        id: t.id,
                        type: 'TASK' as const,
                        title: t.title,
                        timestamp: t.createdAt,
                        user: t.assigneeName || 'Sin asignar',
                        status: t.status
                    })),
                    ...((Array.isArray(incidentData) ? incidentData : [])).map((i: any) => ({
                        id: i.id,
                        type: 'INCIDENT' as const,
                        title: i.title,
                        timestamp: i.createdAt,
                        user: i.reportedBy?.alias || i.reportedBy?.name || 'Sistema',
                        status: i.status
                    }))
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);

                setRecentActivity(activities);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const todayStr = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

    return (
        <main className="min-h-screen pb-24 px-4 pt-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-1 items-center text-center">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Bitácora Territorial</h1>
                <p className="text-[10px] font-black uppercase text-[#851c74] tracking-[0.4em]">{todayStr}</p>
            </header>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Tareas" value={summary?.tasks?.pending || 0} color="bg-purple-600" />
                <StatCard label="Incidencias" value={summary?.incidents?.total || 0} color="bg-orange-500" />
                <StatCard label="Alertas" value={summary?.alerts?.active || 0} color="bg-red-500" />
                <StatCard label="Proyectos" value={summary?.projects?.total || 0} color="bg-blue-600" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-black flex items-center gap-3">
                        <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-[#851c74] material-symbols-outlined">tactic</span>
                        Últimos Movimientos
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-20 bg-gray-50 dark:bg-gray-900 animate-pulse rounded-3xl border border-transparent"></div>
                            ))
                        ) : recentActivity.length === 0 ? (
                            <div className="py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sin actividad registrada en la zona</p>
                            </div>
                        ) : (
                            recentActivity.map((activity) => (
                                <Link
                                    key={`${activity.type}-${activity.id}`}
                                    href={activity.type === 'TASK' ? `/tasks` : `/incidents/${activity.id}`}
                                    className="flex items-center gap-4 p-5 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-[#851c74]/20 transition-all group"
                                >
                                    <div className={`size-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm ${activity.type === 'TASK' ? 'bg-purple-50 text-purple-600' :
                                        activity.type === 'INCIDENT' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {activity.type === 'TASK' ? 'task_alt' : 'quick_reference_all'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#851c74]/50">
                                                {activity.type === 'TASK' ? 'Tarea Operativa' : 'Incidencia / Reporte'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {format(new Date(activity.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-gray-900 dark:text-white truncate text-sm">{activity.title}</h4>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight">
                                            Autor: <span className="text-gray-900 dark:text-gray-300">{activity.user}</span>
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-colors">chevron_right</span>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="bg-[#851c74] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2 leading-none">Mi Perfil</h3>
                            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-6">Configura tu identidad</p>
                            <Link href="/settings/profile" className="inline-flex items-center gap-2 bg-white text-[#851c74] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
                                Gestionar Perfil
                                <span className="material-symbols-outlined text-sm">person</span>
                            </Link>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500">account_circle</span>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">bolt</span>
                            Terminal de Acceso
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <QuickButton href="/tasks" label="Hojas de Ruta" icon="map" />
                            <QuickButton href="/incidents/new" label="Nueva Incidencia" icon="add_reaction" />
                            <QuickButton href="/alerts" label="Comunicaciones" icon="podcasts" />
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className={`size-1 rounded-full ${color} mb-3`}></div>
            <span className="block text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-1">{value}</span>
            <span className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</span>
        </div>
    );
}

function QuickButton({ href, label, icon }: { href: string, label: string, icon: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-[#851c74] hover:text-white transition-all group scale-100 active:scale-95 shadow-sm border border-transparent">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-white transition-colors text-xl">{icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-white text-sm transition-colors">chevron_right</span>
        </Link>
    );
}
