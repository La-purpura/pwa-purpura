"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Incident {
    id: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    address: string | null;
}

export function CriticalIncidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
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
            <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black">Incidencias Críticas</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">warning</span>
                    <h3 className="text-lg font-black">Incidencias Críticas</h3>
                </div>
                <Link
                    href="/incidents"
                    className="text-xs font-bold text-[#851c74] hover:underline"
                >
                    Ver todas
                </Link>
            </div>

            {incidents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">check_circle</span>
                    <p className="text-sm font-bold">No hay incidencias críticas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {incidents.map((incident) => (
                        <Link
                            key={incident.id}
                            href={`/incidents/${incident.id}`}
                            className="group block p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-xl border border-red-100 dark:border-red-900/30 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${incident.priority === 'CRITICAL'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-orange-500 text-white'
                                            }`}>
                                            {incident.priority}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase">
                                            {incident.category}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-[#851c74] transition-colors">
                                        {incident.title}
                                    </h4>
                                    {incident.address && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">location_on</span>
                                            <span className="truncate">{incident.address}</span>
                                        </p>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-colors text-sm">
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
