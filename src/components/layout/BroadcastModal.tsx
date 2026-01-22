"use client";

import { useState } from "react";
import { useAppStore, Announcement } from "@/lib/store";

export function BroadcastModal() {
    const { isBroadcastModalOpen, setBroadcastModalOpen, setGlobalAnnouncement } = useAppStore();
    const [message, setMessage] = useState("");
    const [type, setType] = useState<Announcement['type']>("info");

    if (!isBroadcastModalOpen) return null;

    const handleSend = () => {
        if (!message.trim()) return;

        setGlobalAnnouncement({
            message,
            type,
            isActive: true
        });

        setBroadcastModalOpen(false);
        setMessage("");
        // In a real app, this would also modify the backend to persist for other users
    };

    const handleClear = () => {
        setGlobalAnnouncement(null);
        setBroadcastModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Overlay */}
            <div className="absolute inset-0" onClick={() => setBroadcastModalOpen(false)} />

            <div className="bg-white dark:bg-[#20121d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-[#851c74]">
                        <span className="material-symbols-outlined text-3xl">campaign</span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Emitir Anuncio Global</h2>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        Este mensaje aparecerá inmediatamente en la barra superior de <strong>todos los usuarios activos</strong> en la plataforma.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2 block">Tipo de Mensaje</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['info', 'warning', 'alert', 'success'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-all border-2 ${type === t
                                            ? { info: 'border-blue-500 bg-blue-50 text-blue-600', warning: 'border-orange-500 bg-orange-50 text-orange-600', alert: 'border-red-500 bg-red-50 text-red-600', success: 'border-green-500 bg-green-50 text-green-600' }[t]
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        {t === 'alert' ? 'alerta' : t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase mb-2 block">Contenido</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ej: Atención equipos, se cierra la carga de datos a las 18hs por mantenimiento."
                                className="w-full h-32 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-[#851c74] text-sm resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={handleClear}
                            className="flex-1 py-3 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            Apagar Actual
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="flex-[2] py-3 bg-[#851c74] hover:bg-[#6a165c] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:shadow-none"
                        >
                            EMITIR AHORA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
