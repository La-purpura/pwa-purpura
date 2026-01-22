"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function NewTaskPage() {
  const router = useRouter();
  const addTask = useAppStore((state) => state.addTask);
  const addToOfflineQueue = useAppStore((state) => state.addToOfflineQueue);
  const user = useAppStore((state) => state.user);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  // Territory Management
  const [territory, setTerritory] = useState("");
  const [territoryId, setTerritoryId] = useState(""); // ID real para backend
  const [availableTerritories, setAvailableTerritories] = useState<{ id: string, name: string }[]>([]);
  const [isLoadingTerritories, setIsLoadingTerritories] = useState(false);

  // Auto-fill territory if user has restricted scope
  useEffect(() => {
    if (!user) return;

    // Si el usuario tiene territorio fijo (no es Admin Nacional global)
    // Nota: Dependiendo de cómo guardemos 'territory' en el store (nombre vs ID).
    // Asumiremos que el backend en /api/auth/login devuelve { territory: "La Plata" } como nombre.
    // Lo ideal es tener territoryId en el user store.

    // Simulación de lógica RBAC simple en Frontend (Backend es quien manda)
    const isAdminGlobal = user.role === "SuperAdminNacional" || user.role === "AdminNacional";

    if (isAdminGlobal) {
      setIsLoadingTerritories(true);
      fetch('/api/territories')
        .then(res => res.json())
        .then(data => {
          setAvailableTerritories(data);
          setIsLoadingTerritories(false);
        })
        .catch(() => setIsLoadingTerritories(false));
    } else {
      // Usuario restringido: Pre-llenar y bloquear
      setTerritory(user.territory || "Mi Territorio");
      // No tenemos el territoryId aquí si el login no lo devolvió, pero la API lo resolverá por sesión.
    }
  }, [user]);

  const [assignee, setAssignee] = useState(user?.name || "");
  const [priority, setPriority] = useState("high");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [subtasksTotal, setSubtasksTotal] = useState("3");
  const [description, setDescription] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      alert("El título es obligatorio.");
      return;
    }

    const taskPayload = {
      title: title.trim(),
      priority: priority as "low" | "medium" | "high",
      dueDate: dueDate || new Date().toISOString(),
      category: category || "Operativos",
      territory: territory,      // Nombre (para UI offline)
      territoryId: territoryId,  // ID (para Backend)
      assignee: assignee,
      description: description,
      subtasksTotal: Number(subtasksTotal) || 1,
      status: "pending"
    };

    // 1. Backend Sync (Intento online)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload),
      });

      if (res.ok) {
        const serverTask = await res.json();
        // Actualizar store con la tarea confirmada por servidor
        addTask({
          ...taskPayload,
          id: serverTask.id,
          status: serverTask.status,
          date: new Date().toISOString(),
          subtasksDone: 0
        });
        router.push("/tasks");
        return;
      }
    } catch (e) {
      console.log("Offline mode detected, queuing task.");
    }

    // 2. Fallback Offline
    const offlineId = Math.random().toString(36).substr(2, 9);
    addTask({ ...taskPayload, id: offlineId, subtasksDone: 0, date: new Date().toISOString(), status: 'pending' });
    addToOfflineQueue({
      id: offlineId,
      type: "task",
      title: title.trim(),
    });

    router.push("/tasks");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-[#171216] dark:text-white pb-24">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <button
            className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => router.push("/tasks")}
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          <h2 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Nueva Tarea
          </h2>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <section>
          <h3 className="text-[#171216] dark:text-white tracking-tight text-2xl font-extrabold leading-tight">
            Crear Operativo
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-normal mt-2">
            Registrar nueva acción territorial.
          </p>
        </section>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <label className="flex flex-col w-full">
              <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-1.5 ml-1">Titulo</p>
              <input
                className="form-input w-full rounded-lg text-[#171216] dark:text-white focus:ring-2 focus:ring-primary/20 border border-[#e4dce3] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary h-12 placeholder:text-gray-400 p-3 text-sm transition-all"
                placeholder="Ej. Relevamiento Barrio San Juan"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            {/* Selector de Territorio Inteligente */}
            <label className="flex flex-col w-full">
              <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-1.5 ml-1">Territorio</p>

              {availableTerritories.length > 0 ? (
                <select
                  className="form-input w-full rounded-lg text-[#171216] dark:text-white border border-[#e4dce3] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-3 text-sm"
                  value={territoryId}
                  onChange={(e) => {
                    setTerritoryId(e.target.value);
                    setTerritory(e.target.options[e.target.selectedIndex].text);
                  }}
                >
                  <option value="">Seleccionar Territorio...</option>
                  {availableTerritories.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-input w-full rounded-lg bg-gray-100 dark:bg-gray-800 border-none text-gray-500 cursor-not-allowed h-12 p-3 text-sm"
                  type="text"
                  value={territory}
                  readOnly
                  title="Asignado automáticamente por tu rol"
                />
              )}
            </label>

            <label className="flex flex-col w-full">
              <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-1.5 ml-1">Categoria</p>
              <input
                className="form-input w-full rounded-lg text-[#171216] dark:text-white border border-[#e4dce3] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-3 text-sm"
                placeholder="Ej. Urbanizacion"
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </label>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex flex-col">
              <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-3 ml-1">Prioridad</p>
              <div className="grid grid-cols-3 gap-3">
                {["high", "medium", "low"].map((level) => (
                  <label key={level} className="cursor-pointer">
                    <input
                      className="hidden peer"
                      type="radio"
                      name="priority"
                      value={level}
                      checked={priority === level}
                      onChange={() => setPriority(level)}
                    />
                    <div className="text-center py-3 rounded-lg border border-gray-200 dark:border-gray-700 peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 peer-checked:text-primary">
                        {level === "high" ? "Alta" : level === "medium" ? "Media" : "Baja"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col">
                <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-2 ml-1">Fecha limite</p>
                <input
                  className="form-input w-full rounded-lg text-[#171216] dark:text-white border border-[#e4dce3] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-3 text-sm"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </label>
              <label className="flex flex-col">
                <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-2 ml-1">Subtareas</p>
                <input
                  className="form-input w-full rounded-lg text-[#171216] dark:text-white border border-[#e4dce3] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 p-3 text-sm"
                  type="number"
                  min={1}
                  value={subtasksTotal}
                  onChange={(event) => setSubtasksTotal(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
            <p className="text-[#171216] dark:text-gray-300 text-sm font-semibold pb-3 ml-1">Descripcion</p>
            <textarea
              className="form-input w-full resize-none rounded-lg text-[#171216] dark:text-white border border-[#e4dce3] dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[120px] p-3 text-sm"
              placeholder="Detalles..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            ></textarea>
          </div>

          <button
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            type="submit"
          >
            <span className="material-symbols-outlined">add_task</span>
            Confirmar Operativo
          </button>
        </form>
      </main>
    </div>
  );
}
