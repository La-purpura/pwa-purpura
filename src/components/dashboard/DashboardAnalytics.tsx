"use client";

import { useAppStore } from "@/lib/store";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function DashboardAnalytics() {
    const territoryFilter = useAppStore((state) => state.territoryFilter);
    const territoryLabel = territoryFilter.section === "all" ? "Provincia" : territoryFilter.section;

    // Mock Data that reacts to territory (simulated)
    const multiplier = territoryFilter.section === "all" ? 5 : 1;

    const activityData = [
        { name: 'Lun', relevamientos: 40 * multiplier, validaciones: 24 * multiplier },
        { name: 'Mar', relevamientos: 30 * multiplier, validaciones: 13 * multiplier },
        { name: 'Mie', relevamientos: 20 * multiplier, validaciones: 58 * multiplier },
        { name: 'Jue', relevamientos: 27 * multiplier, validaciones: 39 * multiplier },
        { name: 'Vie', relevamientos: 18 * multiplier, validaciones: 48 * multiplier },
        { name: 'Sab', relevamientos: 23 * multiplier, validaciones: 38 * multiplier },
        { name: 'Dom', relevamientos: 34 * multiplier, validaciones: 43 * multiplier },
    ];

    const alertsData = [
        { name: 'Clima', value: 12 * multiplier },
        { name: 'Salud', value: 8 * multiplier },
        { name: 'Social', value: 24 * multiplier },
        { name: 'Infra', value: 15 * multiplier },
    ];

    return (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#20121d] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Rendimiento Semanal</h3>
                        <p className="text-xs text-gray-500">Comparativa de carga de datos en {territoryLabel}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#851c74] bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                            <span className="w-2 h-2 rounded-full bg-[#851c74]"></span>
                            Relevamientos
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full border border-cyan-100">
                            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                            Validaciones
                        </span>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#851c74" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#851c74" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="relevamientos" stroke="#851c74" strokeWidth={3} fillOpacity={1} fill="url(#colorRel)" />
                            <Area type="monotone" dataKey="validaciones" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Secondary Bar Chart */}
            <div className="bg-white dark:bg-[#20121d] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Tipos de Alerta</h3>
                    <p className="text-xs text-gray-500">Distribución por categoría</p>
                </div>

                <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={alertsData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                width={50}
                                tick={{ fontSize: 12, fill: '#6B7280', fontWeight: '500' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none' }}
                            />
                            <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">Total Activas</span>
                    <span className="text-xl font-extrabold text-orange-500">{59 * multiplier}</span>
                </div>
            </div>
        </section>
    );
}
