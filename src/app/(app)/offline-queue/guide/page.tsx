"use client";

import Link from "next/link";

export default function OfflineQueueGuidePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-[#171216] dark:text-white">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <Link className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10" href="/offline-queue">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </Link>
          <h2 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
            Guía Offline
          </h2>
          <div className="w-10"></div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 pt-6 pb-24 space-y-6">
        <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">sync_saved_locally</span>
            </div>
            <div>
              <h3 className="text-base font-bold">Cómo funciona la cola offline</h3>
              <p className="text-xs text-gray-500">Los datos se almacenan localmente hasta recuperar conexión.</p>
            </div>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li>1. Guardás formularios sin conexión.</li>
            <li>2. Se agregan a la cola segura del dispositivo.</li>
            <li>3. Al volver online, se sincronizan automáticamente.</li>
          </ul>
        </section>
        <section className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Buenas prácticas</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">No cierres la app durante la sincronización.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              <p className="text-sm text-gray-600 dark:text-gray-300">Mantén actualizado tu almacenamiento local.</p>
            </div>
          </div>
        </section>
        <Link className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform text-center" href="/offline-queue">
          Volver a la cola
        </Link>
      </main>
    </div>
  );
}
