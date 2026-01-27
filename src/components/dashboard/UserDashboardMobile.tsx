"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";
import { CriticalReports } from "@/components/dashboard/CriticalReports";

export default function UserDashboardMobile() {
    const { user } = useAppStore();
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        fetch('/api/dashboard/summary')
            .then(res => res.json())
            .then(setSummary)
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6 pb-24 px-1 animate-in slide-in-from-bottom-4 duration-500">
            {/* Saludo y KPIs Rápidos */}
            <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Hola, {user?.name?.split(' ')[0]}</h2>
                        <p className="text-[10px] font-black uppercase text-[#851c74] tracking-widest mt-1">Central de Operaciones</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl flex flex-col items-center">
                        <span className="text-2xl font-black text-[#851c74]">{summary?.tasks?.pending || 0}</span>
                        <span className="text-[9px] font-black uppercase text-gray-400">Tareas</span>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex flex-col items-center">
                        <span className="text-2xl font-black text-blue-600">{summary?.alerts?.unread || 0}</span>
                        <span className="text-[9px] font-black uppercase text-gray-400">Alertas</span>
                    </div>
                </div>
            </section>

            {/* Acciones Críticas */}
            <section className="grid grid-cols-1 gap-3">
                <AnnouncementFeed />
                <CriticalReports />
            </section>

            {/* Acciones Rápidas (Grid 2x2) */}
            <section>
                <div className="flex items-center gap-2 mb-4 ml-2">
                    <span className="material-symbols-outlined text-[#851c74] text-sm">widgets</span>
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Gestión Territorio</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <QuickAction icon="add_task" label="Nueva Tarea" href="/new-task" color="bg-purple-50 text-[#851c74]" />
                    <QuickAction icon="report_problem" label="Incidencia" href="/reports/new" color="bg-orange-50 text-orange-600" />
                    <QuickAction icon="menu_book" label="Biblioteca" href="/library" color="bg-blue-50 text-blue-600" />
                    <QuickAction icon="cloud_off" label="Modo Offline" href="/offline-queue" color="bg-gray-50 text-gray-600" />
                </div>
            </section>

            {/* Acceso a Hoja de Ruta */}
            <Link
                href="/tasks"
                className="block bg-black dark:bg-[#851c74] text-white p-6 rounded-[2rem] shadow-xl text-center relative overflow-hidden group active:scale-95 transition-all"
            >
                <div className="relative z-10">
                    <span className="material-symbols-outlined text-3xl mb-1">map</span>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em]">Abrir Hoja de Ruta</h4>
                </div>
                <div className="absolute inset-0 bg-white/5 group-active:bg-white/10 transition-colors"></div>
            </Link>
        </div>
    );
}

function QuickAction({ icon, label, href, color }: any) {
    return (
        <Link href={href} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95 transition-all">
            <div className={`size-10 rounded-full flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
        </Link>
    );
}
