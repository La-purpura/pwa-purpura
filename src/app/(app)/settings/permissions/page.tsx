export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link";

export default function PermissionsPage() {
  const modules = [
    {
      name: "Incidencias",
      subtitle: "Reporte y seguimiento",
      toggles: ["Ver", "Crear", "Editar", "Eliminar"],
    },
    {
      name: "Usuarios",
      subtitle: "Gestión de personal",
      toggles: ["Ver", "Crear", "Editar", "Eliminar"],
      disabled: ["Editar", "Eliminar"],
    },
    {
      name: "Reportes",
      subtitle: "Analítica y KPIs",
      toggles: ["Ver", "Exportar"],
    },
    {
      name: "Biblioteca",
      subtitle: "Documentos y guías",
      toggles: ["Ver", "Descargar"],
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-manrope min-h-screen flex flex-col text-text-main dark:text-text-main-dark">
      <header className="bg-surface-light dark:bg-surface-dark shadow-sm">
        <div className="flex items-center p-4 justify-between h-16">
          <Link
            href="/settings"
            className="text-text-main dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <div className="text-center flex-1 text-lg font-bold dark:text-white">Configuración de Permisos</div>
          <div className="w-10" />
        </div>
        <div className="px-4 pb-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              Administrador
            </button>
            <button className="flex-1 rounded-lg py-2.5 bg-white dark:bg-surface-light shadow-sm text-primary text-sm font-bold transition-all ring-1 ring-black/5">
              Colaborador
            </button>
            <button className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              Observador
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-4 px-4 space-y-4">
        {modules.map((module) => (
          <section
            key={module.name}
            className="bg-surface-light dark:bg-surface-dark rounded-2xl p-5 shadow-card border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div
                className={`size-10 rounded-full flex items-center justify-center ${
                  module.name === "Incidencias"
                    ? "bg-primary/10 text-primary"
                    : module.name === "Usuarios"
                    ? "bg-blue-50 text-blue-600 dark:text-blue-400"
                    : module.name === "Reportes"
                    ? "bg-orange-50 text-orange-600 dark:text-orange-400"
                    : "bg-emerald-50 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span className="material-symbols-outlined">
                  {module.name === "Usuarios"
                    ? "group"
                    : module.name === "Reportes"
                    ? "bar_chart"
                    : module.name === "Biblioteca"
                    ? "library_books"
                    : "assignment_late"}
                </span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white text-base font-bold">{module.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{module.subtitle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {module.toggles.map((label) => {
                const disabled = module.disabled?.includes(label);
                return (
                  <div
                    key={label}
                    className={`flex items-center justify-between ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" disabled={disabled} defaultChecked={!disabled} />
                      <div
                        className={`w-11 h-6 rounded-full peer-focus:outline-none ${
                          disabled ? "bg-slate-100 dark:bg-slate-800" : "bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary"
                        } peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="flex-none bg-surface-light dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 p-4 pb-8 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
        <Link
          href="/settings"
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          Guardar Cambios
        </Link>
      </footer>
    </div>
  );
}
