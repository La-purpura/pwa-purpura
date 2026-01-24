"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useRBAC } from "@/hooks/useRBAC";
import { HierarchicalTerritorySelector } from "@/components/common/HierarchicalTerritorySelector";
import { apiFetch } from "@/lib/api";

export default function NewTaskPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { hasPermission } = useRBAC();

  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: new Date().toISOString().split('T')[0],
    territoryIds: [] as string[],
    assigneeId: ""
  });

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(uData => {
        if (Array.isArray(uData)) setTeam(uData);
      })
      .catch(console.error);

    // Auto-seleccionar territorio si el usuario tiene uno fijo (opcional, ahora es multi)
    const u = user as any;
    if (u?.territoryId) {
      setFormData(prev => ({ ...prev, territoryIds: [u.territoryId] }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.territoryIds.length === 0) {
      alert("Debes seleccionar al menos un territorio de alcance.");
      return;
    }
    setLoading(true);

    try {
      const res = await apiFetch("/api/tasks", {
        method: "POST",
        body: formData,
        title: `Crear tarea: ${formData.title}`
      });

      if (res.ok || res.status === 202) {
        // En caso de 202 (queued), también redirigimos
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
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-4 text-sm focus:ring-2 ring-[#851c74] transition-all font-bold"
                placeholder="Ej. Relevamiento Barrio San Martín"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <HierarchicalTerritorySelector
                label="Alcance Territorial"
                selectedIds={formData.territoryIds}
                onChange={(ids) => setFormData({ ...formData, territoryIds: ids })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Asignar a Responsable</label>
              <select
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 px-3 text-sm focus:ring-2 ring-[#851c74]"
                value={formData.assigneeId}
                onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
              >
                <option value="">Sin asignar (Global por territorio)</option>
                {team.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
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
                  <option value="critical">Crítica</option>
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
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 border-none min-h-[120px] p-4 text-sm focus:ring-2 ring-[#851c74] resize-none leading-relaxed"
                placeholder="Detalla los pasos a seguir o información relevante que el responsable debe conocer..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#851c74] hover:bg-[#6d165f] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#851c74]/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            type="submit"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
            ) : (
              <>
                <span className="material-symbols-outlined">send</span>
                CREAR Y SEGMENTAR TAREA
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-gray-400 uppercase font-black tracking-widest">
            La tarea será visible para todos los responsables del territorio seleccionado.
          </p>
        </form>
      </main>
    </div>
  );
}
