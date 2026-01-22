"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function WelcomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const name = searchParams.get('name') || "Compañero/a";
    const [progress, setProgress] = useState(0);

    // Simulación de "Configurando su entorno..."
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 2; // Sube hasta 100 en aprox 2.5 seg
            });
        }, 50);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center text-center p-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in bounce-in duration-1000">
                <span className="material-symbols-outlined text-5xl">rocket_launch</span>
            </div>

            <h1 className="text-3xl font-extrabold text-[#851c74] mb-2">¡Todo listo, {name}!</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Tu cuenta ha sido activada y tu entorno de trabajo territorial está configurado.</p>

            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
                <div
                    className="h-full bg-[#851c74] transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">
                {progress < 100 ? "Sincronizando permisos..." : "Configuración completada"}
            </p>

            <button
                onClick={() => router.push('/dashboard')}
                disabled={progress < 100}
                className="w-full bg-[#851c74] text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-xl shadow-[#851c74]/20 disabled:opacity-50 disabled:scale-100"
            >
                IR AL TABLERO
                <span className="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>
    );
}

export default function WelcomePage() {
    return (
        <main className="min-h-screen bg-[#f3eef2] dark:bg-black flex items-center justify-center p-4">
            <Suspense fallback={null}>
                <WelcomeContent />
            </Suspense>
        </main>
    );
}
