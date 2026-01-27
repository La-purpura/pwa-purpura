"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { Permission, ROLE_LABELS } from "@/lib/rbac";

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, hasPermission } = useRBAC();
    const { logout } = useAppStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Role-based Link Config
    const links: { href: string; label: string; icon: string; permission?: Permission }[] = [
        { href: "/home", label: "Inicio", icon: "home" },
        { href: "/dashboard", label: "Tablero", icon: "dashboard", permission: "territory:view" },
        { href: "/tasks", label: "Tareas", icon: "assignment", permission: "forms:view" },
        { href: "/incidents", label: "Incidencias", icon: "contract_edit", permission: "reports:view" },
        { href: "/projects", label: "Proyectos", icon: "flag", permission: "projects:view" },
        { href: "/team", label: "Equipo", icon: "group", permission: "users:view" },
        { href: "/library", label: "Biblioteca", icon: "library_books", permission: "resources:view" },
        { href: "/admin/audit", label: "Auditoría", icon: "security", permission: "audit:view" },
        { href: "/settings", label: "Ajustes", icon: "settings" },
    ];

    const filteredLinks = links.filter(link => !link.permission || hasPermission(link.permission));

    return (
        <aside
            className={`hidden md:flex flex-col bg-white dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
                } relative group/sidebar shadow-sm z-30`}
        >
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-[#851c74] shadow-sm z-50 transition-colors"
            >
                <span className="material-symbols-outlined text-sm">
                    {isCollapsed ? "chevron_right" : "chevron_left"}
                </span>
            </button>

            {/* Header */}
            <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} shrink-0`}>
                {isCollapsed ? (
                    <div className="w-10 h-10 rounded-xl bg-[#851c74] flex items-center justify-center text-white font-black shadow-lg">
                        LP
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#851c74] flex items-center justify-center text-white font-black shrink-0 shadow-lg">
                            P
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-[#851c74] leading-tight">La Púrpura</h1>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Territorial</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
                {filteredLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? "bg-[#851c74] text-white shadow-xl shadow-purple-900/20 font-bold"
                                : "text-gray-500 dark:text-gray-400 hover:bg-[#851c74]/5 hover:text-[#851c74] dark:hover:text-white"
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className={`material-symbols-outlined text-xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                {link.icon}
                            </span>

                            {!isCollapsed && (
                                <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                            )}

                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-50 transform translate-x-2 group-hover:translate-x-0">
                                    {link.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile / Logout */}
            <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${isCollapsed ? 'items-center' : ''}`}>
                {!isCollapsed && (
                    <Link href="/settings/profile" className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-4 group/profile">
                        <div className="w-10 h-10 rounded-xl bg-[#851c74]/10 overflow-hidden shrink-0 border border-[#851c74]/20">
                            {user?.photoUrl ? (
                                <img src={user.photoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#851c74] font-black text-sm">
                                    {(user?.alias || user?.name || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-gray-900 dark:text-white truncate uppercase">{user?.alias || user?.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold truncate uppercase">{user?.role ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role : ""}</p>
                        </div>
                    </Link>
                )}

                <button
                    onClick={async () => {
                        await logout();
                        router.push("/");
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">logout</span>
                    {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
