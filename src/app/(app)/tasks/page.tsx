"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function TasksPage() {
  const router = useRouter();
  const { tasks, setTasks, user } = useAppStore();

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTasks(data);
      })
      .catch(console.error);
  }, [setTasks]);

  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // 1. Filter by Chip
    if (activeFilter === "urgent") {
      filtered = filtered.filter(t => t.priority === "high");
    } else if (activeFilter === "territory") {
      filtered = filtered.filter(t => t.territory === user?.territory);
    } else if (activeFilter === "assigned") {
      // Assuming mock user name matches assignee for demo
      filtered = filtered.filter(t => t.assignee === user?.name || t.assignee === "Mi");
    }

    return filtered;
  }, [tasks, activeFilter, user]);

  const { highPriority, otherPending, completed } = useMemo(() => {
    const high = filteredTasks.filter(
      (task) => task.priority === "high" && task.status !== "done"
    );

    const otherPending = filteredTasks.filter(
      (task) => task.status !== "done" && task.priority !== "high"
    );

    const done = filteredTasks.filter((task) => task.status === "done");

    return { highPriority: high, otherPending, completed: done };
  }, [filteredTasks]);

  const formatDueDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const statusBadge = (status: string) => {
    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100";
    }
    if (status === "pending") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100";
    }
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  };

  const statusLabel = (status: string) => {
    if (status === "in_progress") return "En Proceso";
    if (status === "pending") return "Pendiente";
    return "Finalizado";
  };

  return (
    <main className="pb-24 pt-4 px-4 space-y-6">
      <div className="flex gap-2 px-1 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Todas" },
          { id: "urgent", label: "Urgentes" },
          { id: "territory", label: "Territorio" },
          { id: "assigned", label: "Asignadas" }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 shadow-sm transition-all ${activeFilter === filter.id
              ? "bg-primary text-white font-semibold"
              : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium"
              }`}
          >
            <p className="text-sm">{filter.label}</p>
          </button>
        ))}
      </div>

      {highPriority.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 px-1">
            Prioridad Alta
          </h3>
          <div className="space-y-4">
            {highPriority.map((task) => {
              const percent = task.subtasksTotal
                ? Math.round((task.subtasksDone / task.subtasksTotal) * 100)
                : 0;
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 dark:border-gray-700"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${statusBadge(
                          task.status
                        )}`}
                      >
                        {statusLabel(task.status)}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        Vence: {formatDueDate(task.dueDate)}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold leading-snug mb-3">{task.title}</h4>
                    <div className="grid grid-cols-2 gap-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined text-sm">domain</span>
                        <span className="text-sm">{task.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="text-sm">{task.territory}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined text-sm">person</span>
                        <span className="text-sm">{task.assignee}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">Progreso</span>
                        <span className="text-primary">
                          {task.subtasksDone}/{task.subtasksTotal} subtareas
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {otherPending.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 px-1">
            Pendientes
          </h3>
          <div className="space-y-4">
            {otherPending.map((task) => {
              const percent = task.subtasksTotal
                ? Math.round((task.subtasksDone / task.subtasksTotal) * 100)
                : 0;
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 dark:border-gray-700"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${statusBadge(
                          task.status
                        )}`}
                      >
                        {statusLabel(task.status)}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        Vence: {formatDueDate(task.dueDate)}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold leading-snug mb-3">{task.title}</h4>
                    <div className="grid grid-cols-2 gap-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="material-symbols-outlined text-sm">domain</span>
                        <span className="text-sm">{task.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Hecho</h3>
          <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full font-bold">
            {completed.length}
          </span>
        </div>
        {completed.map((task) => (
          <div
            key={task.id}
            className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-semibold text-gray-400 dark:text-gray-500 line-through">
                  {task.title}
                </h4>
                <p className="text-xs text-gray-400">
                  Finalizado por {task.assignee} - {formatDueDate(task.dueDate)}
                </p>
              </div>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
          </div>
        ))}
      </section>

      <div className="fixed bottom-20 right-4 pointer-events-auto z-40">
        <button
          className="bg-primary/20 backdrop-blur-md text-primary p-3 rounded-full shadow-lg border border-primary/20 active:scale-90 transition-transform"
          onClick={() => router.push("/map")}
        >
          <span className="material-symbols-outlined">near_me</span>
        </button>
      </div>

      <button
        className="fixed right-6 bottom-24 size-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
        onClick={() => router.push("/new-task")}
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </main>
  );
}
