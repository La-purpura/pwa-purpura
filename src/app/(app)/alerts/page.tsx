"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";

const alertIcons = {
  system: { icon: "emergency_home", color: "text-primary", bg: "bg-primary/10" },
  security: { icon: "priority_high", color: "text-amber-600", bg: "bg-amber-100" },
  news: { icon: "alternate_email", color: "text-blue-600", bg: "bg-blue-100" },
  info: { icon: "info", color: "text-blue-500", bg: "bg-blue-50" },
  warning: { icon: "warning", color: "text-orange-500", bg: "bg-orange-50" },
  error: { icon: "report", color: "text-red-500", bg: "bg-red-50" },
} as const;

export default function AlertsHubPage() {
  const { alerts, setAlerts, markAlertAsRead, addAlert } = useAppStore();
  const { hasPermission } = useRBAC();

  const [activeTab, setActiveTab] = useState<"alerts" | "notifications">("alerts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlertData, setNewAlertData] = useState({
    title: "",
    type: "info" as "info" | "warning" | "error" | "news",
    message: ""
  });

  // Fetch alerts from API
  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(err => console.error("Error loading alerts:", err));
  }, [setAlerts]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAlertData.title,
          type: newAlertData.type,
          message: newAlertData.message
        })
      });

      if (res.ok) {
        const newAlert = await res.json();
        addAlert(newAlert);
        setIsModalOpen(false);
        setNewAlertData({ title: "", type: "info", message: "" });
        alert("Alerta creada con éxito");
      } else {
        alert("Error al crear alerta: Verifica tus permisos");
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Error de conexión");
    }
  };

  const handleMarkAllRead = () => {
    alerts.forEach((alert) => markAlertAsRead(alert.id));
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "alerts") return a.type === "warning" || a.type === "error" || a.type === "security";
    return true;
  });

  return (
    <main className="pb-24">
      <div className="px-4 py-4 bg-white dark:bg-background-dark">
        <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all text-sm font-semibold ${activeTab === 'alerts' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-[#85667f] dark:text-gray-400'}`}
          >
            <span className="truncate">Alertas Críticas</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all text-sm font-semibold ${activeTab === 'notifications' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-[#85667f] dark:text-gray-400'}`}
          >
            <span className="truncate">Novedades</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-[#171216] dark:text-white text-base font-bold tracking-tight">
          {activeTab === "alerts" ? "En Tiempo Real" : "Historial"}
        </h3>
        {activeTab === "alerts" && (
          <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            LIVE
          </span>
        )}
      </div>

      <div className="px-4 space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => markAlertAsRead(alert.id)}
              className={`w-full text-left flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm items-start active:scale-[0.98] transition-transform ${alert.isRead ? "opacity-60 grayscale-[0.5]" : ""}`}
            >
              <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${alert.type === 'error' ? 'bg-red-100 text-red-600' :
                  alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {alert.type === 'error' ? 'report' : alert.type === 'warning' ? 'priority_high' : 'info'}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex justify-between w-full">
                  <p className="text-sm font-bold text-[#171216] dark:text-white">{alert.title}</p>
                  <span className="text-[10px] text-gray-400">
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : "Ahora"}
                  </span>
                </div>
                {alert.message && <p className="text-xs text-gray-600 dark:text-gray-300">{alert.message}</p>}

                {alert.isRead && <span className="text-[10px] text-gray-400 text-right mt-1">Leído</span>}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-sm text-gray-400 py-10 font-medium">
            No hay alertas activas
          </div>
        )}
      </div>

      {hasPermission('incidents:create') && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-4 bg-[#851c74] text-white p-4 rounded-full shadow-lg shadow-[#851c74]/40 z-30 transition-transform active:scale-90 hover:scale-105 flex items-center gap-2 pr-6"
        >
          <span className="material-symbols-outlined text-2xl">add_alert</span>
          <span className="font-bold">Nueva Alerta</span>
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#851c74] p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">edit_notifications</span>
                Nueva Alerta
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Conflicto en Zona Norte"
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74]"
                  value={newAlertData.title}
                  onChange={(e) => setNewAlertData({ ...newAlertData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prioridad / Tipo</label>
                <select
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74]"
                  value={newAlertData.type}
                  onChange={(e) => setNewAlertData({ ...newAlertData, type: e.target.value as any })}
                >
                  <option value="info">Informativa</option>
                  <option value="warning">Advertencia (Media)</option>
                  <option value="error">Crítica (Alta)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalle</label>
                <textarea
                  rows={3}
                  placeholder="Describa la situación..."
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74]"
                  value={newAlertData.message}
                  onChange={(e) => setNewAlertData({ ...newAlertData, message: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#851c74] text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <span>Emitir Alerta</span>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 px-4 text-center">
        <div className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 opacity-50">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span className="text-[10px] font-black tracking-widest uppercase">Canal Oficial Seguro</span>
        </div>
      </div>
    </main>
  );
}
