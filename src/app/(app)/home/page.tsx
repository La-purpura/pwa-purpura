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
                const [sumRes, taskRes, incRes] = await Promise.all([
                    fetch('/api/dashboard/summary'),
                    fetch('/api/tasks?limit=5'),
                    fetch('/api/incidents?limit=5')
                ]);

                const sumData = await sumRes.json();
                const taskData = await taskRes.json();
                const incData = await incRes.json();

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
                    ...((Array.isArray(incData) ? incData : [])).map((i: any) => ({
                        id: i.id,
                        type: 'INCIDENT' as const,
                        title: i.title,
                        timestamp: i.createdAt,
                        user: i.reportedBy?.name || 'Sistema',
                        status: i.status
                    }))
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

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
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">Resumen Diario</h1>
                <p className="text-xs font-black uppercase text-[#851c74] tracking-[0.3em]">{todayStr}</p>
            </header>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Tareas" value={summary?.tasks?.pending || 0} color="bg-purple-600" />
                <StatCard label="Incidencias" value={summary?.incidents?.total || 0} color="bg-orange-500" />
                <StatCard label="Alertas" value={summary?.alerts?.active || 0} color="bg-red-500" />
                <StatCard label="Proyectos" value={summary?.projects?.total || 0} color="bg-blue-600" />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#851c74]">tactic</span>
                        Actividad en Tiempo Real
                    </h2>

                    <div className="space-y-4">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl"></div>
                            ))
                        ) : recentActivity.length === 0 ? (
                            <p className="text-gray-400 italic text-center py-10">No hay actividad reciente registrada.</p>
                        ) : (
                            recentActivity.map((activity) => (
                                <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                                    <div className={`mt-1 size-10 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'TASK' ? 'bg-purple-100 text-purple-600' :
                                            activity.type === 'INCIDENT' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-lg">
                                            {activity.type === 'TASK' ? 'task_alt' : 'report_problem'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {activity.type === 'TASK' ? 'Tarea' : 'Incidencia'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-300">
                                                {format(new Date(activity.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{activity.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Por <span className="font-bold text-gray-700 dark:text-gray-300">{activity.user}</span> •
                                            <span className={`ml-1 uppercase font-black text-[9px] ${activity.status === 'PENDING' || activity.status === 'pending' ? 'text-amber-500' : 'text-green-500'}`}>
                                                {activity.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="bg-[#851c74] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-2">Comandancia</h3>
                            <p className="text-white/70 text-sm mb-6">Accede a las herramientas críticas de gestión territorial.</p>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-[#851c74] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                Panel de Control
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/10 rotate-12">dashboard</span>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">quick_reference</span>
                            Acciones Rápidas
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            <QuickButton href="/new-task" label="Crear Tarea" icon="add_task" />
                            <QuickButton href="/incidents/new" label="Reportar Evento" icon="report_gmailerrorred" />
                            <QuickButton href="/alerts" label="Emitir Broadcast" icon="podcasts" />
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className={`size-1.5 rounded-full ${color}`}></div>
            <div>
                <span className="block text-xl font-black text-gray-900 dark:text-white tracking-tight">{value}</span>
                <span className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</span>
            </div>
        </div>
    );
}

function QuickButton({ href, label, icon }: { href: string, label: string, icon: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-[#851c74]/5 hover:text-[#851c74] transition-all group">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-[#851c74] transition-colors">{icon}</span>
                <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
            </div>
            <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
        </Link>
    );
}
