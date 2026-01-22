"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { DbTask } from "@/lib/server-db";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAppStore();
    const [task, setTask] = useState<DbTask | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        familias: "",
        necesidades: "",
        observaciones: "",
        lat: "-34.6037", // Mock GPS coords
        long: "-58.3816"
    });

    // 1. Fetch Task Details
    useEffect(() => {
        // En un app real, esto sería fetch(`/api/tasks/${params.id}`)
        // Aquí simulamos encontrando la tarea en local o fetch
        const fetchTask = async () => {
            try {
                const res = await fetch('/api/tasks'); // Traemos todas y filtramos en cliente por simplicidad del mock
                if (res.ok) {
                    const tasks: DbTask[] = await res.json();
                    // Si el ID es una seed o generado, intentamos encontrarlo
                    // Para demo, si no encuentra, mostramos la primera para que no falle la experiencia
                    const found = tasks.find(t => t.id === params.id) || tasks[0];
                    setTask(found);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTask();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: task?.id,
                    type: "Relevamiento de Campo", // Tipo inferido de la tarea
                    userId: user?.id || "anon",
                    territory: user?.territory || "Desconocido",
                    data: formData
                })
            });

            if (res.ok) {
                alert("¡Relevamiento enviado con éxito! Los datos ya están en el Dashboard.");
                router.push('/tasks'); // Volver a la lista
            } else {
                alert("Error al enviar.");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando tarea...</div>;
    if (!task) return <div className="p-8 text-center text-red-500">Tarea no encontrada.</div>;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            {/* Header Móvil */}
            <header className="bg-[#851c74] text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-white/80 hover:text-white">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Volver
                </button>

                <div className="relative z-10">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${task.priority === 'high' ? 'bg-red-500/20 text-red-100 border border-red-500/30' : 'bg-blue-500/20 text-blue-100'
                        }`}>
                        {task.priority === 'high' ? 'PRIORIDAD ALTA' : 'NORMAL'}
                    </span>
                    <h1 className="text-2xl font-bold leading-tight">{task.title}</h1>
                    <p className="text-white/80 mt-2 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {task.territory}
                    </p>
                </div>
            </header>

            {/* Contenido */}
            <div className="px-6 -mt-8 relative z-20 space-y-6">

                {/* Card: Instrucciones */}
                <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[#851c74]">info</span>
                        Instrucciones
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {task.description || "Realizar relevamiento completo en la zona asignada. Registrar todas las necesidades urgentes."}
                    </p>
                </div>

                {/* Formulario de Reporte */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">assignment</span>
                            Completar Informe
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cant. Familias Visitadas</label>
                            <input
                                required
                                type="number"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 ring-[#851c74]"
                                value={formData.familias}
                                onChange={e => setFormData({ ...formData, familias: e.target.value })}
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Necesidad Principal</label>
                            <select
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 ring-[#851c74]"
                                value={formData.necesidades}
                                onChange={e => setFormData({ ...formData, necesidades: e.target.value })}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Alimentos">Alimentos</option>
                                <option value="Salud">Salud / Medicamentos</option>
                                <option value="Infraestructura">Infraestructura / Vivienda</option>
                                <option value="Empleo">Empleo / Capacitación</option>
                                <option value="Seguridad">Seguridad</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observaciones / Detalles</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 ring-[#851c74] resize-none"
                                value={formData.observaciones}
                                onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                placeholder="Describe la situación encontrada..."
                            />
                        </div>

                        {/* Mock de Foto */}
                        <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                            <span className="text-xs font-bold">Adjuntar Evidencia (Opcional)</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 bg-[#851c74] hover:bg-[#6d165f] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#851c74]/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {submitting ? (
                            <>Enviando...</>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">send</span>
                                ENVIAR INFORME
                            </>
                        )}
                    </button>
                </form>

            </div>
        </main>
    );
}
