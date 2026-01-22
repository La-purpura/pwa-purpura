"use client";

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Actividades</h1>
        <button className="text-sm font-medium text-primary hover:underline">Exportar CSV</button>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-[#20121d] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-xs">
              SYS
            </div>
            <div>
              <p className="text-sm text-gray-800 dark:text-white font-medium">Sistema realizó una copia de seguridad automática.</p>
              <p className="text-xs text-gray-500 mt-1">19 Ene 2026, 14:30 hs • Servidor Central</p>
            </div>
          </div>
        ))}
        {/* Placeholder for more */}
        <div className="text-center py-4">
          <span className="text-xs text-gray-400">Mostrando últimos 3 eventos</span>
        </div>
      </div>
    </div>
  );
}
