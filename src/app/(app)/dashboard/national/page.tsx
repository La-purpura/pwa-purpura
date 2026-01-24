"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface RegionSummary {
    name: string;
    id: string;
    tasks: number;
    reports: number;
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
                    reports: 0
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
                    <button onClick={() => router.back()} className="text-[#851c74] p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all active:scale-95">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2 className="font-black text-xs uppercase tracking-widest text-[#851c74]">Estado Federal</h2>
                    <div className="w-10" />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8 animate-in fade-in duration-500">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#851c74] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Métricas Globales</p>
                            <h3 className="text-4xl font-black mb-1">Alcance Total</h3>
                            <div className="flex items-end gap-3">
                                <span className="text-6xl font-black">{territories.length}</span>
                                <span className="text-sm font-bold mb-3 opacity-60 uppercase tracking-widest">Territorios</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-[120px] text-white/10 group-hover:rotate-12 transition-transform duration-700">public</span>
                    </div>
                </section>

                <section className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-gray-400 tracking-[0.3em] px-2 flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#851c74]"></span>
                        Jurisdicciones Activas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-40 bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] animate-pulse"></div>
                            ))
                        ) : territories.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-dashed border-gray-100 dark:border-gray-800">
                                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Sin territorios registrados</p>
                            </div>
                        ) : (
                            territories.map((t) => (
                                <div key={t.id} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#851c74]/20 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{t.name}</h4>
                                        <span className="material-symbols-outlined text-gray-200 group-hover:text-[#851c74] transition-colors">arrow_outward</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent group-hover:border-[#851c74]/10 transition-all">
                                            <span className="block text-2xl font-black text-[#851c74] leading-none mb-1">{t.tasks}</span>
                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Tareas</span>
                                        </div>
                                        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent group-hover:border-orange-500/10 transition-all">
                                            <span className="block text-2xl font-black text-orange-500 leading-none mb-1">{t.reports}</span>
                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Reportes</span>
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
