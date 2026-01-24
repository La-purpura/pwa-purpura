"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  assigneeName: string;
  assigneeId: string | null;
  territoryName: string;
  territoryId: string | null;
};

export default function TasksPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = '/api/tasks';
      if (activeFilter === "urgent") url += '?priority=high';
      if (activeFilter === "assigned") url += `?assigneeId=${user?.id}`;
      // Territory filter is handled server-side by scope, but we could add explicit filter if needed

      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeFilter, user?.id]);

  const { highPriority, otherPending, completed } = useMemo(() => {
    return {
      highPriority: tasks.filter(t => t.priority === "high" && t.status !== "completed"),
      otherPending: tasks.filter(t => t.status !== "completed" && t.priority !== "high"),
      completed: tasks.filter(t => t.status === "completed")
    };
  }, [tasks]);

  const formatDueDate = (value: string | null) => {
    if (!value) return "Sin fecha";
    const parsed = new Date(value);
    return parsed.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  const statusBadge = (status: string) => {
    if (status === "in_progress") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (status === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  };

  const statusLabel = (status: string) => {
    if (status === "in_progress") return "En Proceso";
    if (status === "pending") return "Pendiente";
    return "Completada";
  };

  return (
    <main className="pb-24 pt-4 px-4 space-y-6 max-w-4xl mx-auto">
      {/* Filtros */}
      <div className="flex gap-2 px-1 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Todas" },
          { id: "urgent", label: "Urgentes" },
          { id: "assigned", label: "Asignadas a mí" }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 shadow-sm transition-all ${activeFilter === filter.id
              ? "bg-[#851c74] text-white font-bold"
              : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-medium"
              }`}
          >
            <p className="text-sm">{filter.label}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500">
          <div className="animate-spin h-8 w-8 border-2 border-[#851c74] border-t-transparent rounded-full mx-auto mb-4"></div>
          Cargando tareas...
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 italic">No se encontraron tareas en esta categoría.</p>
        </div>
      ) : (
        <>
          {highPriority.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 px-1">Prioridad Crítica</h3>
              <div className="space-y-3">
                {highPriority.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => router.push(`/tasks/${task.id}`)} formatDueDate={formatDueDate} statusBadge={statusBadge} statusLabel={statusLabel} />
                ))}
              </div>
            </section>
          )}

          {otherPending.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 px-1">Próximas Tareas</h3>
              <div className="space-y-3">
                {otherPending.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => router.push(`/tasks/${task.id}`)} formatDueDate={formatDueDate} statusBadge={statusBadge} statusLabel={statusLabel} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#851c74] mb-3 px-1">Completadas</h3>
              <div className="space-y-2 opacity-70">
                {completed.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/60 dark:bg-gray-800/40 rounded-xl p-4 border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 line-through">{task.title}</h4>
                      <p className="text-[10px] text-gray-400">Finalizada el {formatDueDate(task.dueDate)}</p>
                    </div>
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <button
        className="fixed right-6 bottom-24 size-14 bg-[#851c74] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50 group"
        onClick={() => router.push("/new-task")}
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
      </button>
    </main>
  );
}

function TaskCard({ task, onClick, formatDueDate, statusBadge, statusLabel }: { task: Task, onClick: () => void, formatDueDate: any, statusBadge: any, statusLabel: any }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#851c74]/30 transition-all cursor-pointer group active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${statusBadge(task.status)}`}>
          {statusLabel(task.status)}
        </span>
        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">calendar_today</span>
          {formatDueDate(task.dueDate)}
        </span>
      </div>
      <h4 className="text-base font-bold text-gray-800 dark:text-white leading-snug mb-3 group-hover:text-[#851c74] transition-colors">{task.title}</h4>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span className="text-[11px] font-semibold">{task.territoryName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-sm">person</span>
          <span className="text-[11px] font-semibold truncate max-w-[100px]">{task.assigneeName}</span>
        </div>
      </div>
    </div>
  );
}
