"use client";

import { useState, useEffect, useMemo } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { HierarchicalTerritorySelector } from "@/components/common/HierarchicalTerritorySelector";

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
    createdAt: string;
    author: { name: string };
    territoryNames: string;
}

const CATEGORIES = [
    { id: 'all', label: 'Todos', icon: 'grid_view' },
    { id: 'Manual', label: 'Manuales', icon: 'book' },
    { id: 'Protocolo', label: 'Protocolos', icon: 'rule' },
    { id: 'Capacitación', label: 'Capacitación', icon: 'school' },
    { id: 'Gráfica', label: 'Material Gráfico', icon: 'palette' },
    { id: 'Técnico', label: 'Doc Técnica', icon: 'settings_suggest' },
];

export default function LibraryPage() {
    const { hasPermission } = useRBAC();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newResource, setNewResource] = useState({
        title: "",
        description: "",
        url: "",
        category: "Manual",
        territoryIds: [] as string[]
    });

    const fetchResources = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory !== 'all') params.append('category', activeCategory);
            if (searchQuery) params.append('q', searchQuery);

            const res = await fetch(`/api/resources?${params}`);
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResources();
        }, 500);
        return () => clearTimeout(timer);
    }, [activeCategory, searchQuery]);

    const handleCreateResource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newResource)
            });

            if (res.ok) {
                fetchResources();
                setIsModalOpen(false);
                setNewResource({ title: "", description: "", url: "", category: "Manual", territoryIds: [] });
            }
        } catch (e) {
            alert("Error de conexión");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <header className="bg-white dark:bg-[#1a1a1a] p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black dark:text-white">Biblioteca</h1>
                            <p className="text-[10px] font-black uppercase text-[#851c74] tracking-widest mt-1">Recursos Oficiales</p>
                        </div>
                        {hasPermission('resources:manage') && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#851c74] text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                                Subir
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id
                                        ? 'bg-white dark:bg-gray-700 text-[#851c74] shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar en la biblioteca..."
                            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 ring-[#851c74]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center animate-pulse text-gray-400 font-bold">Cargando recursos...</div>
                    ) : resources.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
                            <p className="text-gray-400 italic font-bold">Sin resultados.</p>
                        </div>
                    ) : (
                        resources.map(res => (
                            <div key={res.id} className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-6 border border-gray-50 dark:border-gray-800 hover:border-[#851c74]/20 hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 text-[9px] font-black uppercase rounded-lg">
                                        {res.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300">
                                        <span className="material-symbols-outlined text-sm">public</span>
                                        {res.territoryNames}
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-[#851c74] transition-colors line-clamp-2">{res.title}</h4>
                                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                                    {res.description}
                                </p>
                                <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(res.createdAt).toLocaleDateString()}</span>
                                    <a
                                        href={res.url}
                                        target="_blank"
                                        className="size-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#851c74] group-hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">visibility</span>
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <form onSubmit={handleCreateResource} className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black mb-6">Nuevo Recurso</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Título</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm font-bold"
                                    placeholder="Ej: Manual de Operaciones"
                                    value={newResource.title}
                                    onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-xs font-bold"
                                        value={newResource.category}
                                        onChange={e => setNewResource({ ...newResource, category: e.target.value })}
                                    >
                                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <HierarchicalTerritorySelector
                                    label="Visibilidad"
                                    selectedIds={newResource.territoryIds}
                                    onChange={(ids) => setNewResource({ ...newResource, territoryIds: ids })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">URL del Recurso</label>
                                <input
                                    required
                                    type="url"
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm font-bold"
                                    placeholder="https://..."
                                    value={newResource.url}
                                    onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Descripción</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm resize-none"
                                    value={newResource.description}
                                    onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-gray-100 text-gray-500">Cancelar</button>
                            <button type="submit" className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-[#851c74] text-white">Sincronizar</button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
}
