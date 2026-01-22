"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockTasks, mockUserRegular, mockUserAdmin } from "@/lib/mocks"; // Usaremos mocks para prototipar

// Usuarios ficticios disponibles para reasignar
const availableUsers = [
    mockUserRegular,
    mockUserAdmin,
    { id: "u3", name: "Maria Garcia", role: "Coordinador", territory: "Tigre", email: "maria@test.com", avatar: "" },
    { id: "u4", name: "Carlos Lopez", role: "Militante", territory: "San Fernando", email: "carlos@test.com", avatar: "" },
];

export default function ReassignPage() {
    const router = useRouter();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // Filtrar tareas (solo pendientes para demo)
    const tasks = mockTasks.filter(t =>
        t.status !== "done" &&
        (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.territory.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleReassign = () => {
        if (!selectedTask || !selectedUser) return;

        // Aquí iría la llamada a la API
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setSelectedTask(null);
            setSelectedUser(null);
            // Opcional: router.back();
        }, 2000);
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-4 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-xl font-bold">Reasignar Responsables</h1>
                    <p className="text-xs text-gray-500">Transfiere tareas o incidencias</p>
                </div>
            </header>

            {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <div>
                        <p className="font-bold text-green-800 dark:text-green-200">¡Reasignación Exitosa!</p>
                        <p className="text-xs text-green-700 dark:text-green-300">El nuevo responsable ha sido notificado.</p>
                    </div>
                </div>
            )}

            {/* Paso 1: Seleccionar Tarea */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold flex items-center gap-2">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Selecciona la Tarea
                    </h2>
                </div>

                {/* Buscador */}
                <div className="mb-4 relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por título o territorio..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTask(task.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTask === task.id
                                    ? "border-primary bg-primary/5 dark:bg-primary/20 ring-1 ring-primary"
                                    : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/50"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {task.priority === 'high' ? 'Alta' : 'Normal'}
                                </span>
                                <span className="text-xs text-gray-400">{task.territory}</span>
                            </div>
                            <h3 className="font-bold text-sm mb-1">{task.title}</h3>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="material-symbols-outlined text-sm">person</span>
                                <span>Actual: {task.assignee || "Sin asignar"}</span>
                            </div>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">No se encontraron tareas.</p>
                    )}
                </div>
            </section>

            {/* Paso 2: Seleccionar Nuevo Responsable */}
            <section className={`transition-opacity duration-300 ${!selectedTask ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold flex items-center gap-2">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Nuevo Responsable
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {availableUsers.map(u => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedUser === u.id
                                    ? "border-primary bg-primary/5 dark:bg-primary/20 ring-1 ring-primary"
                                    : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                {u.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.role} • {u.territory}</p>
                            </div>
                            {selectedUser === u.id && <span className="material-symbols-outlined text-primary">check_circle</span>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Botón Flotante de Acción */}
            <div className="fixed bottom-6 left-0 right-0 px-6 z-20">
                <button
                    onClick={handleReassign}
                    disabled={!selectedTask || !selectedUser || isSuccess}
                    className="w-full bg-[#851c74] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSuccess ? (
                        <span className="material-symbols-outlined animate-spin">sync</span>
                    ) : (
                        <>
                            <span>Confirmar Reasignación</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </>
                    )}
                </button>
            </div>

        </main>
    );
}
