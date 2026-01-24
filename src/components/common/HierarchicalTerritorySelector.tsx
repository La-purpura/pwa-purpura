"use client";

import { useState, useEffect } from "react";

interface Territory {
    id: string;
    name: string;
    type: string;
    parentId: string | null;
}

interface HierarchicalTerritorySelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    label?: string;
}

export function HierarchicalTerritorySelector({ selectedIds, onChange, label }: HierarchicalTerritorySelectorProps) {
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<string[]>(['nacional', 'pba']);

    useEffect(() => {
        fetch('/api/territories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTerritories(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelect = (id: string) => {
        const isSelected = selectedIds.includes(id);
        let newSelection = [...selectedIds];

        if (isSelected) {
            newSelection = newSelection.filter(i => i !== id);
        } else {
            newSelection.push(id);
        }

        onChange(newSelection);
    };

    const renderTree = (parentId: string | null = null, depth = 0) => {
        const children = territories.filter(t => t.parentId === parentId);
        if (children.length === 0) return null;

        return (
            <div className={`space-y-1 ${depth > 0 ? 'ml-4 border-l border-gray-100 dark:border-gray-800 pl-2' : ''}`}>
                {children.map(t => {
                    const isExpanded = expandedIds.includes(t.id);
                    const isSelected = selectedIds.includes(t.id);
                    const hasChildren = territories.some(child => child.parentId === t.id);

                    return (
                        <div key={t.id} className="space-y-1">
                            <div className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                {hasChildren ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(t.id)}
                                        className="size-5 flex items-center justify-center text-gray-400 hover:text-[#851c74]"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {isExpanded ? 'expand_more' : 'chevron_right'}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="w-5" />
                                )}

                                <label className="flex flex-1 items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#851c74] focus:ring-[#851c74] size-4"
                                        checked={isSelected}
                                        onChange={() => toggleSelect(t.id)}
                                    />
                                    <span className={`text-xs font-bold ${isSelected ? 'text-[#851c74]' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {t.name}
                                    </span>
                                    <span className="text-[9px] text-gray-400 uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t.type}
                                    </span>
                                </label>
                            </div>

                            {isExpanded && renderTree(t.id, depth + 1)}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">{label}</label>}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 max-h-80 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="py-10 text-center animate-pulse text-xs text-gray-400">Cargando mapa territorial...</div>
                ) : (
                    renderTree(null)
                )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 italic ml-1">
                Selecciona uno o varios niveles para segmentar tu alcance.
            </p>
        </div>
    );
}
