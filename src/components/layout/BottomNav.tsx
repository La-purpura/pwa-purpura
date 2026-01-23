"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);

  // Determinar la ruta de "Inicio" según el rol
  const isAdminRole = user?.role?.toLowerCase().includes("admin") || user?.role === "SuperAdminNacional";
  const homePath = isAdminRole ? "/dashboard" : "/home";

  const navItems = [
    { icon: "dashboard", label: "Inicio", href: homePath },
    { icon: "assignment", label: "Relevamientos", href: "/tasks" },
    { icon: "add", label: "Nuevo", href: "/new-task", isAction: true },
    { icon: "warning", label: "Alertas", href: "/alerts" },
    { icon: "group", label: "Equipo", href: "/team" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 px-6 pt-3 pb-8 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== homePath && pathname.startsWith(item.href));

          if (item.isAction) {
            return (
              <div key={item.label} className="relative -top-8">
                <Link
                  href={item.href}
                  className="size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center transform active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-primary font-bold" : "text-gray-400 hover:text-primary"
                }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
