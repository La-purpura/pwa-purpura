"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    address: string | null;
}

export function CriticalReports() {
    const [incidents, setIncidents] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCriticalIncidents = async () => {
            try {
                const res = await fetch('/api/incidents?priority=CRITICAL&priority=HIGH&limit=3');
                if (res.ok) {
                    const data = await res.json();
                    setIncidents(data.slice(0, 3));
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCriticalIncidents();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black uppercase tracking-tight">Incidencias Críticas</h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-red-600 text-lg">priority_high</span>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Incidencias Críticas</h3>
                </div>
                <Link
                    href="/incidents"
                    className="text-[10px] font-black uppercase tracking-widest text-[#851c74] hover:bg-[#851c74]/5 px-3 py-1.5 rounded-lg transition-all"
                >
                    Ver Todo
                </Link>
            </div>

            {incidents.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">verified</span>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">Sin eventos críticos</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {incidents.map((incident) => (
                        <Link
                            key={incident.id}
                            href={`/incidents/${incident.id}`}
                            className="group block p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-[#851c74]/20 hover:bg-white dark:hover:bg-gray-800 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${incident.priority === 'CRITICAL'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-orange-500 text-white'
                                            }`}>
                                            {incident.priority}
                                        </span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {incident.category}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-sm mb-1 line-clamp-1 group-hover:text-[#851c74] transition-colors leading-tight">
                                        {incident.title}
                                    </h4>
                                    {incident.address && (
                                        <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                                            <span className="material-symbols-outlined text-xs">location_on</span>
                                            <span className="truncate">{incident.address}</span>
                                        </p>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-all text-base self-center translate-x-0 group-hover:translate-x-1">
                                    chevron_right
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
