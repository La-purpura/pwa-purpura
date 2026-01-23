export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link";

export default function AlertsHistoryPage() {
  const versions = [
    {
      label: "v2.0",
      date: "20 Ene 2024",
      author: "Admin Central",
      status: "Vigente",
      statusColor: "bg-[#41A06B]",
      summary: "Versión actual con protocolos de seguridad aprobados.",
    },
    {
      label: "v1.2",
      date: "15 May 2023",
      author: "Carlos Rodríguez",
      summary:
        "Ajustes menores en la redacción del capítulo de sanciones y actualización de anexos.",
      muted: true,
    },
    {
      label: "v1.1",
      date: "02 Nov 2022",
      author: "Elena Marín",
      summary: "Corrección de errores tipográficos en reglamento de asistencia.",
      muted: true,
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#171216] dark:text-white min-h-screen">
      <header className="sticky top-0 z-50 bg-primary text-white px-4 pt-10 pb-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/alerts"
            className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Historial de Versiones</h1>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-white">info</span>
          </button>
        </div>
        <div className="px-2">
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Documento Seleccionado</p>
          <h2 className="text-xl font-bold">Manual de Convivencia</h2>
        </div>
      </header>
      <main className="p-4 space-y-6 max-w-md mx-auto">
        <section className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex h-10 items-center gap-2 px-5 rounded-full bg-primary text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]">list</span>
            <p className="text-sm font-semibold leading-normal">Todas las versiones</p>
          </div>
          <div className="flex h-10 items-center gap-2 px-5 rounded-full bg-white dark:bg-primary/20 border border-primary/10 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-primary">history</span>
            <p className="text-sm font-medium text-[#171216] dark:text-white/90">Solo históricos</p>
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#85667f] dark:text-primary/60">
              Versión actual
            </h3>
          </div>
          <div className="bg-white dark:bg-[#2d1b2a] rounded-xl border border-primary/5 overflow-hidden">
            <div className="relative h-32 bg-primary/10">
              <div className="absolute inset-0 bg-cover bg-center opacity-80" data-alt="Abstract purple pattern" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD682mvvC5Bx3z8JZoZbwFVtoMYpsD-AyvegweIkzKN2yToqZfoGmFPcskidvFVZpv5z0zG6xetBcx5ch2AklqW7yJZuE8HEaTqqDzQMSsRTMKX5Bjh3nlkZTbRemgUsCG9NDiBkPJCtdOdboOmUhrobhPFrBSHxsi81EdYDhRuwML_ap759SFrYnX4C68neI9pMfXsOx7rzdlzqUDnCrB3iJgZBD8Vc6UuU1XaOB6PWnCgtLS2jVriYHZ4heRHfwS9EaGVq7TBtJ8')" }}></div>
              <div className="absolute top-3 right-3">
                <span className="bg-[#41A06B] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">Vigente</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-2xl font-extrabold text-[#171216] dark:text-white">v2.0</p>
                  <p className="text-xs text-[#85667f] dark:text-white/60 font-medium">Actualizado el 20 Ene 2024</p>
                </div>
                <p className="text-xs text-[#85667f] dark:text-white/60 font-medium italic">Por: Admin Central</p>
              </div>
              <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 mb-5 border-l-4 border-primary">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Cambios principales</p>
                <p className="text-sm leading-relaxed text-[#171216] dark:text-white/80">
                  Versión con protocolos de seguridad actualizados y aprobados por la junta directiva.
                </p>
              </div>
              <Link
                href="/read-report"
                className="w-full bg-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined">visibility</span>
                Previsualizar Actual
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between mb-3 px-1 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#85667f] dark:text-primary/60">Historial Reemplazado</h3>
          </div>
          {versions.slice(1).map(({ label, date, author, summary }) => (
            <div
              key={label}
              className="bg-white dark:bg-[#2d1b2a] rounded-xl border border-gray-100 dark:border-white/5 flex flex-col overflow-hidden opacity-90 grayscale-[0.3] shadow-sm"
            >
              <div className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-[#171216] dark:text-white">{label}</p>
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Histórico
                    </span>
                  </div>
                  <p className="text-xs text-[#85667f] dark:text-white/60">{date}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#85667f] dark:text-white/60">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>Autor: {author}</span>
                  </div>
                  <p className="text-sm text-[#5a4856] dark:text-white/70 italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">{summary}</p>
                </div>
                <Link href="/read-report" className="w-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"><span className="material-symbols-outlined text-[18px]">history</span>
                  Ver Versión {label}</Link>
              </div>
            </div>
          ))}
        </section>
      </main>
      <div className="fixed bottom-6 right-6">
        <Link
          href="/reports"
          className="size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px]">compare_arrows</span>
        </Link>
      </div>
      <div className="h-20"></div>
    </div>
  );
}

