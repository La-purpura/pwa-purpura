"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

export default function ProjectsPage() {
    const { projects, setProjects } = useAppStore();
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBranch, setFilterBranch] = useState("all");

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProjects(data);
                }
            })
            .catch(err => console.error("Error loading projects:", err));
    }, [setProjects]);

    const filteredProjects = projects.filter(p => {
        const statusMatch = filterStatus === "all" ? true : p.status === filterStatus;
        const branchMatch = filterBranch === "all" ? true : p.branch === filterBranch;
        return statusMatch && branchMatch;
    });

    return (
        <main className="pb-24 p-6 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#171216] dark:text-white">Proyectos Territoriales</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión y seguimiento de iniciativas a gran escala</p>
                </div>
                <Link
                    href="/projects/new"
                    className="bg-[#851c74] hover:bg-[#6b165d] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Proyecto
                </Link>
            </header>

            {/* Filtros */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <span className="text-xs font-bold uppercase text-gray-400 self-center mr-2">Estado:</span>
                    {["all", "draft", "submitted", "approved", "in_progress", "completed", "cancelled"].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterStatus === status
                                ? "bg-gray-800 text-white border-gray-800 dark:bg-white dark:text-black"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                        >
                            {status === "all" ? "Todos" :
                                status === "draft" ? "Borrador" :
                                    status === "submitted" ? "En Revisión" :
                                        status === "approved" ? "Aprobado" :
                                            status === "in_progress" ? "En Ejecución" : "Finalizado"}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <span className="text-xs font-bold uppercase text-gray-400 self-center mr-2">Rama:</span>
                    {["all", "General", "Infraestructura", "Salud", "Educación", "PyME"].map(branch => (
                        <button
                            key={branch}
                            onClick={() => setFilterBranch(branch)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterBranch === branch
                                ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                }`}
                        >
                            {branch === "all" ? "Todas" : branch}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid de Proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="bg-white dark:bg-[#20121d] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-[#851c74]/30 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                        {/* Status Stripe */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'in_progress' ? 'bg-blue-500' :
                            project.status === 'completed' ? 'bg-green-500' :
                                project.status === 'draft' ? 'bg-gray-300' :
                                    project.priority === 'critical' ? 'bg-red-500' : 'bg-orange-400'
                            }`}></div>

                        <div className="pl-3">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{project.branch}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${project.priority === 'high' || project.priority === 'critical' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {project.priority || 'Normal'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#851c74] transition-colors">
                                {project.title}
                            </h3>

                            <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[2.5em]">{project.description || "Sin descripción."}</p>

                            {/* KPIs Preview (Si tiene) */}
                            {project.kpis && project.kpis.length > 0 && (
                                <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{project.kpis[0].name}</span>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {project.kpis[0].baseline} / {project.kpis[0].target} {project.kpis[0].unit}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${Math.min(((project.kpis[0].baseline || 0) / (project.kpis[0].target || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800/50 mt-auto">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.preventDefault(); alert("Función Duplicar: Próximamente"); }}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-[#851c74] transition-colors"
                                        title="Duplicar Proyecto"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); alert("Exportando PDF..."); }}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-[#851c74] transition-colors"
                                        title="Exportar Reporte"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">ios_share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredProjects.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_off</span>
                        <p>No se encontraron proyectos en esta categoría.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
