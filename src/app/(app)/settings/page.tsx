"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { Role, ROLE_LABELS } from "@/lib/rbac";

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  return (
    <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-bold">Configuración</h1>
      </header>

      <div className="space-y-6">
        {/* Preferencias de App */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <h2 className="px-6 pt-6 pb-2 text-xs font-bold uppercase text-gray-400">Preferencias</h2>

          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <div>
                <p className="font-bold">Notificaciones Push</p>
                <p className="text-xs text-gray-500">Alertas y mensajes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="p-4 flex flex-col gap-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined">dark_mode</span>
              </div>
              <div>
                <p className="font-bold">Apariencia</p>
                <p className="text-xs text-gray-500">Tema de la interfaz</p>
              </div>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${theme === "light" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                <span className="material-symbols-outlined text-sm">light_mode</span>
                Claro
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${theme === "dark" ? "bg-gray-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                <span className="material-symbols-outlined text-sm">dark_mode</span>
                Oscuro
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${theme === "system" ? "bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                <span className="material-symbols-outlined text-sm">settings_brightness</span>
                Sistema
              </button>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <p className="font-bold">Ubicación GPS</p>
                <p className="text-xs text-gray-500">Mejora relevamientos</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={location} onChange={() => setLocation(!location)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </section>

        {/* Cache y Datos */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4">
          <button className="w-full flex items-center justify-between text-red-500 font-bold">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined">delete_outline</span>
              Borrar datos del dispositivo
            </span>
            <span className="text-xs bg-red-50 px-2 py-1 rounded">24 MB</span>
          </button>
        </section>

        {/* Developer Tools - Role Switcher */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">construction</span>
              Debug Tools
            </h2>
            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">DEV ONLY</span>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">Simular Rol de Usuario:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(ROLE_LABELS) as [Role, string][]).map(([roleKey, label]) => {
                const isActive = user?.role === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => {
                      if (user) {
                        // Update role and set appropriate territory mock
                        const newTerritory = roleKey === "SuperAdminNacional" || roleKey === "AdminNacional" ? "Nacional"
                          : roleKey === "AdminProvincial" ? "Buenos Aires"
                            : "San Isidro";

                        setUser({ ...user, role: roleKey, territory: newTerritory });
                      }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isActive
                      ? "border-[#851c74] bg-[#851c74] text-white shadow-md"
                      : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-white text-[#851c74]" : "bg-gray-100 dark:bg-gray-800"
                      }`}>
                      {label.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>{label}</p>
                      <p className={`text-[10px] truncate ${isActive ? "text-white/80" : "text-gray-400"}`}>{roleKey}</p>
                    </div>
                    {isActive && <span className="material-symbols-outlined text-sm">check_circle</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-sm mt-0.5">info</span>
              <p>
                Al cambiar de rol, el Sidebar, Dashboard y CommandPalette se actualizarán inmediatamente para reflejar los permisos de <strong>{ROLE_LABELS[user?.role || "SuperAdminNacional"]}</strong>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
