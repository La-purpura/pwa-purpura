"use client";

import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminLibraryPage() {
    const { hasPermission } = useRBAC();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [category, setCategory] = useState("Manual");
    const [submitting, setSubmitting] = useState(false);

    const fetchResources = async () => {
        try {
            const res = await fetch("/api/resources");
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, url, category }),
            });
            if (res.ok) {
                setShowCreate(false);
                setTitle("");
                setDescription("");
                setUrl("");
                fetchResources();
            }
        } catch (error) {
            alert("Error al guardar recurso");
        } finally {
            setSubmitting(false);
        }
    };

    if (!hasPermission("resources:manage")) return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Gestión de Biblioteca</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Admin Panel</p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-black dark:bg-white dark:text-black text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                >
                    {showCreate ? "Cancelar" : "Nuevo Recurso"}
                </button>
            </header>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-[#20121d] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Título del Recurso</label>
                            <input
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej: Manual de Campaña 2026"
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Categoría</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                            >
                                <option value="Manual">Manual Operativo</option>
                                <option value="Político">Documento Político</option>
                                <option value="Técnico">Guía Técnica</option>
                                <option value="Varios">Otros</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-gray-400 ml-1">URL / Link de Descarga</label>
                        <input
                            required
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-gray-400 ml-1">Descripción Corta</label>
                        <textarea
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Breve resumen del contenido..."
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none outline-none focus:ring-2 focus:ring-purple-500 h-32 font-medium"
                        />
                    </div>

                    <button
                        disabled={submitting}
                        type="submit"
                        className="w-full py-4 bg-gradient-to-r from-[#851c74] to-[#c026d3] text-white font-black rounded-2xl shadow-xl hover:shadow-purple-500/20 disabled:opacity-50 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                    >
                        {submitting ? "Guardando..." : "Subir a la Biblioteca"}
                    </button>
                </form>
            )}

            <div className="bg-white dark:bg-[#20121d] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                            <tr>
                                <th className="px-8 py-5">Recurso</th>
                                <th className="px-8 py-5">Categoría</th>
                                <th className="px-8 py-5">Subido en</th>
                                <th className="px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-gray-400">Cargando activos...</td></tr>
                            ) : resources.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-500 italic">No hay documentos en la biblioteca pública.</td></tr>
                            ) : resources.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-[#851c74]">
                                                <span className="material-symbols-outlined text-xl">description</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white leading-tight">{res.title}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter truncate max-w-[200px]">{res.author.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase text-gray-500 group-hover:border-[#851c74] group-hover:text-[#851c74] transition-colors">
                                            {res.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-gray-400 tabular-nums">
                                        {new Date(res.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <a href={res.url} target="_blank" className="p-2 text-gray-400 hover:text-[#851c74] hover:bg-[#851c74]/10 rounded-lg transition-all">
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </a>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
