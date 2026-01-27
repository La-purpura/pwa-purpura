"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";
import { HierarchicalTerritorySelector } from "@/components/common/HierarchicalTerritorySelector";
import { apiFetch } from "@/lib/api";

export default function NewIncidentPage() {
    const router = useRouter();
    const { hasPermission } = useRBAC();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Seguridad",
        priority: "MEDIUM",
        address: "",
        latitude: null as number | null,
        longitude: null as number | null,
        territoryIds: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.territoryIds.length === 0) {
            alert("Debes seleccionar el territorio afectado.");
            return;
        }

        setLoading(true);
        try {
            const res = await apiFetch('/api/incidents', {
                method: 'POST',
                body: formData,
                title: `Nueva incidencia: ${formData.title}`
            });

            if (res.ok || res.status === 202) {
                router.push("/incidents");
                if (res.status === 202) {
                    alert("Incidencia guardada localmente (PWA). Se enviará al recuperar conexión.");
                } else {
                    alert("Incidencia enviada correctamente");
                }
            } else {
                const err = await res.json();
                alert(err.error || "Error al enviar la incidencia");
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission('reports:create')) return <div className="p-20 text-center font-bold text-red-500 uppercase tracking-widest">Acceso restringido.</div>;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black p-6 pb-24">
            <header className="flex items-center gap-4 mb-8 max-w-2xl mx-auto">
                <button onClick={() => router.back()} className="size-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-[#851c74] hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-black">Nueva Incidencia Territorial</h1>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Información de campo en tiempo real</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Título del Reporte</label>
                        <input
                            type="text"
                            required
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-[#851c74] text-sm font-bold"
                            placeholder="Ej: Detectada falta de insumos"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Categoría</label>
                            <select
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-xs font-bold ring-[#851c74] focus:ring-2"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Infraestructura">Infraestructura</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="Salud">Salud</option>
                                <option value="Social">Social</option>
                                <option value="Ambiental">Ambiental</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Prioridad</label>
                            <select
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-xs font-bold ring-[#851c74] focus:ring-2"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="LOW">Baja</option>
                                <option value="MEDIUM">Media</option>
                                <option value="HIGH">Alta</option>
                                <option value="CRITICAL">Crítica</option>
                            </select>
                        </div>
                    </div>

                    <HierarchicalTerritorySelector
                        label="Ámbito Territorial"
                        selectedIds={formData.territoryIds}
                        onChange={(ids) => setFormData({ ...formData, territoryIds: ids })}
                    />

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Descripción y Hallazgos</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-[#851c74] text-sm rounded-2xl resize-none leading-relaxed"
                            placeholder="Describe el evento con el mayor detalle posible..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#851c74] text-white font-black p-6 rounded-[2rem] shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                    {loading ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">send</span>
                            CONFIRMAR Y EMITIR INCIDENCIA
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
