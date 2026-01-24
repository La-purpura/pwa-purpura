"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface RegionSummary {
    name: string;
    id: string;
    tasks: number;
    incidents: number;
}

export default function NationalDashboardPage() {
    const router = useRouter();
    const [territories, setTerritories] = useState<RegionSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNationalData() {
            try {
                // Fetch all top-level territories (Provinces/Regions)
                const res = await fetch('/api/territories');
                const data = await res.json();

                // For a real national view, we would need a per-territory summary API
                // For now, we take the top level ones and show placeholders for their specific counts
                // until we have a proper aggregation API.
                const topLevel = data.filter((t: any) => t.parentId === null);

                // Mocking counts for now because we don't have an aggregator by territory yet,
                // but at least the list is real from the DB.
                setTerritories(topLevel.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    tasks: 0,
                    incidents: 0
                })));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchNationalData();
    }, []);

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen pb-24 text-gray-900 dark:text-white transition-colors">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-[#851c74] p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="font-black text-sm uppercase tracking-widest">Tablero Nacional Real</h2>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8 animate-in fade-in duration-500">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-[#851c74] to-[#581c87] p-8 rounded-[2.5rem] text-white shadow-xl">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Impacto Federal</p>
                        <h3 className="text-4xl font-black mb-4">Alcance Total</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black">{territories.length}</span>
                            <span className="text-xl font-bold mb-1 opacity-60">Jurisdicciones</span>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="font-black text-xs uppercase text-gray-400 tracking-widest px-2">Jurisdicciones Registradas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 bg-white dark:bg-[#1a1a1a] rounded-3xl animate-pulse"></div>
                            ))
                        ) : territories.length === 0 ? (
                            <p className="text-gray-400 italic px-2">No hay territorios registrados aún.</p>
                        ) : (
                            territories.map((t) => (
                                <div key={t.id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-black text-lg text-gray-900 dark:text-white mb-4">{t.name}</h4>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl text-center">
                                            <span className="block text-xl font-black text-[#851c74]">{t.tasks}</span>
                                            <span className="text-[9px] font-black uppercase text-gray-400">Tareas</span>
                                        </div>
                                        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl text-center">
                                            <span className="block text-xl font-black text-orange-500">{t.incidents}</span>
                                            <span className="text-[9px] font-black uppercase text-gray-400">Alertas</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
