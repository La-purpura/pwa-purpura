"use client";

export default function DigitalSignaturesPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Firma Digital Estadal</h1>
            </div>

            <div className="bg-white dark:bg-[#20121d] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <span className="material-symbols-outlined text-3xl">draw</span>
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Certificación de Documentos</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Sube documentos PDF para firmarlos digitalmente con el sello oficial de la organización.
                </p>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">cloud_upload</span>
                    <p className="font-bold text-gray-600 dark:text-gray-300">Arrastra archivos aquí</p>
                    <p className="text-xs text-gray-400">o haz clic para explorar tu dispositivo</p>
                </div>
            </div>
        </div>
    );
}
