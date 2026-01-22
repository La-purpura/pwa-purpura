"use client";

import { useAppStore } from "@/lib/store";
import { ELECTORAL_SECTIONS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Recursive component for tree view
const TerritoryNode = ({ name, type, children, level = 0 }: any) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="select-none">
            <div
                className={`flex items-center gap-2 py-3 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => setExpanded(!expanded)}
            >
                <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform ${expanded ? 'rotate-90' : ''}`}>
                    {children ? 'arrow_right' : 'remove'}
                </span>
                <span className={`material-symbols-outlined ${type === 'province' ? 'text-primary' : type === 'department' ? 'text-blue-500' : 'text-green-500'}`}>
                    {type === 'province' ? 'public' : type === 'department' ? 'domain' : 'location_on'}
                </span>
                <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{name}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{type}</p>
                </div>
            </div>
            {expanded && children && (
                <div className="border-l border-gray-100 dark:border-gray-800 ml-6">
                    {children.map((child: any, idx: number) => (
                        <TerritoryNode key={idx} {...child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function TerritoryHierarchyPage() {
    const router = useRouter();

    // Mock Hierarchy Data
    // Build hierarchy from constants
    const hierarchy = {
        name: "Buenos Aires",
        type: "province",
        children: ELECTORAL_SECTIONS.map(section => ({
            name: section.name,
            type: "region",
            children: section.districts.map(district => ({
                name: district,
                type: "district"
            }))
        }))
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 text-[#171216] dark:text-white">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between max-w-md mx-auto">
                <button onClick={() => router.back()} className="text-primary">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <h2 className="font-bold text-lg">Jerarquía Territorial</h2>
                <div className="w-6" />
            </header>

            <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <TerritoryNode {...hierarchy} />
                </div>

                <div className="flex justify-end">
                    <button className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold">
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Solicitar Cambio
                    </button>
                </div>
            </main>
        </div>
    );
}
