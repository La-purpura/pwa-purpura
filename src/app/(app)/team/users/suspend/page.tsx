export const dynamic = 'force-dynamic';
export const revalidate = 0;

﻿import Link from "next/link";

export default function TeamUserSuspendPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-[430px] mx-auto bg-white dark:bg-background-dark min-h-screen shadow-2xl flex flex-col">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center p-4 justify-between">
            <Link
              href="/team"
              className="text-[#171216] dark:text-white flex size-10 shrink-0 items-center justify-center"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </Link>
            <h2 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
              Suspension Temporal
            </h2>
            <div className="flex w-10 items-center justify-end">
              <Link href="/team" className="text-primary text-sm font-bold cursor-pointer">
                Cancelar
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <section className="flex p-6 @container">
            <div className="flex w-full flex-col gap-4 items-center">
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-4 border-white dark:border-gray-700 shadow-sm"
                  data-alt="Retrato de perfil del usuario administrador Juan Perez"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCC4eI1fRXHw_DRBqPdlz1fOlYonsEMsKEJpHZMAaD9Pns_hFxKUZmMmYY_7ATOYmNbdIHUlcd6xz4VpfHnHIGvdT1y4SBBWDFDkbovKOhbSFdPNgxD0dNblb1HnO6a6lD-cRK_fDCAkO-HXoboqYxcWymmEqaSUIspASy39yeZAkcUoOssnTZnQlR1lTYXIoWi2L0X7tdqBZbHDMZBfDag78_uPpz9ajuVhkN0AECN23RAYeYZshctqjOYHWRR1EaKLL4CXiagL3U')",
                  }}
                ></div>
                <div className="absolute bottom-1 right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white dark:border-gray-700"></div>
              </div>
              <div className="flex flex-col items-center text-center">
                <p className="text-[#171216] dark:text-white text-xl font-bold">Juan Perez</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">ID: LP-88293 • Administrador</p>
                <div className="mt-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
                  Estado: Activo
                </div>
              </div>
            </div>
          </section>
          <section className="px-4 mb-4">
            <div className="flex flex-col items-stretch justify-start rounded-xl border border-warning-amber/20 bg-warning-amber/5 p-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-warning-amber">warning</span>
                <p className="text-warning-amber text-xs font-bold uppercase tracking-widest">Protocolo SUSPENDED</p>
              </div>
              <p className="text-[#171216] dark:text-white text-lg font-bold leading-tight">Aviso de Seguridad</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Esta cuenta pasara a estado <strong>SUSPENDIDO</strong>. Se aplicara un bloqueo de inicio de sesion inmediato y la desactivacion de todos los tokens de acceso activos.
              </p>
            </div>
          </section>
          <div className="px-4 pb-2 pt-4">
            <h3 className="text-[#171216] dark:text-white text-sm font-bold uppercase tracking-widest">Consecuencias del proceso</h3>
          </div>
          <div className="flex flex-col px-4 gap-1">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-4 min-h-[72px] py-2 border border-gray-100 dark:border-gray-700">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <span className="material-symbols-outlined">lock_reset</span>
              </div>
              <div className="flex flex-col justify-center flex-1">
                <p className="text-[#171216] dark:text-white text-sm font-bold">Bloqueo inmediato</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-normal">Cierre de sesion automatico en todos los dispositivos.</p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl px-4 min-h-[72px] py-2 border border-gray-100 dark:border-gray-700">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div className="flex flex-col justify-center flex-1">
                <p className="text-[#171216] dark:text-white text-sm font-bold">Trazabilidad historica</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-normal">Se conserva todo el historial de acciones y registros.</p>
              </div>
              <div className="shrink-0">
                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
              </div>
            </div>
          </div>
          <div className="p-4 mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                Motivo de Suspension
              </label>
              <div className="relative">
                <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm appearance-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-gray-800 dark:text-white">
                  <option value="">Seleccione un motivo...</option>
                  <option value="audit">Auditoria en curso</option>
                  <option value="inactive">Inactividad prolongada</option>
                  <option value="prevention">Medida preventiva</option>
                  <option value="security">Incumplimiento de politicas</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400">expand_more</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                Fecha de revision (Opcional)
              </label>
              <div className="relative">
                <input
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-gray-800 dark:text-white"
                  type="date"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400">calendar_today</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-10"></div>
        </main>
        <footer className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark">
          <Link
            href="/team/users/suspend/confirmation"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">timer_off</span>
            SUSPENDER ACCESO TEMPORALMENTE
          </Link>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4 leading-tight">
            Al confirmar, esta accion quedara registrada en el log de auditoria del sistema &quot;La Purpura Territorio&quot;.
          </p>
        </footer>
      </div>
    </div>
  );
}
