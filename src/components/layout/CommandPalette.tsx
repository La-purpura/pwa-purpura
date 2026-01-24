"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";
import { Permission } from "@/lib/rbac";

type Command = {
    id: string;
    label: string;
    icon: string;
    action?: () => void;
    href?: string;
    group: "Navegación" | "Acciones" | "Ayuda";
    permission?: Permission;
};

export function CommandPalette() {
    const { setBroadcastModalOpen } = useAppStore();
    const { hasPermission } = useRBAC();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const commands: Command[] = [
        // Navegación
        { id: "nav-dash", label: "Ir al Tablero", icon: "dashboard", href: "/dashboard", group: "Navegación", permission: "territory:view" },
        { id: "nav-tasks", label: "Gestión de Tareas", icon: "assignment", href: "/tasks", group: "Navegación", permission: "forms:view" },
        { id: "nav-reports", label: "Reportes en Territorio", icon: "contract_edit", href: "/reports", group: "Navegación", permission: "reports:view" },
        { id: "nav-team", label: "Control de Equipo", icon: "group", href: "/team", group: "Navegación", permission: "users:view" },
        { id: "nav-alerts", label: "Comunicaciones y Alertas", icon: "notifications", href: "/alerts", group: "Navegación", permission: "reports:view" },

        // Acciones Rápidas
        {
            id: "act-broadcast",
            label: "Emitir Anuncio Global",
            icon: "campaign",
            action: () => setBroadcastModalOpen(true),
            group: "Acciones",
            permission: "content:publish"
        },
        { id: "act-new-task", label: "Crear Nueva Tarea", icon: "add_task", href: "/tasks/new", group: "Acciones", permission: "forms:create" },
        { id: "act-new-report", label: "Generar Nuevo Reporte", icon: "add_reaction", href: "/reports/new", group: "Acciones", permission: "reports:create" },

        // Ayuda
        { id: "help-docs", label: "Ver Biblioteca", icon: "library_books", href: "/library", group: "Ayuda", permission: "resources:view" },
        { id: "help-profile", label: "Editar Mi Perfil", icon: "person", href: "/settings/profile", group: "Ayuda" },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) &&
        (!cmd.permission || hasPermission(cmd.permission))
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const handleListKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selected = filteredCommands[selectedIndex];
            if (selected) runCommand(selected);
        }
    };

    const runCommand = (cmd: Command) => {
        if (cmd.action) cmd.action();
        if (cmd.href) router.push(cmd.href);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <div className="w-full max-w-xl bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95 slide-in-from-top-4 duration-300">
                {/* Search Header */}
                <div className="flex items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-[#851c74] text-2xl mr-4">bolt</span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Comando rápido..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 dark:text-white placeholder-gray-400 font-extrabold uppercase tracking-tight"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleListKeyDown}
                    />
                    <div className="hidden md:flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] text-gray-400 font-black uppercase shadow-inner">Esc</kbd>
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto custom-scrollbar p-3">
                    {filteredCommands.length > 0 ? (
                        <>
                            {["Acciones", "Navegación", "Ayuda"].map((group) => {
                                const groupCommands = filteredCommands.filter(c => c.group === group);
                                if (groupCommands.length === 0) return null;

                                return (
                                    <div key={group} className="mb-4 last:mb-0">
                                        <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                            {group}
                                        </div>
                                        {groupCommands.map((cmd) => {
                                            const flatIndex = filteredCommands.indexOf(cmd);
                                            const isActive = flatIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => runCommand(cmd)}
                                                    onMouseEnter={() => setSelectedIndex(flatIndex)}
                                                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 ${isActive
                                                        ? "bg-[#851c74] text-white shadow-xl shadow-purple-900/40 translate-x-1"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined text-xl ${isActive ? "text-white" : "text-gray-400"}`}>
                                                        {cmd.icon}
                                                    </span>
                                                    <span className="font-extrabold uppercase text-[11px] tracking-widest">{cmd.label}</span>
                                                    {isActive && (
                                                        <span className="ml-auto text-[9px] bg-white/20 px-2 py-1 rounded-lg text-white font-black uppercase tracking-tighter animate-pulse">Confirmar</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div className="py-16 text-center text-gray-400">
                            <span className="material-symbols-outlined text-5xl mb-4 opacity-20">search_off</span>
                            <p className="font-black uppercase text-[10px] tracking-widest">Sin coincidencias para "{query}"</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Púrpura OS v2.0</p>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1 group"><span className="material-symbols-outlined text-xs text-[#851c74]">keyboard_arrow_up</span><span className="material-symbols-outlined text-xs text-[#851c74]">keyboard_arrow_down</span> <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">Navegar</span></span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-[#851c74]">keyboard_return</span> <span className="text-[9px] font-black uppercase tracking-tighter text-gray-500">Ejecutar</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
