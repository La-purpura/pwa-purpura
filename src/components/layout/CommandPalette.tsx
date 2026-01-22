"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";
import { Permission } from "@/lib/permissions";

type Command = {
    id: string;
    label: string;
    icon: string;
    action?: () => void;
    href?: string;
    group: "Navegación" | "Acciones" | "Ayuda";
    permission?: Permission; // Nuevo campo opcional
};

export function CommandPalette() {
    const { setBroadcastModalOpen } = useAppStore();
    const { hasPermission } = useRBAC(); // Hook de permisos
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Comandos definidos con permisos asociados
    const commands: Command[] = [
        // Navegación
        { id: "nav-dash", label: "Ir al Tablero", icon: "dashboard", href: "/dashboard", group: "Navegación", permission: "territory:view" },
        { id: "nav-tasks", label: "Ir a Tareas", icon: "check_circle", href: "/tasks", group: "Navegación", permission: "forms:view" },
        { id: "nav-team", label: "Ir a Equipo", icon: "group", href: "/team", group: "Navegación", permission: "users:view" },
        { id: "nav-alerts", label: "Ir a Alertas", icon: "notifications", href: "/alerts", group: "Navegación", permission: "incidents:view" },
        { id: "nav-profile", label: "Mi Perfil", icon: "person", href: "/profile", group: "Navegación" },

        // Acciones Rápidas
        {
            id: "act-broadcast",
            label: "Emitir Anuncio Global",
            icon: "campaign",
            action: () => setBroadcastModalOpen(true),
            group: "Acciones",
            permission: "content:publish" // Solo los que pueden publicar
        },
        { id: "act-new-task", label: "Crear Nueva Tarea", icon: "add_task", href: "/tasks/create", group: "Acciones", permission: "forms:create" },
        { id: "act-new-alert", label: "Programar Alerta", icon: "notification_add", href: "/alerts/schedule", group: "Acciones", permission: "incidents:create" },
        { id: "act-new-msg", label: "Nueva Comunicación", icon: "campaign", href: "/news/create", group: "Acciones", permission: "content:publish" },
        { id: "act-receipt", label: "Generar Comprobante", icon: "receipt_long", href: "/documents/receipts", group: "Acciones", permission: "documents:upload" },

        // Ayuda
        { id: "help-docs", label: "Ver Biblioteca", icon: "library_books", href: "/library", group: "Ayuda", permission: "content:view" },
        { id: "help-support", label: "Soporte Técnico", icon: "support_agent", href: "/help", group: "Ayuda" },
    ];

    // Filtrar comandos por QUERY y por PERMISOS
    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) &&
        (!cmd.permission || hasPermission(cmd.permission))
    );

    // Manejar atajo de teclado global (Ctrl+K / Cmd+K)
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

    // Foco automático y reset al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Navegación por teclado dentro de la lista
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
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
            {/* Overlay Click to Close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <div className="w-full max-w-xl bg-white dark:bg-[#20121d] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden flex flex-col max-h-[60vh] animate-in zoom-in-95 slide-in-from-top-4 duration-200">
                {/* Search Header */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-gray-400 text-2xl mr-3">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Escribe un comando o busca..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 dark:text-white placeholder-gray-400 font-medium"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleListKeyDown}
                    />
                    <div className="hidden md:flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 font-sans font-bold">Esc</kbd>
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto custom-scrollbar p-2">
                    {filteredCommands.length > 0 ? (
                        <>
                            {["Acciones", "Navegación", "Ayuda"].map((group) => {
                                const groupCommands = filteredCommands.filter(c => c.group === group);
                                if (groupCommands.length === 0) return null;

                                return (
                                    <div key={group} className="mb-2">
                                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-[#20121d]/95 backdrop-blur z-10">
                                            {group}
                                        </div>
                                        {groupCommands.map((cmd) => {
                                            // Find true index in the flattened filtered list for highlighting
                                            const flatIndex = filteredCommands.indexOf(cmd);
                                            const isActive = flatIndex === selectedIndex;

                                            return (
                                                <button
                                                    key={cmd.id}
                                                    onClick={() => runCommand(cmd)}
                                                    onMouseEnter={() => setSelectedIndex(flatIndex)}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-100 ${isActive
                                                            ? "bg-[#851c74] text-white shadow-md shadow-[#851c74]/20"
                                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                        }`}
                                                >
                                                    <span className={`material-symbols-outlined ${isActive ? "text-white" : "text-gray-400"}`}>
                                                        {cmd.icon}
                                                    </span>
                                                    <span className="font-medium">{cmd.label}</span>
                                                    {cmd.group === "Acciones" && isActive && (
                                                        <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-bold">Enter</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div className="py-12 text-center text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                            <p>No se encontraron comandos para "{query}"</p>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
                    <p>La Púrpura Command Center</p>
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">arrow_upward</span><span className="material-symbols-outlined text-[10px]">arrow_downward</span> Navegar</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">keyboard_return</span> Seleccionar</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
