"use client";

import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { HierarchicalTerritorySelector } from "@/components/common/HierarchicalTerritorySelector";

type Alert = {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "news";
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  territoryNames: string;
  createdAt: string;
  isRead: boolean;
};

export default function AlertsHubPage() {
  const { hasPermission, user } = useRBAC();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"alerts" | "notifications">("alerts");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAlertData, setNewAlertData] = useState({
    title: "",
    message: "",
    type: "info",
    severity: "medium",
    territoryIds: [] as string[]
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/read`, { method: "POST" });
      if (res.ok) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
      }
    } catch (e) { console.error(e); }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlertData)
      });

      if (res.ok) {
        fetchAlerts();
        setIsModalOpen(false);
        setNewAlertData({ title: "", message: "", type: "info", severity: "medium", territoryIds: [] });
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "alerts") return a.severity === "high" || a.severity === "critical";
    return true;
  });

  return (
    <main className="pb-24 min-h-screen bg-gray-50 dark:bg-black">
      <div className="px-4 py-6 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800">
        <div className="flex h-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 h-full rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'alerts' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#851c74]' : 'text-gray-400'}`}
          >
            Críticas
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 h-full rounded-xl transition-all text-xs font-black uppercase tracking-widest ${activeTab === 'notifications' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#851c74]' : 'text-gray-400'}`}
          >
            Todas
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold dark:text-white">Centro de Alertas</h2>
          {activeTab === 'alerts' && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full animate-pulse">
              <span className="size-1.5 bg-red-500 rounded-full"></span> VIVO
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse font-bold">Sincronizando canal oficial...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-20 text-center text-gray-400 italic">No hay alertas en esta categoría.</div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => !alert.isRead && handleMarkAsRead(alert.id)}
              className={`group relative bg-white dark:bg-[#1a1a1a] p-5 rounded-3xl border transition-all cursor-pointer ${alert.isRead ? 'opacity-60 border-transparent shadow-none' : 'border-[#851c74]/10 shadow-lg shadow-purple-900/5'
                }`}
            >
              <div className="flex gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.severity === 'critical' || alert.severity === 'high' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                  <span className="material-symbols-outlined">{
                    alert.type === 'error' ? 'report' : alert.type === 'warning' ? 'warning' : 'volume_up'
                  }</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black uppercase text-[#851c74] tracking-widest truncate max-w-[200px]">{alert.territoryNames}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#851c74] transition-colors">{alert.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              {!alert.isRead && (
                <div className="absolute top-2 right-2 size-2 bg-[#851c74] rounded-full"></div>
              )}
            </div>
          ))
        )}
      </div>

      {hasPermission('posts:create') && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-4 bg-[#851c74] text-white size-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
        >
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12">add_alert</span>
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <form onSubmit={handleCreateAlert} className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200 scroll-smooth max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#851c74]">broadcast_on_home</span>
              Broadcast Crítico
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Título de la Emergencia</label>
                <input
                  required
                  type="text"
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm font-bold"
                  placeholder="Ej: Inundación en Sector 3"
                  value={newAlertData.title}
                  onChange={e => setNewAlertData({ ...newAlertData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Severidad</label>
                  <select
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-xs font-bold"
                    value={newAlertData.severity}
                    onChange={e => setNewAlertData({ ...newAlertData, severity: e.target.value as any })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                <HierarchicalTerritorySelector
                  label="Alcance del Broadcast"
                  selectedIds={newAlertData.territoryIds}
                  onChange={(ids) => setNewAlertData({ ...newAlertData, territoryIds: ids })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mensaje Directo</label>
                <textarea
                  required
                  rows={3}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-2 ring-[#851c74] text-sm resize-none"
                  placeholder="Escribe el contenido de la alerta..."
                  value={newAlertData.message}
                  onChange={e => setNewAlertData({ ...newAlertData, message: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-gray-100 text-gray-500">Cancelar</button>
              <button type="submit" className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-red-600 text-white shadow-xl shadow-red-900/20 active:scale-95 transition-all">EMITIR BROADCAST</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
