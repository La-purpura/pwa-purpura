"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SecurityPage() {
    const router = useRouter();
    const [biometrics, setBiometrics] = useState(true);

    const toggleBiometrics = () => {
        // In a real PWA this would interface with WebAuthn or Local Authentication API
        const newState = !biometrics;
        setBiometrics(newState);
        if (newState) {
            alert("Biometría activada");
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Seguridad</h1>
            </header>

            <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-4 rounded-2xl flex items-start gap-4">
                    <span className="material-symbols-outlined text-green-600 text-3xl">gpp_good</span>
                    <div>
                        <h2 className="font-bold text-green-800 dark:text-green-200">Todo Seguro</h2>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">Tu cuenta usa encriptación de extremo a extremo. Último acceso detectado: Hoy 10:42 AM.</p>
                    </div>
                </div>

                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <Link href="/security/change-password" className="w-full flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-500">password</span>
                            <span className="font-bold text-sm">Cambiar Contraseña</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </Link>

                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-colors cursor-pointer" onClick={toggleBiometrics}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-500">fingerprint</span>
                            <span className="font-bold text-sm">Activar Biometría</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer pointer-events-none">
                            <input type="checkbox" checked={biometrics} readOnly className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <Link href="/security/devices" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-500">devices</span>
                            <span className="font-bold text-sm">Dispositivos Vinculados</span>
                        </div>
                        <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                    </Link>
                </section>
            </div>
        </main>
    );
}
