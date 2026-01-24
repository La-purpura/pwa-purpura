"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";
import { HierarchicalTerritorySelector } from "@/components/common/HierarchicalTerritorySelector";

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
        if (formData.territoryIds.length === 0) return alert("Debes seleccionar al menos un territorio.");

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const project = await res.json();
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
                        <section className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Título del Proyecto</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm font-bold"
                                    placeholder="Ej. Plan de Urbanización 2026"
                                    value={formData.title}
                                    onChange={e => updateForm('title', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Rama</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-xs font-bold"
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
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Prioridad</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-xs font-bold"
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

                            <HierarchicalTerritorySelector
                                label="Territorios Alcanzados (Segmentación)"
                                selectedIds={formData.territoryIds}
                                onChange={(ids) => updateForm('territoryIds', ids)}
                            />
                        </section>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <section className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Resumen Operativo</label>
                                <textarea
                                    rows={8}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm resize-none leading-relaxed"
                                    placeholder="Define el alcance, propósito y beneficiarios finales..."
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
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Planificación Temporal</h3>
                            {formData.milestones.map((ms, idx) => (
                                <div key={idx} className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border border-gray-50 dark:border-gray-800">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            placeholder="Nombre del Hito (Ej: Inicio de Obra)"
                                            className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 p-0"
                                            value={ms.name}
                                            onChange={e => {
                                                const newMs = [...formData.milestones];
                                                newMs[idx].name = e.target.value;
                                                updateForm('milestones', newMs);
                                            }}
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">calendar_today</span>
                                            <input
                                                type="date"
                                                className="bg-transparent border-none text-[10px] text-gray-400 focus:ring-0 p-0 font-bold"
                                                value={ms.endDate}
                                                onChange={e => {
                                                    const newMs = [...formData.milestones];
                                                    newMs[idx].endDate = e.target.value;
                                                    updateForm('milestones', newMs);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateForm('milestones', formData.milestones.filter((_, i) => i !== idx))}
                                        className="size-10 flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
                                    ><span className="material-symbols-outlined">delete</span></button>
                                </div>
                            ))}
                            <button
                                onClick={() => updateForm('milestones', [...formData.milestones, { name: "", endDate: "" }])}
                                className="w-full py-5 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl text-gray-400 font-black text-[10px] uppercase tracking-widest hover:border-[#851c74] hover:text-[#851c74] transition-all"
                            >+ AGREGAR HITO DE CONTROL</button>
                        </section>
                    </div>
                )}
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-50 dark:border-gray-800">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {currentStep > 1 && (
                        <button onClick={() => setCurrentStep(currentStep - 1)} className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 font-black text-[10px] px-6 uppercase tracking-widest">Atrás</button>
                    )}
                    {currentStep < 3 ? (
                        <button onClick={() => setCurrentStep(currentStep + 1)} className="flex-1 bg-black dark:bg-[#851c74] text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Siguiente Paso</button>
                    ) : (
                        <button
                            disabled={isSubmitting}
                            onClick={handleSubmit}
                            className="flex-1 bg-[#851c74] text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-900/40 active:scale-95 transition-all"
                        >
                            {isSubmitting ? "Sincronizando..." : "Finalizar y Guardar Proyecto"}
                        </button>
                    )}
                </div>
            </footer>
        </main>
    );
}
