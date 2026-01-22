"use client";

import Link from "next/link";
import { AnnouncementFeed } from "@/components/dashboard/AnnouncementFeed";

export default function AdminDashboardMobile() {
    return (
        <div className="space-y-6 pb-24">
            {/* Resumen Compacto */}
            <section className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
                        <span className="material-symbols-outlined text-lg">warning</span>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-[#171216] dark:text-white block">24</span>
                        <span className="text-xs text-gray-500 font-bold uppercase">Alertas Activas</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-32">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                        <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
                    </div>
                    <div>
                        <span className="text-2xl font-extrabold text-[#171216] dark:text-white block">85%</span>
                        <span className="text-xs text-gray-500 font-bold uppercase">Objetivos Mes</span>
                    </div>
                </div>
            </section>

            {/* Mapa Miniatura (Acceso Rápido) */}
            {false && (
                <section className="bg-white dark:bg-[#20121d] p-1 rounded-2xl shadow-sm overflow-hidden">
                    <div className="relative h-40 bg-gray-200 rounded-xl overflow-hidden">
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqcyGJX9LOfEW-hz4cG26XjtheNk23scDQklBKLZIoEsykbUsSFzqSy9dO3GND0XxVYoTHfLxMiMTfO3SlBy76ZN2CKQb9JDfvQWtAjek2z2NZcV3W3U94fkoklQ7I-GykPrc1HHnG4yI0tnZGnO_H3HaDTgh7roioVrfo81MgYA5iwza-dd7S8VUOxb5sqvtGpvJOAd--P4eZgfcvSN21u5UtvOF5BHcnfemtXKQXpVP2YyvQAhF7IMWifPHxauuNfxIb1XaoW5g"
                            className="w-full h-full object-cover"
                            alt="Mapa Miniatura"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Link href="/map" className="bg-white text-[#851c74] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
                                <span className="material-symbols-outlined text-sm">map</span>
                                Abrir Mapa Completo
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Comunicados */}
            <AnnouncementFeed />

            {/* Lista de Actividad Reciente (Estilo Feed) */}
            <section>
                <h3 className="text-lg font-bold mb-4 px-1">Lo Último</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-[#20121d] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                                {i === 1 ? 'JP' : i === 2 ? 'MG' : 'CR'}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium leading-tight mb-1">
                                    <span className="font-bold text-[#851c74]">{i === 1 ? 'Juan Pérez' : i === 2 ? 'Marta' : 'Carlos'}</span> {i === 1 ? 'reportó una incidencia crítica' : 'completó una tarea'}.
                                </p>
                                <p className="text-xs text-gray-400">Hace {i} horas • {i === 1 ? 'La Plata' : 'San Isidro'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Acciones Rápidas Flotantes o Bottom Sheet (Simulado) */}
            <section className="grid grid-cols-2 gap-3">
                <Link href="/tasks/create" className="p-4 bg-[#851c74]/5 border border-[#851c74]/20 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#851c74]">add_circle</span>
                    <span className="text-sm font-bold text-[#851c74]">Nueva Tarea</span>
                </Link>
                <Link href="/news/create" className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-orange-600">campaign</span>
                    <span className="text-sm font-bold text-orange-600">Difusión</span>
                </Link>
            </section>
        </div>
    );
}
