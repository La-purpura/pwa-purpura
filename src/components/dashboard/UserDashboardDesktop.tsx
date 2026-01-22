"use client";

import Link from "next/link";

export default function UserDashboardDesktop() {
    return (
        <div className="space-y-8">
            {/* Banner de Bienvenida y KPIs Personales */}
            <section className="bg-gradient-to-r from-[#851c74] to-[#581c87] rounded-3xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold mb-2">¡Hola, Ricardo!</h2>
                        <p className="opacity-90 max-w-lg">Aquí tienes el resumen de tu actividad en <span className="font-bold bg-white/20 px-2 py-0.5 rounded">San Isidro</span>. Tienes 3 tareas prioritarias para hoy.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl min-w-[100px]">
                            <span className="block text-3xl font-bold">12</span>
                            <span className="text-xs uppercase opacity-80">Pendientes</span>
                        </div>
                        <div className="text-center bg-white/10 backdrop-blur-sm p-4 rounded-xl min-w-[100px]">
                            <span className="block text-3xl font-bold">85%</span>
                            <span className="text-xs uppercase opacity-80">Efectividad</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-3 gap-8">
                {/* Columna Izquierda: Mis Tareas (Kanban Simplificado) */}
                <section className="col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">Mis Tareas Asignadas</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm bg-white dark:bg-[#20121d] rounded-lg shadow-sm font-medium hover:bg-gray-50">Por Hacer</button>
                            <button className="px-3 py-1 text-sm text-gray-400 hover:text-gray-600 font-medium">Completadas</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tarjeta de Tarea */}
                        <div className="bg-white dark:bg-[#20121d] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <div className="mb-3 flex justify-between items-start">
                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Prioridad Alta</span>
                                <button className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">more_vert</span></button>
                            </div>
                            <h4 className="font-bold text-lg mb-2 group-hover:text-[#851c74] transition-colors">Relevamiento Barrio Norte</h4>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">Completar encuestas de satisfacción vecinal en las 4 manzanas principales.</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    Vence Hoy
                                </div>
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta de Tarea 2 */}
                        <div className="bg-white dark:bg-[#20121d] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="mb-3 flex justify-between items-start">
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Mantenimiento</span>
                            </div>
                            <h4 className="font-bold text-lg mb-2 group-hover:text-[#851c74] transition-colors">Revisión de Luminarias</h4>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">Checkear estado de postes en Av. Centenario.</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    Mañana
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Columna Derecha: Avisos y Materiales */}
                <section className="space-y-6">
                    <div className="bg-white dark:bg-[#20121d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <h3 className="font-bold mb-4">Avisos Recientes</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-[#851c74] mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold">Reunión de Equipo</p>
                                    <p className="text-xs text-gray-500">Mañana 09:00 AM - Sede Central</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-bold">Alerta Meteorológica</p>
                                    <p className="text-xs text-gray-500">Vientos fuertes pronosticados para la tarde.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#851c74]/5 rounded-2xl p-6 border border-[#851c74]/10">
                        <h3 className="font-bold text-[#851c74] mb-2">Materiales Útiles</h3>
                        <p className="text-xs text-gray-600 mb-4">Accede a guías y formularios rápidos.</p>
                        <div className="space-y-2">
                            <button className="w-full bg-white text-[#851c74] py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Descargar Planilla
                            </button>
                            <button className="w-full bg-[#851c74] text-white py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">add</span>
                                Nuevo Reporte
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
