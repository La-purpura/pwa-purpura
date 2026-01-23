"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { TerritorySelector } from "@/components/layout/TerritorySelector";
import { NotificationsPopover } from "@/components/layout/NotificationsPopover";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { GlobalBanner } from "@/components/layout/GlobalBanner";
import { BroadcastModal } from "@/components/layout/BroadcastModal";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
    const user = useAppStore((state) => state.user);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    if (!user) return null;

    // Lógica para determinar el título del Header según la ruta
    const getHeaderInfo = () => {
        if (pathname.startsWith("/tasks")) return { title: "Relevamientos", subtitle: "Operación de Campo" };
        if (pathname.startsWith("/alerts")) return { title: "Centro de Alertas", subtitle: "Monitoreo Territorial" };
        if (pathname.startsWith("/team")) return { title: "Mi Equipo", subtitle: "Red de Territorio" };
        if (pathname.startsWith("/profile")) return { title: "Mi Perfil", subtitle: user.name };
        if (pathname.startsWith("/settings")) return { title: "Configuración", subtitle: "Ajustes de la PWA" };
        if (pathname.startsWith("/news")) return { title: "Novedades", subtitle: "Módulo de Comunicación" };
        if (pathname.startsWith("/map")) return { title: "Mapa en Tiempo Real", subtitle: "Vista Territorial" };
        if (pathname.includes("dashboard")) return { title: "Dashboard Administrativo", subtitle: "Gestión E2" };
        if (pathname.includes("home")) return { title: "Territorio", subtitle: user.territory };

        return { title: "La Púrpura", subtitle: user.territory };
    };

    const headerInfo = getHeaderInfo();
    const isSpecialPage = pathname === "/home" || pathname === "/dashboard";
    const isDashboard = pathname.includes("dashboard");

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-[#171216] dark:text-white">
            <GlobalBanner />
            <CommandPalette />
            <BroadcastModal />

            {/* Sidebar solo visible en escritorio */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header se muestra en móvil, o adaptado en escritorio si es necesario */}
                <div className="md:hidden">
                    <Header
                        title={headerInfo.title}
                        subtitle={headerInfo.subtitle}
                        showBack={!isSpecialPage}
                    />
                </div>

                {/* Header de Escritorio */}
                <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-[#20121d]/50 backdrop-blur-sm sticky top-0 z-40">
                    <div>
                        <h2 className="text-2xl font-bold">{headerInfo.title}</h2>
                        {isDashboard ? (
                            <div className="mt-1">
                                <TerritorySelector />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">{headerInfo.subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Acciones de escritorio adicionales aquí */}
                        <NotificationsPopover />
                    </div>
                </div>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    {children}
                </main>

                {/* Navegación inferior solo visible en móvil */}
                <div className="md:hidden">
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
