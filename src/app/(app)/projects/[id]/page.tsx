"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";
import { PROJECT_STATUS_FLOW } from "@/lib/projects";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { hasPermission, user } = useRBAC();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${params.id}`);
            if (res.ok) setProject(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProject();
    }, [params.id]);

    const handleStatusChange = async (nextStatus: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/projects/${params.id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                fetchProject();
                alert(`Estado actualizado a ${nextStatus}`);
            } else {
                const err = await res.json();
                alert(err.error || "Error al cambiar estado");
            }
        } catch (e) { alert("Error de conexión"); }
        finally { setActionLoading(false); }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-[#851c74] font-bold">Cargando proyecto...</div>;
    if (!project) return <div className="p-20 text-center text-red-500 font-bold">Proyecto no encontrado.</div>;

    const allowedTransitions = PROJECT_STATUS_FLOW[project.status as keyof typeof PROJECT_STATUS_FLOW] || [];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 p-6 flex items-center gap-4">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-[#851c74] transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-[#851c74]/10 text-[#851c74] px-2 py-0.5 rounded-full uppercase tracking-widest">{project.code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {project.status.replace('_', ' ')}
                        </span>
                    </div>
                    <h1 className="text-xl font-bold dark:text-white">{project.title}</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Info General */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Descripción</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{project.description}</p>
                        </div>

                        {/* Hitos */}
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex justify-between items-center">
                                Hitos Críticos
                                {hasPermission('projects:create') && (
                                    <button className="text-[#851c74] hover:underline">Gestionar</button>
                                )}
                            </h3>
                            <div className="space-y-4">
                                {project.milestones?.length > 0 ? project.milestones.map((m: any) => (
                                    <div key={m.id} className="flex items-start gap-4">
                                        <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${m.status === 'completed' ? 'bg-green-500 text-white' : 'border-2 border-gray-200 dark:border-gray-700 text-gray-300'}`}>
                                            {m.status === 'completed' && <span className="material-symbols-outlined text-xs">check</span>}
                                        </div>
                                        <div className="flex-1 border-b border-gray-50 dark:border-gray-800 pb-3">
                                            <p className={`text-sm font-bold ${m.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{m.name}</p>
                                            {m.endDate && <p className="text-[10px] text-gray-400 mt-0.5">Vence: {new Date(m.endDate).toLocaleDateString()}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-gray-400 italic">No se han definido hitos aún.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lateral Acciones */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Control de Flujo</h3>
                            <div className="space-y-2">
                                {allowedTransitions.map(st => (
                                    <button
                                        key={st}
                                        disabled={actionLoading}
                                        onClick={() => handleStatusChange(st)}
                                        className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-[#851c74] hover:text-white transition-all text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                                    >
                                        {st.replace('_', ' ')}
                                    </button>
                                ))}
                                {allowedTransitions.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-2 italic">Estado Final Alcanzado</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Resumen Territorial</h3>
                            <div className="space-y-3">
                                {project.territories?.map((t: any) => (
                                    <div key={t.territoryId} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm text-[#851c74]">location_on</span>
                                        <span className="text-xs font-bold">{t.territory.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-4 border-t border-white/10">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Líder Proyecto</p>
                                <p className="text-sm font-bold mt-1 text-[#851c74]">{project.leader?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}