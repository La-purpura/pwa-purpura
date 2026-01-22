"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";

export default function UserDashboardMobile() {
    const user = useAppStore(state => state.user);

    return (
        <div className="space-y-6 pb-24">
            {/* Saludo Personalizado */}
            <section>
                <h2 className="text-2xl font-bold">Hola, {user?.name?.split(' ')[0] || "Compañero"}</h2>
                <p className="text-gray-500 text-sm">Tienes <span className="text-[#851c74] font-bold">3 tareas</span> pendientes hoy.</p>
                <div className="mt-4">
                    <AnnouncementFeed />
                </div>
            </section>

            {/* Widget de Progreso Rápido */}
            <section className="bg-gradient-to-br from-[#851c74] to-[#a33691] rounded-2xl p-5 text-white shadow-lg shadow-purple-900/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pt-2 pr-2">
                    <span className="material-symbols-outlined text-6xl">flag</span>
                </div>
                <p className="text-sm font-medium opacity-90 mb-1">Mi Meta Semanal</p>
                <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-extrabold">12</span>
                    <span className="text-sm opacity-80 mb-1">/ 15 Relevamientos</span>
                </div>
                <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[80%] rounded-full"></div>
                </div>
            </section>

            {/* Acciones Rápidas (Grid 2x2) */}
            <section>
                <h3 className="font-bold text-lg mb-3">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/tasks/new" className="bg-white dark:bg-[#20121d] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-purple-50 text-[#851c74] flex items-center justify-center">
                            <span className="material-symbols-outlined">add_task</span>
                        </div>
                        <span className="text-xs font-bold">Nueva Tarea</span>
                    </Link>
                    <Link href="/scan" className="bg-white dark:bg-[#20121d] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-outlined">qr_code_scanner</span>
                        </div>
                        <span className="text-xs font-bold">Escanear</span>
                    </Link>
                    {false && (
                        <Link href="/map" className="bg-white dark:bg-[#20121d] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95 transition-transform">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">map</span>
                            </div>
                            <span className="text-xs font-bold">Mi Zona</span>
                        </Link>
                    )}
                    <Link href="/offline-queue" className="bg-white dark:bg-[#20121d] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-2 aspect-[4/3] active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                            <span className="material-symbols-outlined">cloud_off</span>
                        </div>
                        <span className="text-xs font-bold">Cola Offline</span>
                    </Link>
                </div>
            </section>

            {/* Lista de Tareas Próximas */}
            <section>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-lg">Próximas Tareas</h3>
                    <Link href="/tasks" className="text-xs font-bold text-[#851c74]">Ver todas</Link>
                </div>
                <div className="space-y-3">
                    <div className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-1 h-12 bg-red-500 rounded-full"></div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Visita Barrio La Paz</h4>
                            <p className="text-xs text-gray-500">Calle 24 y Av. Libertador • 10:00 AM</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </div>
                    <div className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                        <div className="w-1 h-12 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Entrega de Insumos</h4>
                            <p className="text-xs text-gray-500">Centro Comunitario • 14:00 PM</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
