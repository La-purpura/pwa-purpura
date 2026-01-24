"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";

export default function NewTaskPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { hasPermission } = useRBAC();

  const [loading, setLoading] = useState(false);
  const [territories, setTerritories] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: new Date().toISOString().split('T')[0],
    territoryId: "",
    assigneeId: ""
  });

  useEffect(() => {
    // Cargar territorios y equipo para asignación
    Promise.all([
      fetch('/api/territories').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([tData, uData]) => {
      if (Array.isArray(tData)) setTerritories(tData);
      if (Array.isArray(uData)) setTeam(uData);

      // Auto-seleccionar territorio si el usuario tiene uno fijo
      const u = user as any;
      if (u?.territoryId) {
        setFormData(prev => ({ ...prev, territoryId: u.territoryId }));
      }
    }).catch(console.error);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/tasks");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Error al crear la tarea");
      }
    } catch (e) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="text-gray-500 flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold">Nueva Tarea Operativa</h2>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Título de la Tarea</label>
              <input
                required
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-4 text-sm focus:ring-2 ring-[#851c74] transition-all"
                placeholder="Ej. Relevamiento Barrio San Martín"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Territorio</label>
                <select
                  required
                  disabled={!!(user as any)?.territoryId && !hasPermission('territory:manage')}
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-3 text-sm focus:ring-2 ring-[#851c74] disabled:opacity-60"
                  value={formData.territoryId}
                  onChange={e => setFormData({ ...formData, territoryId: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {territories.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Asignar a</label>
                <select
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-3 text-sm focus:ring-2 ring-[#851c74]"
                  value={formData.assigneeId}
                  onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
                >
                  <option value="">Sin asignar (Global)</option>
                  {team.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Prioridad</label>
                <select
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-3 text-sm focus:ring-2 ring-[#851c74]"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta / Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Fecha Límite</label>
                <input
                  className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-4 text-sm focus:ring-2 ring-[#851c74]"
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Descripción / Instrucciones</label>
              <textarea
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none min-h-[100px] p-4 text-sm focus:ring-2 ring-[#851c74] resize-none"
                placeholder="Detalla los pasos a seguir o información relevante..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#851c74] hover:bg-[#6d165f] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#851c74]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            type="submit"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                CREAR TAREA
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            La tarea será visible inmediatamente para el asignado.
          </p>
        </form>
      </main>
    </div>
  );
}
