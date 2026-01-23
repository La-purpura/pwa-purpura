export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link";

export default function CollaboratorProfilePage() {
  const activity = [
    {
      title: "Incidencia #124 resuelta",
      time: "Hoy, 10:30 AM",
      detail: "Reparación de luminaria completada en Sector B. Evidencia fotográfica cargada.",
      icon: "check_circle",
      color: "bg-green-50 text-green-600 dark:text-green-400 dark:bg-green-900/20",
    },
    {
      title: "Nueva encuesta cargada",
      time: "Hoy, 09:15 AM",
      detail: "Mercado Central",
      icon: "description",
      color: "bg-blue-50 text-blue-600 dark:text-blue-400 dark:bg-blue-900/20",
    },
    {
      title: "Inicio de turno",
      time: "Ayer, 08:00 AM",
      detail: "Dispositivo ID: iPhone 13",
      icon: "login",
      color: "bg-gray-50 text-gray-500 dark:text-gray-400 dark:bg-gray-800",
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white font-manrope min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link
          href="/profile"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-800 dark:text-gray-200"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-base font-bold tracking-tight">Perfil del Colaborador</h1>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-primary">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto p-5 pb-32 space-y-8">
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary to-purple-400 opacity-60 blur-xl"></div>
            <div
              className="relative w-28 h-28 rounded-full border-4 border-surface-light dark:border-surface-dark overflow-hidden shadow-card"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdFz-B_XO7k-lnVBPuBKn_bDcN706Aj0jYqCOWyB6q_81f_H2raJb0aZCAZ5x5jVvZgHuYPedCE8foRW1rBEtVa4zKZbD-S8Fk1z12h-MU2PJNh02TbToMkab_BvnBQM-Ktc_2mtfyjnvkcyXegiYEKQVauS_2QKDQL5ec6cjNZXdk-Dm4BMTu1DA0TsOJuEsgawsDjdRRvlBSHdAoxDHpoLI5GHVxK2Ugt8THTDW9Gy4mfq8CsmT5Pa_ObklRFBp8VYejlP0qBSs')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-surface-light dark:border-surface-dark"></div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Carlos Rodríguez</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span className="material-symbols-outlined text-[18px]">badge</span>
              Supervisor de Zona - Norte
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              En Territorio
            </span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <StatCard icon="assignment_turned_in" value="42" label="Incidencias Resueltas" color="bg-orange-100 dark:bg-orange-900/30 text-orange-600" badge="orange" />
          <StatCard icon="fact_check" value="15" label="Encuestas Completas" color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" badge="blue" />
          <StatCard icon="trending_up" value="9.8" label="Puntaje Desempeño" color="bg-purple-100 dark:bg-purple-900/30 text-primary" badge="purple" />
        </section>

        <section className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-soft p-6 border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Historial de Actividad</h3>
            <Link href="/history" className="text-xs font-semibold text-primary hover:text-primary-dark">
              Ver todo
            </Link>
          </div>
          <div className="relative pl-2">
            <div className="absolute left-[19px] top-2 bottom-4 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
            {activity.map((item) => (
              <div key={item.title} className="relative flex gap-4 pb-8 group">
                <div className="relative z-10 flex-shrink-0 mt-1">
                  <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center border-2 border-surface-light dark:border-surface-dark shadow-sm`}>
                    <span className="material-symbols-outlined icon-filled text-[20px]">{item.icon}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1.5">
                  <p className="text-sm font-bold text-text-main dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {item.time}
                  </p>
                  <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded border border-gray-100 dark:border-gray-700 line-clamp-2">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-2">
          <Link
            href="/devices"
            className="group w-full relative overflow-hidden rounded-xl bg-white dark:bg-surface-dark border border-red-200 dark:border-red-900/30 p-4 transition-all hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="p-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-100 transition-colors">
                <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">Cerrar Sesiones Activas</span>
            </div>
          </Link>
          <p className="text-center text-[10px] text-gray-400 mt-3">La Púrpura PWA v2.4.1 • Build 202310</p>
        </div>
      </main>
    </div>
  );
}

const StatCard = ({
  icon,
  value,
  label,
  color,
  badge,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
  badge: string;
}) => (
  <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-card flex flex-col items-center justify-center text-center gap-2 border border-transparent hover:border-primary/20 transition-all">
    <div className={`w-8 h-8 rounded-full ${color} mb-1 flex items-center justify-center`}>
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
    <span className="text-3xl font-extrabold text-primary tracking-tight">{value}</span>
    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 leading-tight">{label}</span>
  </div>
);
