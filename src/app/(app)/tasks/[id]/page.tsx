"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAppStore();
    const { hasPermission } = useRBAC();
    const [task, setTask] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // States para acciones
    const [isReassigning, setIsReassigning] = useState(false);
    const [team, setTeam] = useState<any[]>([]);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await fetch(`/api/tasks/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTask(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchTask();
    }, [params.id]);

    const handleComplete = async () => {
        if (!confirm("¿Deseas marcar esta tarea como completada?")) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${params.id}/complete`, { method: 'POST' });
            if (res.ok) {
                setTask({ ...task, status: 'completed' });
                alert("¡Tarea completada!");
            }
        } catch (e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    const handleReassign = async (assigneeId: string) => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${params.id}/reassign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assigneeId })
            });
            if (res.ok) {
                const data = await res.json();
                setTask(data.task);
                setIsReassigning(false);
                alert("Tarea reasignada");
                // Refresh task to get new assignee name
                const tRes = await fetch(`/api/tasks/${params.id}`);
                setTask(await tRes.json());
            }
        } catch (e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    useEffect(() => {
        if (isReassigning) {
            fetch('/api/users').then(res => res.json()).then(setTeam).catch(console.error);
        }
    }, [isReassigning]);

    if (loading) return <div className="p-12 text-center animate-pulse text-[#851c74] font-bold">Cargando detalles...</div>;
    if (!task) return <div className="p-12 text-center text-red-500 font-bold">Tarea no encontrada.</div>;

    const isCompleted = task.status === 'completed';

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <header className="bg-[#851c74] text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Volver
                </button>
                <div className="relative z-10">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 ${task.priority === 'high' ? 'bg-red-500/30 text-red-100' : 'bg-blue-500/20 text-blue-100'
                        }`}>
                        {task.priority || 'Normal'}
                    </span>
                    <h1 className="text-2xl font-bold leading-tight">{task.title}</h1>
                    <div className="flex gap-4 mt-3 text-white/70 text-xs font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {task.territories?.map((t: any) => t.territory.name).join(', ') || "Global"}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {task.assignee?.name || "Sin asignar"}
                        </span>
                    </div>
                </div>
            </header>

            <div className="px-6 -mt-8 relative z-20 space-y-6">
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-2">Descripción</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {task.description || "No se proporcionó descripción."}
                    </p>
                </div>

                {!isCompleted && (
                    <div className="space-y-3">
                        <button
                            onClick={handleComplete}
                            disabled={submitting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                            <span className="material-symbols-outlined group-hover:scale-125 transition-transform">check_circle</span>
                            MARCAR COMO COMPLETADA
                        </button>

                        {(hasPermission('forms:review')) && (
                            <button
                                onClick={() => setIsReassigning(!isReassigning)}
                                className="w-full bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">person_add</span>
                                REASIGNAR TAREA
                            </button>
                        )}
                    </div>
                )}

                {isCompleted && (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 p-6 rounded-2xl text-center">
                        <span className="material-symbols-outlined text-green-500 text-5xl mb-2">verified</span>
                        <h2 className="text-green-700 dark:text-green-400 font-bold">Tarea Finalizada</h2>
                        <p className="text-green-600/70 text-xs mt-1">Esta tarea ya no requiere más acciones.</p>
                    </div>
                )}

                {/* Modal/Dropdown Reasignar */}
                {isReassigning && (
                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-[#851c74]/20 animate-in slide-in-from-top-4 duration-300">
                        <h4 className="font-bold mb-4 text-sm">Seleccionar Nuevo Asignado</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                            {team.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => handleReassign(u.id)}
                                    className="w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-sm flex items-center justify-between group"
                                >
                                    <span>{u.name} <span className="text-[10px] text-gray-400">({u.role})</span></span>
                                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 text-[#851c74]">chevron_right</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsReassigning(false)} className="w-full mt-4 text-gray-400 text-xs font-bold uppercase">Cancelar</button>
                    </div>
                )}
            </div>
        </main>
    );
}
