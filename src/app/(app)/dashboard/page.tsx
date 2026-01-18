"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-[#171216] dark:text-white">Mendoza</h3>
            <p className="text-sm text-gray-500 font-medium">Provincia de Mendoza, Argentina</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-primary uppercase tracking-widest pl-1">Filtrar por Municipio</label>
          <div className="relative">
            <select className="appearance-none w-full h-14 bg-white dark:bg-gray-800 border-none rounded-xl ios-shadow px-4 text-[#171216] dark:text-white font-semibold focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
              <option value="all">Todos los Municipios</option>
              <option value="gc">Godoy Cruz</option>
              <option value="lz">Luján de Cuyo</option>
              <option value="m">Maipú</option>
              <option value="gu">Guaymallén</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">expand_more</span>
            </div>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl ios-shadow flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Alertas Activas en la Zona</p>
            <p className="text-4xl font-extrabold text-primary">04</p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl ios-shadow flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <span className="material-symbols-outlined">assignment_turned_in</span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 leading-tight">Por Aprobar</p>
            <p className="text-2xl font-bold text-[#171216] dark:text-white">12</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl ios-shadow flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600">
              <span className="material-symbols-outlined">account_tree</span>
            </div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">0%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 leading-tight">Proyectos Rama</p>
            <p className="text-2xl font-bold text-[#171216] dark:text-white">08</p>
          </div>
        </div>
      </section>
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl ios-shadow">
        <h3 className="text-lg font-bold text-[#171216] dark:text-white mb-6">Distribución de Incidencias</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32 flex-shrink-0">
            <div className="w-full h-full rounded-full border-[12px] border-primary" style={{
              clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)",
            }}></div>
            <div className="absolute inset-0 w-full h-full rounded-full border-[12px] border-gray-100 dark:border-gray-700 -z-10"></div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl font-bold">24</span>
              <span className="text-[10px] uppercase text-gray-400 font-bold">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500">Infraestructura</p>
                <p className="text-sm font-bold">65%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500">Salud</p>
                <p className="text-sm font-bold">25%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-100"></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500">Seguridad</p>
                <p className="text-sm font-bold">10%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#171216] dark:text-white">Actividad Reciente del Equipo</h3>
          <Link className="text-primary text-sm font-bold" href="/team">
            Ver todo
          </Link>
        </div>
        <div className="space-y-3">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl ios-shadow flex items-start gap-4">
            <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">person</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#171216] dark:text-white leading-snug">
                <span className="font-bold">Juan Pérez</span> subió un nuevo relevamiento en <span className="text-primary">Luján de Cuyo</span>.
              </p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Hace 15 min</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Has superado el promedio de &quot;Resolución Rápida&quot; de tu zona.</p>
            </div>
            <div className="text-green-500">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl ios-shadow flex items-start gap-4">
            <div className="size-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-red-600 text-xl">report</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#171216] dark:text-white leading-snug">
                <span className="font-bold">Alerta Activa</span> reportada por el equipo de terreno en el Barrio San Martín.
              </p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Hace 1 h</p>
            </div>
            <div className="text-red-500">
              <span className="material-symbols-outlined">priority_high</span>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl ios-shadow flex items-start gap-4 opacity-75">
            <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-blue-600 text-xl">edit_document</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#171216] dark:text-white leading-snug">
                <span className="font-bold">Marta Gómez</span> actualizó el estado del Proyecto Rama "Iluminación".
              </p>
              <p className="text-xs text-gray-400 mt-1 font-medium">Hace 3 h</p>
            </div>
            <div className="text-blue-500">
              <span className="material-symbols-outlined">history</span>
            </div>
          </div>
        </div>
      </section>
      <section className="pb-4">
        <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl ios-shadow overflow-hidden">
          <div className="relative h-40 w-full rounded-xl bg-gray-200 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              data-alt="Mapa abstracto de la ciudad de Mendoza con marcadores"
              data-location="Mendoza"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqcyGJX9LOfEW-hz4cG26XjtheNk23scDQklBKLZIoEsykbUsSFzqSy9dO3GND0XxVYoTHfLxMiMTfO3SlBy76ZN2CKQb9JDfvQWtAjek2z2NZcV3W3U94fkoklQ7I-GykPrc1HHnG4yI0tnZGnO_H3HaDTgh7roioVrfo81MgYA5iwza-dd7S8VUOxb5sqvtGpvJOAd--P4eZgfcvSN21u5UtvOF5BHcnfemtXKQXpVP2YyvQAhF7IMWifPHxauuNfxIb1XaoW5g"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
              <Link className="bg-white dark:bg-gray-800 text-primary px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2" href="/map">
                <span className="material-symbols-outlined text-sm">map</span>
                Abrir Mapa Interactivo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
