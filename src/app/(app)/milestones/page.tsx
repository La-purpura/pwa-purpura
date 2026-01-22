"use client";

export default function MilestonesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Matriz de Hitos y Riesgos</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hitos */}
        <div className="bg-white dark:bg-[#20121d] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <h2 className="font-bold text-lg">Próximos Hitos</h2>
          </div>
          <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 ml-2">
            {[
              { title: "Cierre de Padrones", date: "15 Feb", status: "Pendiente" },
              { title: "Inicio de Capacitaciones", date: "01 Mar", status: "En Proceso" },
              { title: "Lanzamiento App v2", date: "10 Mar", status: "Planificado" },
            ].map((m, i) => (
              <div key={i} className="relative pl-6">
                <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#20121d] bg-cyan-500 shadow-sm"></div>
                <p className="font-bold text-gray-800 dark:text-white text-sm">{m.title}</p>
                <p className="text-xs text-gray-500">{m.date} • {m.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Riesgos */}
        <div className="bg-white dark:bg-[#20121d] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h2 className="font-bold text-lg">Mapa de Riesgos</h2>
          </div>
          {/* Mock heatmap or list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
              <span className="font-medium text-sm text-red-800 dark:text-red-300">Baja conectividad en Zona Norte</span>
              <span className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-white text-[10px] font-bold rounded uppercase">Alto</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
              <span className="font-medium text-sm text-yellow-800 dark:text-yellow-300">Demora en entrega de insumos</span>
              <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-white text-[10px] font-bold rounded uppercase">Medio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
