"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Project, ProjectStatus } from "@/lib/mocks";
import Link from "next/link";
import confetti from 'canvas-confetti';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch Project Data
    useEffect(() => {
        // En una app real, haríamos fetch a /api/projects/${id}
        // Aquí simulamos buscando en el store o haciendo fetch al endpoint general y filtrando
        // Para consistencia con lo recién creado, intentaremos fetch de la lista completa (ineficiente pero funcional para prototipo)
        fetch('/api/projects')
            .then(res => res.json())
            .then((data: any[]) => {
                const found = data.find(p => p.id === id);
                if (found) setProject(found);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [id]);

    const handleStatusChange = async (newStatus: ProjectStatus) => {
        if (!project) return;
        setIsUpdating(true);

        try {
            const res = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: project.id, status: newStatus })
            });

            if (res.ok) {
                setProject({ ...project, status: newStatus });
                if (newStatus === 'approved') {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                }
            } else {
                alert("Error al actualizar estado");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando proyecto...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Proyecto no encontrado</div>;

    // Helper para colores de estado
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'approved': case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <main className="pb-24 p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-transparent min-h-screen">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <Link href="/projects" className="hover:text-[#851c74]">Proyectos</Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-gray-300 font-medium truncate">{project.title}</span>
            </div>

            {/* Title Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{project.code}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{project.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">domain</span> {project.branch}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {project.headquarterTerritory || "N/A"}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {project.deadline || "Sin fecha"}</span>
                    </div>
                </div>

                {/* Workflow Actions */}
                <div className="flex gap-2">
                    {project.status === 'draft' && (
                        <button
                            onClick={() => handleStatusChange('submitted')}
                            disabled={isUpdating}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                            ENVIAR A REVISIÓN <span className="material-symbols-outlined">send</span>
                        </button>
                    )}
                    {project.status === 'submitted' && (
                        <>
                            <button
                                onClick={() => handleStatusChange('needs_changes')}
                                disabled={isUpdating}
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                SOLICITAR CAMBIOS
                            </button>
                            <button
                                onClick={() => handleStatusChange('approved')}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                APROBAR <span className="material-symbols-outlined">check</span>
                            </button>
                        </>
                    )}
                    {project.status === 'approved' && (
                        <button
                            onClick={() => handleStatusChange('in_progress')}
                            disabled={isUpdating}
                            className="bg-[#851c74] hover:bg-[#6b165d] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                            INICIAR EJECUCIÓN <span className="material-symbols-outlined">play_arrow</span>
                        </button>
                    )}
                    {project.status === 'in_progress' && (
                        <button
                            onClick={() => handleStatusChange('completed')}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                            TERMINAR PROYECTO <span className="material-symbols-outlined">verified</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Details & Plan */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined text-[#851c74]">subject</span> Resumen Ejecutivo
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {project.description || "No hay descripción detallada disponible."}
                        </p>
                    </div>

                    {/* Milestones (Hitos) */}
                    {/* Nota: En mock puro quizás no haya hitos, mostramos UI vacía o mockeada si array existe */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">flag</span> Hitos y Planificación
                            </h2>
                            <button className="text-sm font-bold text-[#851c74] hover:underline">+ Agregar Hito</button>
                        </div>

                        <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-8">
                            {/* Empty State visual */}
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                <h3 className="text-sm font-bold text-gray-400">Inicio del Proyecto</h3>
                                <p className="text-xs text-gray-500">Fecha de creación: {new Date(project.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>

                            {/* Fictional/Loaded Milestones */}
                            {(!project.milestones || project.milestones.length === 0) && (
                                <div className="text-center py-4 text-gray-400 italic text-sm">
                                    No hay hitos definidos aún.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: KPIs & Metadata */}
                <div className="space-y-6">
                    {/* KPIs Card */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                            <span className="material-symbols-outlined text-[#851c74]">monitoring</span> KPIs
                        </h2>
                        <div className="space-y-4">
                            {project.kpis && project.kpis.map((kpi: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{kpi.name}</span>
                                        <span className="text-xs font-bold text-[#851c74] bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                                            {kpi.baseline} / {kpi.target} {kpi.unit}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#851c74] rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(((kpi.baseline || 0) / (kpi.target || 1)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                            {(!project.kpis || project.kpis.length === 0) && (
                                <p className="text-gray-400 text-sm">Sin indicadores definidos.</p>
                            )}
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Información Adicional</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-500">Prioridad</span>
                                <span className="font-medium capitalize">{project.priority}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">Tipo</span>
                                <span className="font-medium">{project.type}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500">Nivel Ter.</span>
                                <span className="font-medium capitalize">{project.territoryLevel || 'N/A'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}