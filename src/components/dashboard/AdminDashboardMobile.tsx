import Link from "next/link";
import { useState, useEffect } from "react";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";
import { CriticalIncidents } from "@/components/dashboard/CriticalIncidents";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminDashboardMobile() {
    const { hasPermission } = useRBAC();

    // Stats State
    const [stats, setStats] = useState({
        activeAlerts: 0,
        totalTasks: 0,
        pendingTasks: 0,
        totalUsers: 0
    });

    const [requests, setRequests] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Fetch Stats
        Promise.all([
            fetch('/api/reports/stats').then(res => res.json()),
            fetch('/api/requests').then(res => res.json())
        ]).then(([statsData, requestsData]) => {
            if (statsData.totalTasks !== undefined) setStats(statsData);
            if (Array.isArray(requestsData)) {
                const pending = requestsData.filter((r: any) => r.status === 'pending').slice(0, 3);
                setRequests(pending);
            }
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Resumen Compacto */}
            <section className="grid grid-cols-2 gap-3">
                <Link href="/alerts" className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 active:scale-95 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-primary mb-2">
                        <span className="material-symbols-outlined text-lg">notifications</span>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-[#171216] dark:text-white block">{stats.activeAlerts}</span>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">Alertas Activas</span>
                    </div>
                </Link>
                <Link href="/team" className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32 active:scale-95 transition-transform">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-2">
                        <span className="material-symbols-outlined text-lg">group</span>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-[#171216] dark:text-white block">{stats.totalUsers}</span>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">Integrantes</span>
                    </div>
                </Link>
            </section>

            {/* Analíticas */}
            <section className="bg-white dark:bg-[#20121d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-sm">Resumen de Operación</h3>
                </div>
                <div className="p-2 overflow-x-auto">
                    <div className="min-w-[400px]">
                        <DashboardAnalytics />
                    </div>
                </div>
            </section>

            {/* Comunicados */}
            <AnnouncementFeed />

            {/* Incidencias Críticas */}
            <CriticalIncidents />

            {/* Lista de Actividad Reciente Real */}
            <section>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold">Solicitudes Recientes</h3>
                    <Link href="/reports" className="text-xs font-bold text-primary">Ver todas</Link>
                </div>
                <div className="space-y-3">
                    {requests.length > 0 ? (
                        requests.map((req, i) => (
                            <div key={req.id} className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-3 active:scale-[0.98] transition-transform">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex-shrink-0 flex items-center justify-center font-bold text-primary">
                                    {req.type.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-tight mb-1 truncate">
                                        Solicitud de <span className="font-bold text-primary">{req.type}</span> en {req.territoryId || 'Territorio'}.
                                    </p>
                                    <p className="text-xs text-gray-400">Pendiente de revisión</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500">No hay solicitudes pendientes</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Acciones Rápidas con Permisos */}
            <section className="grid grid-cols-2 gap-3">
                {hasPermission("forms:create") && (
                    <Link href="/new-task" className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-primary">add_task</span>
                        <span className="text-sm font-bold text-primary">Nueva Tarea</span>
                    </Link>
                )}
                {hasPermission("users:invite") && (
                    <Link href="/team/invite" className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl flex items-center gap-3 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-orange-600">person_add</span>
                        <span className="text-sm font-bold text-orange-600">Invitar</span>
                    </Link>
                )}
            </section>
        </div >
    );
}
