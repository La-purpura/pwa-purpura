"use client";

import { useRouter } from "next/navigation";

export default function ReadReportPage() {
    const router = useRouter();

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen p-4">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-xl font-bold">Lectura de Reporte</h1>
                <button onClick={() => router.back()} className="text-primary">Volver</button>
            </header>
            <main>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-bold mb-2">Reporte #4092</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Detalles del reporte generado automaticamente.</p>
                    <div className="text-xs font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded text-gray-500">
                        Hash: 8f9d2a...1b2c
                    </div>
                </div>
            </main>
        </div>
    );
}
