"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { Permission } from "@/lib/permissions";

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, hasPermission, roleLabel } = useRBAC();
    const { logout } = useAppStore();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Role-based Link Config
    const links: { href: string; label: string; icon: string; permission?: Permission }[] = [
        { href: "/home", label: "Inicio", icon: "home" },
        { href: "/dashboard", label: "Tablero", icon: "dashboard", permission: "territory:view" },
        { href: "/tasks", label: "Tareas", icon: "check_circle", permission: "forms:view" },
        { href: "/incidents", label: "Incidencias", icon: "warning", permission: "incidents:view" },
        { href: "/projects", label: "Proyectos", icon: "flag", permission: "projects:view" },
        { href: "/team", label: "Equipo", icon: "group", permission: "users:view" },
        { href: "/library", label: "Biblioteca", icon: "library_books", permission: "resources:view" },
        { href: "/admin/audit", label: "Auditoría", icon: "security", permission: "audit:view" },
        { href: "/settings", label: "Ajustes", icon: "settings" },
    ];

    const filteredLinks = links.filter(link => !link.permission || hasPermission(link.permission));

    return (
        <aside
            className={`hidden md:flex flex-col bg-white dark:bg-[#20121d] border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
                } relative group/sidebar shadow-sm`}
        >
            {/* Toggle Button - Absolute Positioned */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-9 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:text-[#851c74] shadow-sm z-50 transition-colors"
                title={isCollapsed ? "Expandir" : "Contraer"}
            >
                <span className="material-symbols-outlined text-sm">
                    {isCollapsed ? "chevron_right" : "chevron_left"}
                </span>
            </button>

            {/* Encabezado Fijo */}
            <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'px-6'} border-b border-gray-100 dark:border-gray-800 shrink-0`}>
                {isCollapsed ? (
                    <div className="w-10 h-10 rounded-xl bg-[#851c74] flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-900/20">
                        LP
                    </div>
                ) : (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-[#851c74] flex items-center justify-center text-white font-bold shrink-0">
                            P
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-[#851c74] truncate leading-none">La Púrpura</h1>
                            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">Territorio</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navegación Scrollable */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {filteredLinks.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            title={isCollapsed ? link.label : ""}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? "bg-[#851c74] text-white shadow-md shadow-[#851c74]/25 font-bold"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-[#851c74] dark:hover:text-white"
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? "text-white" : "group-hover:text-[#851c74] dark:group-hover:text-white"}`}>
                                {link.icon}
                            </span>

                            {!isCollapsed && (
                                <span className="text-sm truncate">{link.label}</span>
                            )}

                            {/* Tooltip for collapsed mode */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                    {link.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Fijo con Usuario y Logout */}
            <div className={`p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 shrink-0 flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''}`}>

                {/* User Info */}
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2 mb-2'}`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-[#851c74] p-0.5 shadow-sm shrink-0">
                        <img
                            src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
                            alt="User"
                            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold truncate text-gray-900 dark:text-gray-200 uppercase">{user?.role === 'SuperAdminNacional' ? 'Super Admin' : user?.role}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-700 w-full my-1"></div>

                <button
                    onClick={() => {
                        logout();
                        router.push("/auth/login");
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 w-full transition-all group ${isCollapsed ? 'justify-center' : ''}`}
                    title="Cerrar Sesión"
                >
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
                    {!isCollapsed && <span className="font-bold text-xs whitespace-nowrap">Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
