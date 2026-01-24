"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { EmptyState } from "@/components/common/EmptyState";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string | null;
  assigneeName: string;
  assigneeId: string | null;
  territories: { id: string, name: string }[];
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
      const params = new URLSearchParams();
      if (activeFilter === "urgent") params.append('priority', 'high');
      if (activeFilter === "assigned" && user?.id) params.append('assigneeId', user.id);

      const res = await fetch(`${url}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
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
      highPriority: tasks.filter(t => (t.priority === "high" || t.priority === "critical") && t.status !== "completed"),
      otherPending: tasks.filter(t => t.status !== "completed" && t.priority !== "high" && t.priority !== "critical"),
      completed: tasks.filter(t => t.status === "completed")
    };
  }, [tasks]);

  const formatDueDate = (value: string | null) => {
    if (!value) return "Sin fecha";
    const parsed = new Date(value);
    return parsed.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  const statusBadge = (status: string) => {
    if (status === "in_progress") return "bg-blue-50 text-blue-600 dark:bg-blue-900/20";
    if (status === "pending") return "bg-amber-50 text-amber-600 dark:bg-amber-900/20";
    return "bg-green-50 text-green-600 dark:bg-green-900/20";
  };

  const statusLabel = (status: string) => {
    if (status === "in_progress") return "En Proceso";
    if (status === "pending") return "Pendiente";
    return "Completada";
  };

  return (
    <main className="pb-24 pt-4 px-4 space-y-6 max-w-4xl mx-auto min-h-screen">
      {/* Filtros */}
      <div className="flex gap-2 px-1 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Todas" },
          { id: "urgent", label: "Urgentes" },
          { id: "assigned", label: "Mías" }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 shadow-sm transition-all text-xs font-black uppercase tracking-widest ${activeFilter === filter.id
              ? "bg-[#851c74] text-white"
              : "bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700"
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 font-bold animate-pulse">Sincronizando tareas...</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="assignment_late"
          title="No hay tareas"
          description="Aún no se han programado tareas para este envío o filtro."
          action={
            <button
              onClick={() => router.push('/new-task')}
              className="bg-[#851c74] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-900/20"
            >
              Crear Primera Tarea
            </button>
          }
        />
      ) : (
        <div className="space-y-8">
          {highPriority.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4 px-2">Prioridad Critica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highPriority.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => router.push(`/tasks/${task.id}`)} formatDueDate={formatDueDate} statusBadge={statusBadge} statusLabel={statusLabel} />
                ))}
              </div>
            </section>
          )}

          {otherPending.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">Hoja de Ruta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherPending.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => router.push(`/tasks/${task.id}`)} formatDueDate={formatDueDate} statusBadge={statusBadge} statusLabel={statusLabel} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500 mb-4 px-2">Finalizadas</h3>
              <div className="space-y-3 opacity-60">
                {completed.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-500 line-through">{task.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{task.territories.map(t => t.name).join(', ') || 'Global'}</p>
                    </div>
                    <span className="material-symbols-outlined text-green-500">verified</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <button
        className="fixed right-6 bottom-24 size-14 bg-[#851c74] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
        onClick={() => router.push("/new-task")}
      >
        <span className="material-symbols-outlined text-3xl">add_task</span>
      </button>
    </main>
  );
}

function TaskCard({ task, onClick, formatDueDate, statusBadge, statusLabel }: { task: Task, onClick: () => void, formatDueDate: any, statusBadge: any, statusLabel: any }) {
  const territoryDisplay = task.territories.map(t => t.name).join(', ') || 'Global';

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#851c74]/20 transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusBadge(task.status)}`}>
          {statusLabel(task.status)}
        </span>
        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase">
          <span className="material-symbols-outlined text-sm">event</span>
          {formatDueDate(task.dueDate)}
        </div>
      </div>

      <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-[#851c74] transition-colors">{task.title}</h4>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-base">near_me</span>
          <span className="text-[11px] font-bold truncate">{territoryDisplay}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-base">account_circle</span>
          <span className="text-[11px] font-bold">{task.assigneeName}</span>
        </div>
      </div>

      {task.priority === 'critical' && (
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div className="absolute top-[10px] right-[-15px] bg-red-500 text-white text-[8px] font-bold py-1 px-8 rotate-45">SOS</div>
        </div>
      )}
    </div>
  );
}
