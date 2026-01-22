"use client";

export default function ReceiptsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Generación de Comprobantes</h1>
            </div>

            <div className="bg-white dark:bg-[#20121d] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                    <span className="material-symbols-outlined text-3xl">receipt_long</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Comprobantes Administrativos</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Genera recibos de viáticos, constancias de participación o certificados de servicio para los voluntarios y referentes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <button className="p-4 rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-yellow-600">directions_bus</span>
                        <span className="font-bold text-sm text-gray-600 group-hover:text-yellow-700">Viáticos de Movilidad</span>
                    </button>
                    <button className="p-4 rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-yellow-600">verified</span>
                        <span className="font-bold text-sm text-gray-600 group-hover:text-yellow-700">Certificado de Rol</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
