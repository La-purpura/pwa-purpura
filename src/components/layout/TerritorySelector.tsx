"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { ELECTORAL_SECTIONS } from "@/lib/constants";

export function TerritorySelector() {
    const { territoryFilter, setTerritoryFilter } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    const currentSelectionLabel = () => {
        if (territoryFilter.section === "all") return "Provincia de Buenos Aires";
        if (territoryFilter.district) return `${territoryFilter.district}, ${territoryFilter.section}`;
        return territoryFilter.section;
    };

    const selectedSectionData = ELECTORAL_SECTIONS.find(s => s.name === territoryFilter.section);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#851c74] font-medium transition-colors"
            >
                <span className="material-symbols-outlined text-lg">location_on</span>
                {currentSelectionLabel()}
                <span className="material-symbols-outlined text-lg">arrow_drop_down</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#20121d] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
                            <button
                                onClick={() => {
                                    setTerritoryFilter({ section: "all", district: null });
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-between ${territoryFilter.section === "all" ? "bg-purple-50 text-[#851c74]" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                            >
                                Provincia de Buenos Aires
                                {territoryFilter.section === "all" && <span className="material-symbols-outlined text-sm">check</span>}
                            </button>

                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                            <p className="px-3 text-[10px] font-bold text-gray-400 uppercase">Secciones Electorales</p>

                            {ELECTORAL_SECTIONS.map((sec) => (
                                <div key={sec.name}>
                                    <button
                                        onClick={() => {
                                            setTerritoryFilter({ section: sec.name, district: null });
                                            // Keep open to select district? Or close? User asked to select section THEN districts.
                                            // Let's interpret as: Selecting section filters by section. 
                                            // If they want specific district, they can select it from a submenu or if I expand it here.
                                            // Let's expand the districts if section is active
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${territoryFilter.section === sec.name ? "bg-gray-100 dark:bg-gray-800 text-[#851c74]" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                    >
                                        {sec.name}
                                        {territoryFilter.section === sec.name && <span className="material-symbols-outlined text-sm">expand_more</span>}
                                    </button>

                                    {/* District List for Active Section */}
                                    {territoryFilter.section === sec.name && (
                                        <div className="ml-4 pl-2 border-l-2 border-[#851c74]/20 mt-1 space-y-1">
                                            <button
                                                onClick={() => {
                                                    setTerritoryFilter({ section: sec.name, district: null });
                                                    setIsOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-bold ${!territoryFilter.district ? "text-[#851c74]" : "text-gray-500 hover:text-gray-700"}`}
                                            >
                                                Toda la Sección
                                            </button>
                                            {sec.districts.sort().map(district => (
                                                <button
                                                    key={district}
                                                    onClick={() => {
                                                        setTerritoryFilter({ section: sec.name, district: district });
                                                        setIsOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs ${territoryFilter.district === district ? "bg-[#851c74] text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                                >
                                                    {district}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
