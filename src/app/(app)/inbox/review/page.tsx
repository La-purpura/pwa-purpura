"use client";

import Link from "next/link";

export default function InboxReviewPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bandeja de Revisión</h1>
            </div>

            <div className="bg-white dark:bg-[#20121d] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Mock Table Header */}
                <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-800/50 p-4 text-xs font-bold text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                    <div className="col-span-2">Fecha</div>
                    <div className="col-span-3">Solicitante</div>
                    <div className="col-span-4">Asunto</div>
                    <div className="col-span-2">Estado</div>
                    <div className="col-span-1 text-right">Acción</div>
                </div>

                {/* Empty State */}
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                        <span className="material-symbols-outlined text-3xl">inbox</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Todo al día</h2>
                    <p className="text-gray-500 mb-6">
                        No tienes nuevas solicitudes pendientes de revisión en este momento.
                    </p>
                </div>
            </div>
        </div>
    );
}
