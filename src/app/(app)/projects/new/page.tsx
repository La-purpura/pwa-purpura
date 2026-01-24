"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";

// Definición de Pasos
const STEPS = [
    { id: 1, title: "Identidad y Alcance", icon: "flag" },
    { id: 2, title: "Objetivo y KPIs", icon: "target" },
    { id: 3, title: "Hitos Críticos", icon: "schedule" }
];

export default function NewProjectPage() {
    const router = useRouter();
    const { user } = useRBAC();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auxiliares
    const [territories, setTerritories] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/territories').then(res => res.json()).then(setTerritories).catch(console.error);
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        branch: "General",
        type: "Operativo territorial",
        priority: "medium",
        territoryIds: [] as string[],
        kpis: [{ name: "", unit: "%", target: 100 }],
        milestones: [{ name: "", endDate: "" }]
    });

    const updateForm = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        if (!formData.title) return alert("El título es obligatorio");
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const project = await res.json();
                // Opcional: Crear hitos después si la API lo requiere, 
                // pero mi POST /api/projects ya acepta hilos si los agregara.
                // Por ahora el POST simple y redirigir.
                router.push(`/projects/${project.id}`);
            } else {
                alert("Error al crear proyecto");
            }
        } catch (e) { alert("Error de conexión"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black pb-24">
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-400 p-2"><span className="material-symbols-outlined">arrow_back</span></button>
                    <div className="text-center">
                        <h1 className="font-bold text-sm">Nuevo Proyecto</h1>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{STEPS[currentStep - 1].title}</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-6">
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <section className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Título del Proyecto</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm"
                                    placeholder="Ej. Plan de Urbanización 2026"
                                    value={formData.title}
                                    onChange={e => updateForm('title', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Rama</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                                        value={formData.branch}
                                        onChange={e => updateForm('branch', e.target.value)}
                                    >
                                        <option value="General">General</option>
                                        <option value="Infraestructura">Infraestructura</option>
                                        <option value="Salud">Salud</option>
                                        <option value="Economía Popular">Economía Popular</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Prioridad</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-sm"
                                        value={formData.priority}
                                        onChange={e => updateForm('priority', e.target.value)}
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                        <option value="critical">Crítica</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Territorios Alcanzados</label>
                                <div className="grid grid-cols-2 gap-2 h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl custom-scrollbar">
                                    {territories.map(t => (
                                        <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded text-[#851c74] focus:ring-[#851c74]"
                                                checked={formData.territoryIds.includes(t.id)}
                                                onChange={e => {
                                                    const ids = e.target.checked
                                                        ? [...formData.territoryIds, t.id]
                                                        : formData.territoryIds.filter(id => id !== t.id);
                                                    updateForm('territoryIds', ids);
                                                }}
                                            />
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{t.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <section className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Resumen Operativo</label>
                                <textarea
                                    rows={5}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm resize-none"
                                    placeholder="Define el alcance y propósito..."
                                    value={formData.description}
                                    onChange={e => updateForm('description', e.target.value)}
                                />
                            </div>
                        </section>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <section className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Planificación Temporal</h3>
                            {formData.milestones.map((ms, idx) => (
                                <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                                    <div className="flex-1">
                                        <input
                                            placeholder="Nombre del Hito"
                                            className="w-full bg-transparent border-none text-sm font-bold focus:ring-0"
                                            value={ms.name}
                                            onChange={e => {
                                                const newMs = [...formData.milestones];
                                                newMs[idx].name = e.target.value;
                                                updateForm('milestones', newMs);
                                            }}
                                        />
                                        <input
                                            type="date"
                                            className="w-full bg-transparent border-none text-[10px] text-gray-400 focus:ring-0"
                                            value={ms.endDate}
                                            onChange={e => {
                                                const newMs = [...formData.milestones];
                                                newMs[idx].endDate = e.target.value;
                                                updateForm('milestones', newMs);
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => updateForm('milestones', formData.milestones.filter((_, i) => i !== idx))}
                                        className="text-red-400"
                                    ><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateForm('milestones', [...formData.milestones, { name: "", endDate: "" }])}
                                className="w-full py-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 font-bold text-xs"
                            >+ AGREGAR HITO</button>
                        </section>
                    </div>
                )}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {currentStep > 1 && (
                        <button onClick={() => setCurrentStep(currentStep - 1)} className="p-4 rounded-2xl bg-gray-100 font-bold text-xs">ATRÁS</button>
                    )}
                    {currentStep < 3 ? (
                        <button onClick={() => setCurrentStep(currentStep + 1)} className="flex-1 bg-black dark:bg-[#851c74] text-white p-4 rounded-2xl font-bold text-xs">SIGUIENTE</button>
                    ) : (
                        <button
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="flex-1 bg-[#851c74] text-white p-4 rounded-2xl font-bold text-xs shadow-lg shadow-purple-900/40"
                        >
                            {isSubmitting ? "CREANDO..." : "FINALIZAR Y GUARDAR"}
                        </button>
                    )}
                </div>
            </footer>
        </main>
    );
}
