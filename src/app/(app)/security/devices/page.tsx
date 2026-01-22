"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LinkedDevicesPage() {
    const router = useRouter();

    // Mock Data
    const [devices, setDevices] = useState([
        { id: 1, name: "Chrome en Windows", lastActive: "Ahora (Este dispositivo)", type: "desktop", current: true },
        { id: 2, name: "App PWA en Samsung S21", lastActive: "Hace 2 horas", type: "smartphone", current: false },
        { id: 3, name: "Safari en iPhone 13", lastActive: "Hace 5 días", type: "smartphone", current: false },
    ]);

    const revokeDevice = (id: number) => {
        if (confirm("¿Seguro que deseas cerrar sesión en este dispositivo?")) {
            setDevices(devices.filter(d => d.id !== id));
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Dispositivos</h1>
            </header>

            <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">Estás conectado en estos dispositivos:</p>

                {devices.map((device) => (
                    <div key={device.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-full flex items-center justify-center ${device.current ? 'bg-green-50 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                <span className="material-symbols-outlined">{device.type === 'desktop' ? 'computer' : 'smartphone'}</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm flex items-center gap-2">
                                    {device.name}
                                    {device.current && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actual</span>}
                                </p>
                                <p className="text-xs text-gray-400">{device.lastActive}</p>
                            </div>
                        </div>
                        {!device.current && (
                            <button
                                onClick={() => revokeDevice(device.id)}
                                className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                                title="Cerrar Sesión"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        )}
                    </div>
                ))}

                {devices.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No hay otros dispositivos conectados.</p>
                )}
            </div>

            <div className="mt-8 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex gap-3">
                <span className="material-symbols-outlined text-orange-500">info</span>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                    Si no reconoces un dispositivo, cierra la sesión inmediatamente y cambia tu contraseña.
                </p>
            </div>
        </main>
    );
}
