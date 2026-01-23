export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Link from "next/link";

const records = [
  { title:"Actualizó permisos de rol 'Supervisor' para zona norte.", user:"Carlos Gómez", time:"Hoy, 14:35", icon:"edit", color:"primary", badge:"blue" },
  { title:"Eliminó registro de visita '#4021' permanentemente.", user:"Ana Torres", time:"11:20", icon:"delete", color:"red", badge:"red" },
  { title:"Sincronización automática completada exitosamente.", user:"Sistema", time:"09:00", icon:"sync", color:"green", badge:"green" },
  { title:"Creó nuevo territorio 'Sector Oeste - B'.", user:"Miguel Ángel", time:"16:45", icon:"add_circle", color:"primary", badge:"green" },
  { title:"Intento de acceso fallido detectado desde IP desconocida.", user:"Admin Central", time:"10:15", icon:"lock_person", color:"orange", badge:"orange" },
];

export default function AuditsPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-manrope text-text-main dark:text-gray-100 min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            className="group flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors"
            href="/home"
          >
            <span className="material-symbols-outlined text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">arrow_back</span>
          </Link>
          <h1 className="text-lg font-bold">Registro de Auditoría</h1>
          <button className="group flex size-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors">
            <span className="material-symbols-outlined text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">more_vert</span>
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-3 text-primary/60">search</span>
            <input className="w-full rounded-xl bg-white dark:bg-surface-dark py-3 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 shadow-sm border-none focus:ring-2 focus:ring-primary transition-all" placeholder="Buscar por usuario o acción..." type="text"/>
            <button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="material-symbols-outlined text-gray-400 text-[20px]">tune</span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["Todos","Fecha","Usuario","Tipo","Estado"].map((label)=>
              <button key={label} className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm dark:bg-surface-dark dark:border-gray-700 dark:text-gray-300 hover:border-primary/30 transition">{label}<span className="material-symbols-outlined text-[18px]">expand_more</span></button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pt-2 space-y-6 pb-32">
        {["Hoy","Ayer"].map(section=>(
          <section key={section} className="space-y-3">
            <h3 className="sticky top-[150px] z-10 mb-3 bg-background-light/95 px-1 py-1 text-sm font-bold text-gray-500 uppercase tracking-wider backdrop-blur-sm dark:bg-background-dark/95 rounded-lg">{section}</h3>
            <div className="flex flex-col gap-3">
              {records.slice(section==="Hoy"?0:3).map((record,i)=>(
                <AuditItem key={`${section}-${i}`} record={record}/>
              ))}
            </div>
          </section>
        ))}
        <div className="py-8 flex justify-center">
          <div className="size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500 ml-2">Cargando más registros...</span>
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-dark/95 backdrop-blur-lg border-t border-gray-100 dark:border-white/5 pb-safe pt-2">
        <div className="flex items-center justify-around pb-2">
          <NavItem icon="grid_view" label="Inicio" href="/home"/>
          <NavItem icon="map" label="Territorio" href="/territory"/>
          <NavItem icon="list_alt" label="Auditoría" href="/audits" active/>
          <NavItem icon="person" label="Perfil" href="/profile"/>
        </div>
      </nav>
      <div className="h-6"></div>
    </div>
  );
}

const colorClasses: Record<string,string> = {
  primary: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light",
  red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
  green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300",
};

const AuditItem = ({record}:{record:{title:string;user:string;time:string;icon:string;color:keyof typeof colorClasses}}) => (
  <article className="group relative flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card dark:bg-surface-dark dark:border dark:border-white/5 transition active:scale-[0.99]">
    <div className="flex items-start gap-4">
      <div className={`relative flex size-10 shrink-0 items-center justify-center rounded-full ${colorClasses[record.color] || colorClasses.primary}`}>
        <span className="material-symbols-outlined text-[20px]">{record.icon}</span>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary dark:text-purple-300">{record.user}</span>
          <span className="text-xs font-medium text-gray-400">{record.time}</span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{record.title}</p>
      </div>
    </div>
  </article>
);

const NavItem = ({icon,label,href,active}:{icon:string;label:string;href:string;active?:boolean}) => (
  <Link href={href} className={`flex flex-col items-center gap-1 p-2 ${active?'text-primary':'text-gray-400 hover:text-primary transition-colors'}`}>
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="text-[10px] font-medium">{label}</span>
  </Link>
);
