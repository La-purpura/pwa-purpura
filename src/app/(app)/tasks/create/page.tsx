"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { ELECTORAL_SECTIONS } from "@/lib/constants";
import { User } from "@/lib/mocks";

export default function CreateTaskPage() {
    const router = useRouter();
    const addTask = useAppStore((state) => state.addTask);
    const users = useAppStore((state) => state.users);
    const [loading, setLoading] = useState(false);

    // States for Cascading Selection
    const [scope, setScope] = useState<"all" | "section" | "district">("all");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    // Assignment State
    const [assignmentMode, setAssignmentMode] = useState<"all_in_territory" | "specific_users">("all_in_territory");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const [task, setTask] = useState({
        title: "",
        description: "",
        priority: "medium",
        type: "Operativo",
        dueDate: ""
    });

    // Filter users based on current territory selection
    const getFilteredUsers = (): User[] => {
        let filtered = users;
        // Note: Real world app would have better "territory" field on User (e.g. section + district)
        // Since mocks have simple string territory, we'll do loose matching or just show all for demo if no match
        if (scope === "district" && selectedDistrict) {
            return filtered.filter(u => u.territory.includes(selectedDistrict) || u.territory === selectedDistrict);
        }
        if (scope === "section" && selectedSection) {
            // Mock logic: assume some relation or return all if can't resolve section from mock strings
            return filtered;
        }
        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    const handleUserToggle = (id: string) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(uid => uid !== id));
        } else {
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const fullTerritory = scope === "all" ? "Provincia de Bs As" : (scope === "section" ? selectedSection : selectedDistrict);

        const newTask = {
            ...task,
            id: Math.random().toString(36).substr(2, 9),
            status: "pending" as const,
            date: new Date().toISOString(),
            dueDate: task.dueDate || new Date().toISOString(),
            category: task.type,
            assignee: assignmentMode === "all_in_territory" ? "Equipo Territorial" : `${selectedUserIds.length} Asignados`,
            territory: fullTerritory,
            subtasksDone: 0,
            subtasksTotal: 0
        };

        setTimeout(() => {
            addTask(newTask as any);
            setLoading(false);
            router.push("/dashboard");
        }, 1000);
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Nueva Tarea</h1>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">

                {/* Left Column: Task Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold border-b border-gray-100 dark:border-gray-800 pb-2">Detalles</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Título</label>
                        <input
                            type="text"
                            required
                            value={task.title}
                            onChange={(e) => setTask({ ...task, title: e.target.value })}
                            className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white"
                            placeholder="Ej: Relevamiento Barrio Norte"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Descripción</label>
                        <textarea
                            required
                            value={task.description}
                            onChange={(e) => setTask({ ...task, description: e.target.value })}
                            className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white h-32 resize-none"
                            placeholder="Detalles del operativo..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Prioridad</label>
                            <select
                                value={task.priority}
                                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                                className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white appearance-none"
                            >
                                <option value="low">Baja</option>
                                <option value="medium">Media</option>
                                <option value="high">Alta</option>
                                <option value="critical">Crítica</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Tipo</label>
                            <input
                                type="text"
                                value={task.type}
                                onChange={(e) => setTask({ ...task, type: e.target.value })}
                                className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Assignment Logic */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold border-b border-gray-100 dark:border-gray-800 pb-2">Destinatarios</h2>

                    {/* Nivel 1: Alcance */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">1. Definir Alcance</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setScope("all")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${scope === "all" ? "bg-[#851c74] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>Provincial</button>
                            <button type="button" onClick={() => setScope("section")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${scope === "section" ? "bg-[#851c74] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>Sección</button>
                            <button type="button" onClick={() => setScope("district")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${scope === "district" ? "bg-[#851c74] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>Partido</button>
                        </div>
                    </div>

                    {/* Nivel 2: Selección Geográfica */}
                    {scope !== "all" && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">2. Seleccionar Territorio</label>

                            <div className="space-y-4">
                                <select
                                    value={selectedSection}
                                    onChange={(e) => {
                                        setSelectedSection(e.target.value);
                                        setSelectedDistrict(""); // Reset district
                                    }}
                                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                >
                                    <option value="">Seleccionar Sección</option>
                                    {ELECTORAL_SECTIONS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                </select>

                                {scope === "district" && selectedSection && (
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                    >
                                        <option value="">Seleccionar Partido</option>
                                        {ELECTORAL_SECTIONS.find(s => s.name === selectedSection)?.districts.sort().map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Nivel 3: Asignación de Usuarios */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">3. Asignar Responsables</label>

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="assignMode"
                                    checked={assignmentMode === "all_in_territory"}
                                    onChange={() => setAssignmentMode("all_in_territory")}
                                    className="text-[#851c74] focus:ring-[#851c74]"
                                />
                                <span className="text-sm font-medium">Todos en el territorio</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="assignMode"
                                    checked={assignmentMode === "specific_users"}
                                    onChange={() => setAssignmentMode("specific_users")}
                                    className="text-[#851c74] focus:ring-[#851c74]"
                                />
                                <span className="text-sm font-medium">Elegir usuarios</span>
                            </label>
                        </div>

                        {assignmentMode === "specific_users" && (
                            <div className="max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-700 rounded-lg">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => handleUserToggle(user.id)}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUserIds.includes(user.id) ? "bg-[#851c74] border-[#851c74]" : "border-gray-300 dark:border-gray-600"}`}>
                                                {selectedUserIds.includes(user.id) && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.territory}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-gray-400">No se encontraron usuarios en este territorio.</div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold p-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">add_task</span>
                                Crear Tarea
                            </>
                        )}
                    </button>
                </div>

            </form>
        </main>
    );
}
