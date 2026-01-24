"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuditLogsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");

  // Mock Audit Data
  const logs = [
    { id: 1, action: "USER_LOGIN", user: "Juan Pérez", territory: "Godoy Cruz", time: "Hace 2 min", status: "success" },
    { id: 2, action: "TASK_CREATED", user: "Maria Gomez", territory: "Capital", time: "Hace 15 min", status: "success" },
    { id: 3, action: "SYNC_ERROR", user: "Sistema", territory: "N/A", time: "Hace 1 hora", status: "warning" },
    { id: 4, action: "USER_INVITE", user: "Admin", territory: "Mendoza", time: "Ayer", status: "success" },
    { id: 5, action: "DELETE_ATTEMPT", user: "Carlos Ruiz", territory: "Las Heras", time: "Ayer", status: "error" },
  ];

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.status === filter);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-24 text-[#171216] dark:text-white">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between max-w-md mx-auto">
        <button onClick={() => router.back()} className="text-primary">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="font-bold text-lg">Logs de Auditoría</h2>
        <div className="w-6" />
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['all', 'success', 'warning', 'error'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className={`mt-1 size-2 rounded-full flex-shrink-0 ${log.status === 'success' ? 'bg-green-500' :
                  log.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{log.action}</h3>
                  <span className="text-[10px] text-gray-400">{log.time}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium text-primary">{log.user}</span> • {log.territory}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl flex gap-3 text-xs text-blue-700 dark:text-blue-300">
          <span className="material-symbols-outlined text-lg">info</span>
          <p>Estos registros son inmutables y se conservan por 90 días por razones de cumplimiento.</p>
        </div>
      </main>
    </div>
  );
}
