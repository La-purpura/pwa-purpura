'use client';

import React from 'react';
import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-purple-600 text-5xl">wifi_off</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sin conexión a Internet</h1>
            <p className="text-slate-600 mb-8 max-w-sm">
                Parece que no tienes conexión en este momento. Algunas funciones de La Púrpura no están disponibles sin red.
            </p>

            <div className="space-y-4 w-full max-w-xs">
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 active:scale-95 transition-transform"
                >
                    Reintentar conexión
                </button>

                <Link
                    href="/"
                    className="block w-full py-3 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 shadow-sm active:scale-95 transition-transform"
                >
                    Ir al Inicio (Datos cacheados)
                </Link>
            </div>

            <p className="mt-12 text-xs text-slate-400">
                La Púrpura Territorio PWA
            </p>
        </div>
    );
}
