"use client";

export default function DeleteUserPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-red-600">Baja Definitiva de Usuarios</h1>
            </div>

            <div className="bg-white dark:bg-[#20121d] rounded-2xl p-8 border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <span className="material-symbols-outlined text-9xl text-red-500">warning</span>
                </div>

                <div className="relative z-10">
                    <p className="font-bold text-gray-800 dark:text-white text-lg mb-2">Gestión de Bajas Críticas</p>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Esta acción es irreversible. Al dar de baja un usuario, se revocará inmediatamente su acceso a la plataforma, se eliminarán sus tokens de sesión y se archivará su historial de actividad por razones de auditoría durante 5 años.
                    </p>

                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 mb-6">
                        <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-2">Buscar Usuario a Eliminar</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="DNI, Email o Nombre"
                                className="flex-1 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button className="bg-red-100 dark:bg-red-800 text-red-700 dark:text-white px-4 py-2 rounded-lg font-bold">Buscar</button>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <span className="material-symbols-outlined">delete_forever</span>
                        Confirmar Baja
                    </button>
                </div>
            </div>
        </div>
    );
}
