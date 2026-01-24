"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";
import { CriticalIncidents } from "@/components/dashboard/CriticalIncidents";

export default function UserDashboardDesktop() {
    const { user } = useAppStore();
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        fetch('/api/dashboard/summary')
            .then(res => res.json())
            .then(setSummary)
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Banner de Bienvenida Real */}
            <section className="bg-gradient-to-br from-[#851c74] to-[#581c87] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black">¡Hola, {user?.name?.split(' ')[0]}!</h2>
                        <p className="text-white/70 text-lg max-w-lg font-medium">
                            Tenés <span className="text-white font-black underline decoration-2 underline-offset-4">{summary?.tasks?.pending || 0} tareas</span> asignadas pendientes en tu zona territorial.
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] min-w-[120px] border border-white/10">
                            <span className="block text-4xl font-black mb-1">{summary?.tasks?.pending || 0}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Tareas</span>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] min-w-[120px] border border-white/10">
                            <span className="block text-4xl font-black mb-1">{summary?.alerts?.unread || 0}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Alertas</span>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-20 -bottom-20 size-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -top-20 size-80 bg-purple-400/10 rounded-full blur-3xl"></div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel Operativo Izquierdo */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#851c74]">assignment</span>
                            Mi Hoja de Ruta
                        </h3>
                        <Link href="/tasks" className="text-xs font-black uppercase text-[#851c74] hover:underline">Ver Todo</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ActionCard
                            title="Ver Tareas"
                            desc="Gestiona tus asignaciones diarias."
                            icon="checklist"
                            href="/tasks"
                            color="blue"
                        />
                        <ActionCard
                            title="Reportar Incidencia"
                            desc="Notifica problemas en territorio."
                            icon="report_problem"
                            href="/incidents/new"
                            color="orange"
                        />
                    </div>

                    {/* Placeholder for real task list preview if needed, or link to tasks */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 text-center space-y-4">
                        <span className="material-symbols-outlined text-4xl text-gray-200">rocket_launch</span>
                        <p className="text-gray-400 font-bold text-sm">Explora el mapa de tareas para comenzar tu jornada.</p>
                        <Link href="/tasks" className="inline-block bg-[#851c74] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Ir a Mis Tareas</Link>
                    </div>
                </section>

                {/* Columna Derecha Informativa */}
                <section className="space-y-6">
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                        <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">campaign</span>
                            Comunicados Recientes
                        </h4>
                        <AnnouncementFeed />
                    </div>

                    <CriticalIncidents />

                    <div className="bg-[#851c74] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-black text-lg mb-2">Biblioteca Digital</h3>
                            <p className="text-white/70 text-xs mb-6 font-medium">Accede a manuales, protocolos y materiales oficiales.</p>
                            <Link href="/library" className="bg-white text-[#851c74] w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-sm">menu_book</span>
                                Abrir Biblioteca
                            </Link>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[100px] text-white/10 group-hover:rotate-12 transition-transform duration-500">folder_open</span>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ActionCard({ title, desc, icon, href, color }: any) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/10",
        orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/10",
    } as any;

    return (
        <Link href={href} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-gray-50 dark:border-gray-800 hover:border-[#851c74]/20 hover:shadow-xl transition-all group active:scale-95">
            <div className={`size-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${colors[color]}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h4 className="font-black text-gray-900 dark:text-white mb-1">{title}</h4>
            <p className="text-xs text-gray-400 font-medium">{desc}</p>
        </Link>
    );
}
