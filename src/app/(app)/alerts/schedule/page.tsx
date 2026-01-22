"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function ScheduleAlertPage() {
  const router = useRouter();
  const alerts = useAppStore((state) => state.alerts);
  const addAlert = useAppStore((state) => state.addAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    segment: "all",
    message: ""
  });

  // Simulamos que las alertas de tipo 'news' o futuras son las programadas
  const scheduledAlerts = alerts.filter(a => a.type === 'news' || a.title.includes("Programada"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlert = {
      id: Date.now().toString(),
      title: `[Programada] ${formData.title}`,
      type: "news" as const, // Forzamos tipo news para demo
      message: `${formData.message} (Para: ${formData.segment})`,
      isRead: false,
      date: `${formData.date} ${formData.time}`,
      createdAt: new Date().toISOString()
    };

    addAlert(newAlert);
    setIsModalOpen(false);
    setFormData({ title: "", date: "", time: "", segment: "all", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary transition-colors hover:bg-gray-50">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Alertas Programadas</h1>
          <p className="text-sm text-gray-500">Gestión de envíos futuros y recordatorios</p>
        </div>
      </header>

      {/* Lista de Alertas Programadas */}
      <div className="grid gap-4">
        {scheduledAlerts.length > 0 ? (
          scheduledAlerts.map(alert => (
            <div key={alert.id} className="bg-white dark:bg-[#20121d] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">event</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 dark:text-white">{alert.title.replace("[Programada] ", "")}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-medium">
                    {alert.date}
                  </span>
                  <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold uppercase">
                    Activa
                  </span>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">calendar_clock</span>
            <p className="text-gray-500 font-medium">No hay alertas programadas</p>
            <p className="text-xs text-gray-400">Crea una nueva para comenzar</p>
          </div>
        )}
      </div>

      {/* Botón Flotante */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-[#851c74] hover:bg-[#6b165d] text-white px-6 py-4 rounded-full shadow-lg shadow-[#851c74]/30 z-20 transition-all active:scale-95 flex items-center gap-2"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="font-bold">Nueva Programación</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            <div className="bg-[#851c74] p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">edit_calendar</span>
                Programar Envío
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 rounded-full p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Título del Evento</label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Visita Presidencial"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74] text-gray-900 dark:text-white"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Fecha</label>
                  <input
                    required
                    type="date"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74] text-gray-900 dark:text-white"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74] text-gray-900 dark:text-white"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Segmento Destino</label>
                <select
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74] text-gray-900 dark:text-white"
                  value={formData.segment}
                  onChange={e => setFormData({ ...formData, segment: e.target.value })}
                >
                  <option value="all">Toda la Red (Nacional)</option>
                  <option value="coord">Solo Coordinadores</option>
                  <option value="north">Zona Norte</option>
                  <option value="south">Zona Sur</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escribe el contenido de la alerta..."
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-[#851c74] text-gray-900 dark:text-white resize-none"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#851c74] hover:bg-[#6b165d] text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Confirmar Programación</span>
                  <span className="material-symbols-outlined">send_and_archive</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
