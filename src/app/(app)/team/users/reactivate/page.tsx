export const dynamic = 'force-dynamic';
export const revalidate = 0;

﻿import Link from "next/link";

export default function TeamUserReactivatePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center">
      <header className="sticky top-0 z-50 w-full max-w-[430px] bg-white/80 dark:bg-background-dark/80 ios-blur border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between h-16">
          <Link
            href="/team"
            className="text-primary flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
          <h1 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Reactivacion
          </h1>
        </div>
      </header>
      <main className="w-full max-w-[430px] flex flex-col gap-6 px-4 py-6 mb-32">
        <section className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 border-4 border-white dark:border-gray-800 shadow-md"
              data-alt="User profile portrait of a professional woman"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKRFFlASc_TS52I6wKk1wjv4bP09OA88VoZjsc4LpmlyuEIB6TuM_nTqHhVnvdgy1tVjCW3pjXwgiCoZdYF1jV9cp8yZcXY-NA_S8xY90KEJKUHP33fGvjEUYzJLcwc7RGhf7_aii83tdx9rJCFBT4mvmBzkG_4zI859ZoQpIuJVCVaQDzsO5w-lqxUsAB8lLvDLGuJXVOhk1L9ihpW7AWaYReWVA0E2VAry1Ehkri2IwfLQ0rK_HVFGs2BhnIT7f38OYYg2T-_qc')",
              }}
            ></div>
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm">
              <span className="material-symbols-outlined text-status-green text-3xl">check_circle</span>
            </div>
          </div>
          <h2 className="text-[#171216] dark:text-white text-2xl font-extrabold tracking-tight">Ana Maria Restrepo</h2>
          <p className="text-[#85667f] dark:text-gray-400 text-sm font-medium mb-4">ID de Usuario: 28,491</p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-status-green/20 border border-status-green/30">
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
            <span className="text-green-800 dark:text-green-400 text-xs font-bold uppercase tracking-widest">Estado: Activo</span>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-[#171216] dark:text-white text-sm font-bold uppercase tracking-wider">Historial de Suspension</h3>
          </div>
          <div className="p-5 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex justify-between items-center py-3">
              <p className="text-[#85667f] dark:text-gray-400 text-sm">Motivo inicial</p>
              <p className="text-[#171216] dark:text-white text-sm font-semibold">Incumplimiento de terminos</p>
            </div>
            <div className="flex justify-between items-center py-3">
              <p className="text-[#85667f] dark:text-gray-400 text-sm">Tiempo inactivo</p>
              <p className="text-[#171216] dark:text-white text-sm font-semibold">15 dias</p>
            </div>
            <div className="flex justify-between items-center py-3">
              <p className="text-[#85667f] dark:text-gray-400 text-sm">Fecha de suspension</p>
              <div className="text-right">
                <p className="text-[#171216] dark:text-white text-sm font-semibold">12 Oct 2023</p>
                <p className="text-[10px] text-[#85667f] uppercase">14:32 GMT-5</p>
              </div>
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="text-[#171216] dark:text-white text-lg font-bold px-1">Accion de Administrador</h3>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="block text-[#171216] dark:text-white text-sm font-bold mb-2" htmlFor="reason">
              Motivo de Reactivacion
            </label>
            <textarea
              className="w-full bg-background-light dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary text-sm p-4 placeholder:text-gray-400 dark:text-white"
              id="reason"
              placeholder="Describa brevemente por que se rehabilita este acceso..."
              rows={4}
            ></textarea>
            <div className="mt-4 flex items-start gap-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <p className="text-primary text-[12px] leading-tight font-medium">
                Esta accion registrara su firma de administrador y enviara una notificacion automatica al usuario por correo electronico.
              </p>
            </div>
          </div>
        </section>
      </main>
      <div className="fixed bottom-0 w-full max-w-[430px] p-6 bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 pb-10">
        <Link
          href="/team/users/reactivate/confirmation"
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">restart_alt</span>
          REHABILITAR ACCESO
        </Link>
      </div>
    </div>
  );
}
