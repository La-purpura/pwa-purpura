"use client";

import Link from "next/link";

export default function MaintenancePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-4 text-[#171216]">Mantenimiento</h1>
            <p className="text-gray-600 mb-8">El sistema esta en mantenimiento. Intenta reconectar mas tarde.</p>
            <div className="mt-4">
                <Link href="/" className="text-primary font-bold hover:underline">
                    Regresar al Inicio
                </Link>
            </div>
        </main>
    );
}
