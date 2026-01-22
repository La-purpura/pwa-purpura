"use client";

import { useState, useEffect } from "react";

export default function MobileSimulator({ children }: { children: React.ReactNode }) {
    const [isMobileMode, setIsMobileMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <>{children}</>;

    // Si estamos en un dispositivo móvil real (por ancho de pantalla), no mostramos el simulador
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return <>{children}</>;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isMobileMode ? 'bg-gray-800 flex items-center justify-center p-8' : ''}`}>
            {/* Toggle Button Floating */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
                <span className="text-[10px] text-gray-400 font-mono bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Simulador Móvil
                </span>
                <button
                    onClick={() => setIsMobileMode(!isMobileMode)}
                    className={`p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center ${isMobileMode ? 'bg-[#851c74] text-white ring-4 ring-purple-900/50' : 'bg-gray-900 text-gray-400 hover:text-white'
                        }`}
                    title="Alternar Vista Móvil"
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isMobileMode ? 'desktop_windows' : 'smartphone'}
                    </span>
                </button>
            </div>

            {/* Container */}
            <div
                className={`transition-all duration-500 ease-in-out relative ${isMobileMode
                        ? 'w-[375px] h-[812px] bg-white dark:bg-black overflow-hidden shadow-2xl rounded-[40px] border-[8px] border-gray-900 ring-4 ring-gray-700'
                        : 'w-full min-h-screen'
                    }`}
            >
                {/* Mobile Notch simulation */}
                {isMobileMode && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-xl z-50 flex justify-center items-center">
                        <div className="w-16 h-1 bg-gray-800 rounded-full"></div>
                    </div>
                )}

                {/* Scrollable Area */}
                <div className={`h-full w-full ${isMobileMode ? 'overflow-y-auto scrollbar-hide' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
