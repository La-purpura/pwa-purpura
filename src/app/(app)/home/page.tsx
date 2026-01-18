﻿"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";

const fallbackQueue = [
  {
    id: "offline-placeholder-1",
    title: "Site Inspection Photos",
    createdAt: "2023-10-27T10:45:00Z",
    status: "pending",
    type: "media",
  },
  {
    id: "offline-placeholder-2",
    title: "Maintenance Report",
    createdAt: "2023-10-27T10:30:00Z",
    status: "pending",
    type: "task",
  },
];

const queueMeta: Record<
  string,
  { icon: string; subtitle: string }
> = {
  media: { icon: "camera_alt", subtitle: "Sector 7G" },
  task: { icon: "edit_note", subtitle: "Unidad #402" },
  incident: { icon: "warning", subtitle: "Incidencia" },
  draft: { icon: "description", subtitle: "Borrador" },
};

export default function HomePage() {
  const user = useAppStore((state) => state.user);
  const tasks = useAppStore((state) => state.tasks);
  const kpis = useAppStore((state) => state.kpis);
  const offlineQueue = useAppStore((state) => state.offlineQueue);

  const pendingTasks = kpis.pendingTasks;
  const highPriorityCount = tasks.filter(
    (task) => task.status === "pending"
  ).length;
  const queueCount = offlineQueue.filter((item) => item.status !== "synced").length;
  const queueItems = offlineQueue.length ? offlineQueue.slice(0, 2) : fallbackQueue;
  const syncedCount = offlineQueue.filter((item) => item.status === "synced").length;
  const syncPercent = offlineQueue.length
    ? Math.round((syncedCount / offlineQueue.length) * 100)
    : 100;

  const formatQueueTime = (value: string) => {
    if (!value) return "Ahora";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Ahora";
    return parsed.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabel = (status: string) => {
    if (status === "synced") return "Sincronizado";
    if (status === "syncing") return "Sincronizando";
    return "En cola";
  };

  const statusDot = (status: string) => {
    if (status === "synced") return "bg-success";
    if (status === "syncing") return "bg-primary";
    return "bg-warning";
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark transition-colors duration-300 min-h-screen flex flex-col antialiased">
      <main className="flex-1 px-5 py-6 space-y-6 overflow-y-auto hide-scrollbar">
        <section>
          <h2 className="text-2xl font-bold mb-4">Hola, {user?.name ?? "Ricardo"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-soft flex flex-col justify-between h-32 border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-icons-round text-6xl text-primary">assignment</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="material-icons-round">assignment</span>
                <span className="text-sm font-medium">Pending Tasks</span>
              </div>
              <div>
                <span className="text-3xl font-bold">{pendingTasks}</span>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">
                  High priority: {highPriorityCount}
                </p>
              </div>
            </div>
            <div className="bg-primary p-4 rounded-xl shadow-lg shadow-purple-900/20 flex flex-col justify-between h-32 text-white relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-2 text-white/90">
                <span className="material-icons-round animate-spin text-sm">sync</span>
                <span className="text-sm font-medium">Syncing...</span>
              </div>
              <div>
                <span className="text-3xl font-bold">{syncPercent}%</span>
                <p className="text-xs text-white/70">Uploading data</p>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: `${syncPercent}%` }}></div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-warning text-base">cloud_off</span>
              Offline Queue
            </h3>
            <span className="bg-warning/10 text-warning px-2 py-0.5 rounded text-xs font-bold">
              {queueCount} Items
            </span>
          </div>
          <div className="bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
            {queueItems.map((item) => {
              const meta = queueMeta[item.type] ?? queueMeta.task;
              const timeLabel = formatQueueTime(item.createdAt);
              return (
                <div key={item.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <span className="material-icons-round text-text-sub-light dark:text-text-sub-dark">
                      {meta.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs text-text-sub-light dark:text-text-sub-dark">
                      {meta.subtitle} •3 {timeLabel}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark">
                      {statusLabel(item.status)}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${statusDot(item.status)}`}></span>
                  </div>
                </div>
              );
            })}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
              <Link
                href="/offline-queue"
                className="text-primary text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                View All Queue
                <span className="material-icons-round text-sm">chevron_right</span>
              </Link>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <Link href="/new-task" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center group-active:scale-95 transition-transform">
                <span className="material-icons-round text-primary text-2xl">add_circle</span>
              </div>
              <span className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark">
                New Task
              </span>
            </Link>
            <Link href="/scan" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center group-active:scale-95 transition-transform">
                <span className="material-icons-round text-primary text-2xl">qr_code_scanner</span>
              </div>
              <span className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark">
                Scan
              </span>
            </Link>
            <Link href="/map" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center group-active:scale-95 transition-transform">
                <span className="material-icons-round text-primary text-2xl">map</span>
              </div>
              <span className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark">
                Map
              </span>
            </Link>
            <Link href="/history" className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center group-active:scale-95 transition-transform">
                <span className="material-icons-round text-primary text-2xl">history</span>
              </div>
              <span className="text-xs font-medium text-text-sub-light dark:text-text-sub-dark">
                History
              </span>
            </Link>
          </div>
        </section>
        <section>
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">notifications</span>
              Programar alerta
            </h3>
            <Link
              href="/alerts/schedule"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/schedule"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Nueva notificación</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Enviar un aviso programado</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Elige contenido, segmento y horario</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Programar
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">assignment_late</span>
              Bandeja de revisión
            </h3>
            <Link
              href="/alerts/review"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/review"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Pendientes críticos</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Revisá los envíos recientes</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Filtrá por territorio o rama</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">inbox</span>
                Bandeja
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">description</span>
              Detalle de aprobación
            </h3>
            <Link
              href="/alerts/approval"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/approval"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Revisá un envío</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Aprobar relevamientos</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Ver fotos, notas y comentarios</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Aprobar
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">history</span>
              Historial
            </h3>
            <Link
              href="/alerts/history"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/history"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Versiones del documento</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Revisá cambios previos</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Compará versiones anteriores</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">history</span>
                Historial
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">verified_user</span>
              Reasignar
            </h3>
            <Link
              href="/alerts/reassign"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/reassign"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Nuevo revisor</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Cambio rápido</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Elegí el mejor disponible</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                Se te ha asignado &apos;Censo B. La Gloria&apos;
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">block</span>
              Baja definitiva
            </h3>
            <Link
              href="/alerts/revoke"
              className="text-sm font-semibold text-primary hover:opacity-80 inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/revoke"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Revocar usuario</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Baja definitiva</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Acceso inmediato removido</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">gavel</span>
                Revocar
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">local_post_office</span>
              Comprobante
            </h3>
            <Link
              href="/alerts/receipt"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/receipt"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Comprobante digital</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Descargá y compartí</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Validación con QR y detalles</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">qr_code</span>
                Comprobante
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">app_registration</span>
              Firma digital
            </h3>
            <Link
              href="/alerts/signature"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/signature"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Completar firma digital</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Validá y enviá la firma</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Último paso para cerrar el relevamiento</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Firmar
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="px-4 pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-icons-round text-primary text-base">folder_open</span>
              Biblioteca
            </h3>
            <Link
              href="/alerts/library"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Abrir
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/alerts/library"
            className="block mx-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-dark p-4 shadow-soft transition-all hover:shadow-lg"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Documentación oficial</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Revisá categorías</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Filtrá por ramas o tipo</p>
              </div>
              <span className="text-primary inline-flex items-center gap-1 text-xs font-semibold uppercase">
                <span className="material-symbols-outlined text-[16px]">storage</span>
                Datos
              </span>
            </div>
          </Link>
        </section>
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">timeline</span>
              Hitos y riesgos
            </h3>
            <Link
              href="/milestones"
              className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Ver línea completa
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <Link
            href="/milestones"
            className="block bg-card-light dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-soft transition-all hover:shadow-md"
          >
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Próximo hito</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#171216] dark:text-white">Desarrollo Operativo</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark">Finaliza 20 Nov • Progreso 65%</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                Timeline
                <span className="material-symbols-outlined text-[16px]">timeline</span>
              </span>
            </div>
          </Link>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-3">Today's Activity</h3>
          <div className="space-y-3">
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-soft flex items-start gap-3 border-l-4 border-success">
              <div className="mt-0.5">
                <span className="material-icons-round text-success text-sm bg-success/10 p-1.5 rounded-full">
                  check
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Equipment Check Complete</h4>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">
                  Verified inventory at North Warehouse.
                </p>
                <span className="text-[10px] text-text-sub-light/70 dark:text-text-sub-dark/70 mt-2 block">
                  1 hour ago
                </span>
              </div>
            </div>
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-soft flex items-start gap-3 border-l-4 border-primary">
              <div className="mt-0.5">
                <span className="material-icons-round text-primary text-sm bg-primary/10 p-1.5 rounded-full">
                  update
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Route Updated</h4>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">
                  Optimization applied for afternoon schedule.
                </p>
                <span className="text-[10px] text-text-sub-light/70 dark:text-text-sub-dark/70 mt-2 block">
                  3 hours ago
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
