"use client";

import { useRouter } from "next/navigation";

export default function AboutPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white flex flex-col items-center text-center">
            <header className="w-full flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </header>

            <div className="size-24 bg-[#851c74] rounded-3xl flex items-center justify-center shadow-lg shadow-purple-900/30 mb-6 rotate-3">
                <span className="material-symbols-outlined text-white text-5xl">rocket_launch</span>
            </div>

            <h1 className="text-3xl font-extrabold text-[#851c74] mb-2">La Púrpura PWA</h1>
            <p className="text-gray-500 text-sm font-medium mb-8 max-w-xs">Plataforma integral de gestión territorial y operativa.</p>

            <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
                <div className="p-4 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Versión</span>
                    <span className="font-bold text-sm">1.2.0 (Build 345)</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Desarrollado por</span>
                    <span className="font-bold text-sm">Equipo Técnico LP</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Contacto</span>
                    <span className="font-bold text-sm text-primary">dev@lapurpura.com</span>
                </div>
            </div>

            <div className="mt-8 space-y-4 w-full">
                <button className="w-full py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    Términos y Condiciones
                </button>
                <button className="w-full py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                    Política de Privacidad
                </button>
            </div>

            <p className="mt-auto pt-8 text-xs text-gray-400">© 2024 La Púrpura. Todos los derechos reservados.</p>
        </main>
    );
}
