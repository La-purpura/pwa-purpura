"use client";

export default function ApprovalsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Detalle de Aprobaciones</h1>
            </div>

            <div className="bg-white dark:bg-[#20121d] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <span className="material-symbols-outlined text-3xl">approval_delegation</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Centro de Control de Firmas</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Gestiona los niveles de autorización y audita las aprobaciones realizadas por los coordinadores de sección y distrito.
                </p>
                <div className="inline-flex gap-4">
                    <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-colors">
                        Ver Reglas
                    </button>
                    <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-600/20">
                        Generar Reporte
                    </button>
                </div>
            </div>
        </div>
    );
}
