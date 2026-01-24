"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ActiveTab = "reports" | "home" | "tasks" | "settings";

export default function ReportsBottomNav() {
  const pathname = usePathname();

  const resolvedActive =
    pathname.startsWith("/reports") ? "reports" :
      pathname.startsWith("/tasks") ? "tasks" :
        pathname.startsWith("/home") ? "home" : "settings";

  const baseItem = "flex flex-col items-center justify-center w-full h-full text-gray-400 transition-all";
  const activeItem = "flex flex-col items-center justify-center w-full h-full text-[#851c74] dark:text-purple-400";

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-4">
        <Link href="/home" className={resolvedActive === "home" ? activeItem : baseItem}>
          <span className="material-symbols-outlined text-2xl font-variation-fill">home</span>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Inicio</span>
        </Link>

        <Link href="/tasks" className={resolvedActive === "tasks" ? activeItem : baseItem}>
          <span className="material-symbols-outlined text-2xl">assignment</span>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Tareas</span>
        </Link>

        <Link href="/reports" className={resolvedActive === "reports" ? activeItem : baseItem}>
          <div className={`relative ${resolvedActive === "reports" ? 'after:content-[""] after:absolute after:-top-1 after:-right-1 after:size-2 after:bg-[#851c74] after:rounded-full after:border-2 after:border-white dark:after:border-[#1a1a1a]' : ''}`}>
            <span className="material-symbols-outlined text-2xl">contract_edit</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Reportes</span>
        </Link>

        <Link href="/settings" className={resolvedActive === "settings" ? activeItem : baseItem}>
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
