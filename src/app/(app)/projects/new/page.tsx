"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";

// Definición de Pasos
const STEPS = [
    { id: 1, title: "Identidad y Alcance", icon: "flag" },
    { id: 2, title: "Objetivo y KPIs", icon: "target" },
    { id: 3, title: "Equipo", icon: "groups" },
    { id: 4, title: "Plan e Hitos", icon: "schedule" },
    { id: 5, title: "Recursos", icon: "payments" },
    { id: 6, title: "Riesgos y Aprobación", icon: "verified_user" }
];

export default function NewProjectPage() {
    const router = useRouter();
    const { user } = useRBAC();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    interface FormState {
        title: string;
        code: string;
        branch: string;
        type: string;
        priority: string;
        territoryLevel: string;
        headquarterTerritory: string;
        description: string;
        generalObjective: string;
        startDate: string;
        endDate: string;
        kpis: { id: string; name: string; unit: string; baseline: number; target: number }[];
        teamIds: string[];
        milestones: { name: string; description?: string; status: string; endDate: string }[];
        budget: any[]; // Placeholder
        risks: { description: string; probability: number }[];
    }

    // Estado del Formulario (Inicial)
    const [formData, setFormData] = useState<FormState>({
        title: "",
        code: "",
        branch: "General",
        type: "Operativo territorial",
        priority: "medium",
        territoryLevel: "locality",
        headquarterTerritory: user?.territory || "",

        description: "",
        generalObjective: "",
        startDate: "",
        endDate: "",
        kpis: [{ id: "k1", name: "", unit: "%", baseline: 0, target: 100 }],

        teamIds: [],
        milestones: [],
        budget: [],
        risks: []
    });

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: 'draft', // Comienza como borrador
                    createdBy: user?.id
                })
            });

            if (res.ok) {
                router.push('/projects');
            } else {
                alert("Error al crear proyecto");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black/90 pb-24">
            {/* Header Wizard */}
            <header className="sticky top-0 z-30 bg-white dark:bg-[#20121d] border-b border-gray-200 dark:border-gray-800 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="hover:bg-gray-100 rounded-full p-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Nuevo Proyecto</h1>
                            <p className="text-xs text-gray-500">Paso {currentStep} de 6: {STEPS[currentStep - 1].title}</p>
                        </div>
                    </div>
                    <div className="hidden md:flex gap-2">
                        {STEPS.map(step => (
                            <div key={step.id} className={`h-2 w-12 rounded-full transition-all ${step.id <= currentStep ? 'bg-[#851c74]' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                        ))}
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* PASO 1: Identidad */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">flag</span> Identidad y Alcance
                            </h2>

                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Título del Proyecto *</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74]"
                                        placeholder="Ej. Operativo Verano 2024"
                                        value={formData.title}
                                        onChange={e => updateForm('title', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Rama / Sector</label>
                                        <select
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none"
                                            value={formData.branch}
                                            onChange={e => updateForm('branch', e.target.value)}
                                        >
                                            <option value="General">General</option>
                                            <option value="PyME">PyME y Producción</option>
                                            <option value="Deportes">Deportes</option>
                                            <option value="Educación">Educación</option>
                                            <option value="Salud">Salud</option>
                                            <option value="Infraestructura">Infraestructura</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Prioridad</label>
                                        <select
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none"
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
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nivel Territorial</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {['province', 'department', 'locality', 'multi'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => updateForm('territoryLevel', level)}
                                                className={`p-2 rounded-lg text-xs font-bold border transition-colors ${formData.territoryLevel === level
                                                    ? 'bg-[#851c74] text-white border-[#851c74]'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                {level === 'province' ? 'Provincia' : level === 'department' ? 'Partido' : level === 'locality' ? 'Localidad' : 'Multi-Nivel'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Territorio Cabecera</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74]"
                                        placeholder="Escribe el territorio principal..."
                                        value={formData.headquarterTerritory}
                                        onChange={e => updateForm('headquarterTerritory', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 2: Objetivos */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">target</span> Objetivo y KPIs
                            </h2>

                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Resumen Ejecutivo</label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74]"
                                        placeholder="Describe el impacto esperado..."
                                        value={formData.description}
                                        onChange={e => updateForm('description', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Inicio Estimado</label>
                                        <input type="date" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none"
                                            value={formData.startDate} onChange={e => updateForm('startDate', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fin Estimado</label>
                                        <input type="date" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none"
                                            value={formData.endDate} onChange={e => updateForm('endDate', e.target.value)} />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <h3 className="font-bold text-sm mb-2">KPI Principal</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <input type="text" placeholder="Nombre (ej. Visitas)" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm col-span-2"
                                            value={formData.kpis[0].name} onChange={e => {
                                                const newKpis = [...formData.kpis]; newKpis[0].name = e.target.value; updateForm('kpis', newKpis);
                                            }} />
                                        <input type="number" placeholder="Meta" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                                            value={formData.kpis[0].target} onChange={e => {
                                                const newKpis = [...formData.kpis]; newKpis[0].target = Number(e.target.value); updateForm('kpis', newKpis);
                                            }} />
                                        <input type="text" placeholder="Unidad (ej. %)" className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                                            value={formData.kpis[0].unit} onChange={e => {
                                                const newKpis = [...formData.kpis]; newKpis[0].unit = e.target.value; updateForm('kpis', newKpis);
                                            }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 3: Equipo */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">groups</span> Equipo y Gobernanza
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Responsable Principal</label>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-2 border border-blue-200 dark:border-blue-900/30">
                                        <span className="material-symbols-outlined text-blue-500">person</span>
                                        <span className="text-sm font-medium">{user?.name || "Usuario Actual"} (Tú)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Equipo Operativo</label>
                                    <div className="flex gap-2 mb-2">
                                        <input id="newMember" type="text" placeholder="ID o Email de usuario" className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm" />
                                        <button
                                            onClick={() => {
                                                const input = document.getElementById('newMember') as HTMLInputElement;
                                                if (input.value) {
                                                    updateForm('teamIds', [...formData.teamIds, input.value]);
                                                    input.value = '';
                                                }
                                            }}
                                            className="bg-[#851c74] text-white p-2 rounded-lg"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.teamIds.map((member: string, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold flex items-center gap-1">
                                                {member}
                                                <button onClick={() => updateForm('teamIds', formData.teamIds.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">×</button>
                                            </span>
                                        ))}
                                        {formData.teamIds.length === 0 && <span className="text-xs text-gray-400 italic">Sin miembros adicionales asignados.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 4: Plan e Hitos */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">flag</span> Hitos Principales
                            </h2>

                            <div className="space-y-4">
                                {formData.milestones.map((ms: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl relative group">
                                        <button
                                            onClick={() => {
                                                const newMs = formData.milestones.filter((_, i) => i !== idx);
                                                updateForm('milestones', newMs);
                                            }}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Nombre del Hito"
                                                className="p-2 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-gray-700 text-sm font-bold"
                                                value={ms.name}
                                                onChange={(e) => {
                                                    const newMs = [...formData.milestones];
                                                    newMs[idx].name = e.target.value;
                                                    updateForm('milestones', newMs);
                                                }}
                                            />
                                            <input
                                                type="date"
                                                className="p-2 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-gray-700 text-sm"
                                                value={ms.endDate}
                                                onChange={(e) => {
                                                    const newMs = [...formData.milestones];
                                                    newMs[idx].endDate = e.target.value;
                                                    updateForm('milestones', newMs);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => updateForm('milestones', [...formData.milestones, { name: "", status: "pending", endDate: "" }])}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 hover:border-[#851c74] hover:text-[#851c74] transition-colors font-bold flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">add_circle</span> Agregar Hito
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 5: Recursos (Simplificado) */}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">payments</span> Presupuesto y Recursos
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Estime los recursos necesarios para la aprobación inicial.</p>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Presupuesto Estimado ($)</label>
                                    <input type="number" placeholder="0.00" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-lg font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fuente de Financiamiento</label>
                                    <select className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none">
                                        <option>Propia / Caja Chica</option>
                                        <option>Provincial</option>
                                        <option>Nacional</option>
                                        <option>Donación</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PASO 6: Riesgos y Aprobación */}
                {currentStep === 6 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">warning</span> Riesgos y Conformidad
                            </h2>

                            <div className="space-y-4 mb-6">
                                {formData.risks.map((risk: any, idx: number) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Descripción del riesgo"
                                            className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                                            value={risk.description}
                                            onChange={(e) => {
                                                const newRisks = [...formData.risks];
                                                newRisks[idx].description = e.target.value;
                                                updateForm('risks', newRisks);
                                            }}
                                        />
                                        <select
                                            className="w-24 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                                            value={risk.probability}
                                            onChange={(e) => {
                                                const newRisks = [...formData.risks];
                                                newRisks[idx].probability = Number(e.target.value);
                                                updateForm('risks', newRisks);
                                            }}
                                        >
                                            <option value="1">Baja</option>
                                            <option value="3">Media</option>
                                            <option value="5">Alta</option>
                                        </select>
                                    </div>
                                ))}
                                <button
                                    onClick={() => updateForm('risks', [...formData.risks, { description: "", probability: 1 }])}
                                    className="text-sm font-bold text-[#851c74] hover:underline"
                                >+ Agregar Riesgo</button>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 text-[#851c74] rounded focus:ring-[#851c74]" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Confirmo que los datos son verídicos y respetan los lineamientos institucionales.</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer Actions */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#20121d] border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="max-w-3xl mx-auto flex justify-between gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Atrás
                    </button>

                    {currentStep < 6 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-[#851c74] text-white font-bold hover:bg-[#6b165d] transition-colors shadow-lg shadow-purple-900/20"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 md:flex-none px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Guardando...' : 'Crear Proyecto'}
                            {!isSubmitting && <span className="material-symbols-outlined">check_circle</span>}
                        </button>
                    )}
                </div>
            </footer>
        </main>
    );
}
