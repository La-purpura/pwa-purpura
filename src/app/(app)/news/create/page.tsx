"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";
import { HierarchicalTerritorySelector } from "@/components/common/HierarchicalTerritorySelector";

export default function CreateNewsPage() {
    const router = useRouter();
    const { hasPermission } = useRBAC();
    const [loading, setLoading] = useState(false);

    const [postData, setPostData] = useState({
        title: "",
        content: "",
        type: "news",
        territoryIds: [] as string[],
        branchId: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                router.push("/news");
                alert("Comunicado publicado exitosamente");
            } else {
                const err = await res.json();
                alert(err.error || "Error al publicar");
            }
        } catch (e) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission('posts:create')) return <div className="p-20 text-center">No tienes permiso para comunicar.</div>;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black p-6 pb-24">
            <header className="flex items-center gap-4 mb-8 max-w-3xl mx-auto">
                <button onClick={() => router.back()} className="size-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-[#851c74]">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black">Nuevo Comunicado</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Título / Asunto</label>
                        <input
                            type="text"
                            required
                            value={postData.title}
                            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-[#851c74] text-sm font-bold"
                            placeholder="Ej: Actualización de Protocolos Sanitarios"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Categoría</label>
                            <select
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-xs font-bold"
                                value={postData.type}
                                onChange={(e) => setPostData({ ...postData, type: e.target.value })}
                            >
                                <option value="news">Novedad General</option>
                                <option value="urgent">Urgente / Alerta Intranet</option>
                                <option value="protocol">Protocolo / Guía</option>
                                <option value="system">Aviso de Sistema</option>
                            </select>
                        </div>

                        <HierarchicalTerritorySelector
                            label="Zonas de Difusión"
                            selectedIds={postData.territoryIds}
                            onChange={(ids) => setPostData({ ...postData, territoryIds: ids })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Cuerpo del Mensaje</label>
                        <textarea
                            required
                            value={postData.content}
                            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 ring-[#851c74] text-sm h-60 resize-none leading-relaxed"
                            placeholder="Escribe el contenido detallado aquí..."
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#851c74] text-white font-black p-5 rounded-2xl shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">publish</span>
                            DIFUNDIR COMUNICADO
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
