export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link";

export default function AlertRevokeConfirmationPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center text-[#171216] dark:text-white">
      <nav className="w-full max-w-[480px] flex items-center bg-white dark:bg-[#2d1b2a] p-4 sticky top-0 z-10">
        <Link
          href="/alerts/revoke"
          className="text-[#171216] dark:text-white p-2 bg-white dark:bg-background-dark rounded-full shadow-sm"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </Link>
        <h2 className="flex-1 text-center font-bold text-lg tracking-tight">Confirmación de Revocación</h2>
        <div className="w-10"></div>
      </nav>
      <main className="w-full max-w-[480px] flex-1 px-6 py-8 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl transform scale-150"></div>
          <div className="relative w-24 h-24 bg-white dark:bg-[#2d1b2a] rounded-full flex items-center justify-center ios-shadow border border-primary/10">
            <span className="material-symbols-outlined text-primary text-[48px]">shield_person</span>
            <div className="absolute top-0 right-0 bg-red-500 rounded-full p-1 border-4 border-background-light dark:border-background-dark">
              <span className="material-symbols-outlined text-white text-sm">close</span>
            </div>
          </div>
        </div>
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl font-extrabold leading-tight">Acceso Revocado Exitosamente</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            El usuario ha sido dado de baja definitivamente del sistema central.
          </p>
        </div>
        <div className="w-full bg-white dark:bg-[#2d1b2a] rounded-xl p-6 ios-shadow border border-[#e4dce3] dark:border-primary/20 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/5 rounded-lg">
              <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-tight text-gray-500 dark:text-gray-400">Registro de Trazabilidad</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">ID DE AUDITORÍA</p>
              <p className="text-xl font-mono font-bold text-primary tracking-tighter">#TRX-99283-LP</p>
            </div>
            <div className="h-[1px] bg-gray-100 dark:bg-gray-800"></div>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">FECHA Y HORA</p>
                <p className="text-sm font-medium">24 Oct 2023 • 14:32:05</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">ORIGEN</p>
                <p className="text-sm font-medium">Panel Admin v2.4</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full space-y-3">
  <Link
    href="/audits/matrix"
    className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
  >
    <span className="material-symbols-outlined">analytics</span>
    Ver Matriz de Auditoría
  </Link>
  <Link
    href="/team"
    className="w-full bg-white dark:bg-transparent border border-primary/20 text-primary font-bold py-4 rounded-xl"
  >
    Volver a Gestión de Equipo
  </Link>
</div>
        <div className="mt-12 opacity-40">
          <div className="w-32 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto"></div>
        </div>
      </main>
      <div className="fixed bottom-0 right-0 -z-10 opacity-5">
        <span className="material-symbols-outlined text-[400px]">lock_reset</span>
      </div>
    </div>
  );
}

