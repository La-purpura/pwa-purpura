"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const menuItems = [
    { icon: "settings", label: "Configuración", href: "/settings" },
    { icon: "help", label: "Ayuda y Soporte", href: "/help" },
    { icon: "shield", label: "Seguridad", href: "/security" },
    { icon: "info", label: "Acerca de", href: "/about" },
  ];

  return (
    <main className="pb-24 pt-6 px-4 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 -z-0"></div>
        <div className="relative z-10 group cursor-pointer" onClick={() => alert("Función de cambio de foto simulada. En prod abriría selector de archivos.")}>
          <div className="size-24 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden mb-4 relative bg-gray-200">
            <img src={user?.avatar || "https://i.pravatar.cc/150"} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white">photo_camera</span>
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#171216] dark:text-white z-10 relative">{user?.name || "Usuario"}</h2>
        <p className="text-sm text-gray-500 font-medium z-10 relative">{user?.email}</p>

        <div className="mt-4 flex gap-2 z-10 relative">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {user?.role || "Agente"}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
            {user?.territory || "Territorio"}
          </span>
        </div>

        <Link href="/profile/edit" className="mt-6 z-10 relative bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-6 py-2 text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">edit</span>
          Modificar Mis Datos
        </Link>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">Menú</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <Link href={item.href} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">{item.icon}</span>
                  <span className="text-sm font-bold text-[#171216] dark:text-white">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward_ios</span>
              </Link>
              {index < menuItems.length - 1 && <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4"></div>}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 font-bold p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined">logout</span>
        Cerrar Sesión
      </button>

      <p className="text-center text-[10px] text-gray-300 font-mono">v1.2.0 • La Púrpura</p>
    </main>
  );
}
