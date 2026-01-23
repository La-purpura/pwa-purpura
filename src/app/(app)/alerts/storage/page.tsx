"use client";

import Link from "next/link";

const categories = [
  { title: "Borradores", amount: "12 MB", width: "w-1/6", icon: "edit_note" },
  { title: "Multimedia / Evidencias", amount: "1.2 GB", width: "w-4/6", icon: "perm_media" },
  { title: "Documentos Offline", amount: "450 MB", width: "w-2/6", icon: "offline_pin" },
];

export default function AlertsStoragePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-[#171216] dark:text-white min-h-screen flex flex-col font-display">
      <header className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-gray-200 dark:border-gray-800">
        <Link className="flex size-10 items-center justify-center rounded-full text-primary" href="/alerts">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight">Estado de Almacenamiento</h2>
        <div className="w-10"></div>
      </header>
      <main className="flex-1">
        <div className="p-4">
          <div className="bg-white dark:bg-[#2d1b2a] rounded-xl p-6 shadow-sm border border-[#e4dce3] dark:border-[#3d263a] flex flex-col items-center gap-4">
            <div className="relative size-40 rounded-full circular-progress border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#171216] dark:text-white">45%</span>
                <span className="text-xs font-medium text-[#85667f] dark:text-[#b08ca7]">EN USO</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold">1.8 GB de 4 GB</p>
              <p className="text-sm text-[#85667f] dark:text-[#b08ca7]">Almacenamiento local disponible</p>
            </div>
          </div>
        </div>
        <section className="px-4 py-2">
          <h3 className="text-lg font-bold mb-4">Desglose de datos</h3>
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <div
                key={category.title}
                className="flex items-center justify-between gap-4 rounded-xl bg-white dark:bg-[#2d1b2a] p-4 shadow-sm border border-[#e4dce3] dark:border-[#3d263a]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[28px]">{category.icon}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-base font-bold text-[#171216] dark:text-white">{category.title}</p>
                  <div className="w-full bg-[#e4dce3] dark:bg-[#3d263a] rounded-full h-1.5 overflow-hidden">
                    <div className={`${category.width} bg-primary h-full rounded-full`}></div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#85667f] dark:text-[#b08ca7]">{category.amount}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="px-4 py-6">
          <div className="bg-white dark:bg-[#2d1b2a] rounded-xl p-5 border border-[#e4dce3] dark:border-[#3d263a]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#85667f] dark:text-[#b08ca7] mb-4">Información del Sistema</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#171216] dark:text-white">Service Worker</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="size-2 rounded-full bg-green-500"></span>Activo
                </span>
              </div>
              <div className="h-px bg-[#e4dce3] dark:bg-[#3d263a]"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#171216] dark:text-white">Última Sincronización</span>
                <span className="text-sm font-bold text-[#85667f] dark:text-[#b08ca7]">Hoy, 14:32</span>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 pb-10 space-y-3">
          <button
            onClick={() => {
              if (confirm("¿Limpiar archivos temporales?")) alert("Caché liberada: 120 MB.");
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">cleaning_services</span>
            Limpiar Caché de Documentos
          </button>
          <button
            onClick={() => {
              alert("Base de datos optimizada correctamente.");
            }}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary py-4 rounded-xl border border-primary/20 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">database</span>
            Optimizar Base de Datos
          </button>
        </section>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/95 dark:bg-background-dark/90 backdrop-blur-lg border-t border-[#e4dce3] dark:border-[#3d263a] px-6 py-3 flex justify-between items-center z-20">
        <Link className="flex flex-col items-center gap-1 text-[#85667f] dark:text-[#b08ca7]" href="/home">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-[#85667f] dark:text-[#b08ca7]" href="/map">
          <span className="material-symbols-outlined">map</span>
          <span className="text-[10px] font-bold">Mapa</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-primary" href="/alerts/storage">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <span className="material-symbols-outlined">storage</span>
          </div>
          <span className="text-[10px] font-bold">Datos</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-[#85667f] dark:text-[#b08ca7]" href="/sync-center">
          <span className="material-symbols-outlined">sync</span>
          <span className="text-[10px] font-bold">Sync</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-[#85667f] dark:text-[#b08ca7]" href="/profile">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">Perfil</span>
        </Link>
      </nav>
      <div className="h-6 bg-background-light dark:bg-background-dark"></div>
    </div>
  );
}
