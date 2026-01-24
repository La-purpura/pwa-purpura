"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRBAC } from "@/hooks/useRBAC";
import { EmptyState } from "@/components/common/EmptyState";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBranch, setFilterBranch] = useState("all");
    const { hasPermission } = useRBAC();

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p => {
        const statusMatch = filterStatus === "all" ? true : p.status === filterStatus;
        const branchMatch = filterBranch === "all" ? true : p.branch === filterBranch;
        return statusMatch && branchMatch;
    });

    const statusLabels: any = {
        draft: "Borrador",
        submitted: "En Revisión",
        needs_changes: "Requiere Cambios",
        approved: "Aprobado",
        in_progress: "En Ejecución",
        paused: "Pausado",
        completed: "Finalizado",
        cancelled: "Cancelado"
    };

    return (
        <main className="pb-24 p-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#171216] dark:text-white">Proyectos Territoriales</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión y seguimiento de iniciativas a gran escala</p>
                </div>
                {hasPermission('projects:create') && (
                    <Link
                        href="/projects/new"
                        className="bg-[#851c74] hover:bg-[#6b165d] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Nuevo Proyecto
                    </Link>
                )}
            </header>

            {/* Filtros */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <span className="text-xs font-bold uppercase text-gray-400 self-center mr-2">Estado:</span>
                    {["all", ...Object.keys(statusLabels)].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterStatus === status
                                ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-black"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                        >
                            {status === "all" ? "Todos" : statusLabels[status]}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <span className="text-xs font-bold uppercase text-gray-400 self-center mr-2">Rama:</span>
                    {["all", "General", "Infraestructura", "Salud", "Educación", "Economía Popular"].map(branch => (
                        <button
                            key={branch}
                            onClick={() => setFilterBranch(branch)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterBranch === branch
                                ? "bg-[#851c74] text-white border-[#851c74]"
                                : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800"
                                }`}
                        >
                            {branch === "all" ? "Todas" : branch}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-[#851c74] border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-[#851c74]/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#851c74]">{project.branch}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${project.priority === 'high' || project.priority === 'critical' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'
                                    }`}>
                                    {project.priority}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#851c74] transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">{project.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50">
                                <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">flag</span>
                                    {project.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                    {project.territories?.length || 0} Territorios
                                </span>
                            </div>
                        </Link>
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="col-span-full">
                            <EmptyState
                                icon="folder_off"
                                title="Sin Proyectos"
                                description="No se encontraron proyectos activos que coincidan con los filtros seleccionados."
                            />
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
