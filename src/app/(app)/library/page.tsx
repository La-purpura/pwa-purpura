"use client";

export default function LibraryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Biblioteca de Recursos</h1>
        <div className="relative">
          <input type="text" placeholder="Buscar guías..." className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm w-64 md:w-80" />
          <span className="material-symbols-outlined absolute right-3 top-2 text-gray-400 text-lg">search</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Protocolo de Emergencia", type: "PDF", size: "2.4 MB", color: "red" },
          { title: "Manual de Marca 2026", type: "PDF", size: "15 MB", color: "blue" },
          { title: "Guía de Relevamiento", type: "DOC", size: "500 KB", color: "blue" },
          { title: "Plantilla de Comunicación", type: "PPT", size: "5.1 MB", color: "orange" },
          { title: "Kit de Bienvenida", type: "ZIP", size: "22 MB", color: "purple" },
        ].map((file, i) => (
          <div key={i} className="bg-white dark:bg-[#20121d] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group cursor-pointer flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${file.color}-50 dark:bg-${file.color}-900/20 flex items-center justify-center text-${file.color}-600 font-bold text-xs`}>
              {file.type}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 dark:text-white truncate group-hover:text-primary transition-colors">{file.title}</h3>
              <p className="text-xs text-gray-500">{file.size} • Actualizado hace 2d</p>
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500">download</span>
          </div>
        ))}
      </div>
    </div>
  );
}
