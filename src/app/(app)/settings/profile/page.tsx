"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function ProfilePage() {
    const router = useRouter();
    const { user, setUser } = useAppStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        alias: user?.alias || "",
        phone: user?.phone || "",
        email: user?.email || "", // Email is usually read-only but shown
        photoUrl: user?.photoUrl || ""
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/me/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    alias: formData.alias,
                    phone: formData.phone,
                    photoUrl: formData.photoUrl
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // Update local store
                if (user) {
                    setUser({ ...user, ...updatedUser });
                }
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar perfil' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black p-6 pb-24">
            <header className="flex items-center gap-4 mb-8 max-w-xl mx-auto">
                <button onClick={() => router.back()} className="size-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-[#851c74]">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black">Mi Perfil</h1>
            </header>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
                {/* Avatar Section */}
                <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                    <div className="relative group">
                        <div className="size-24 rounded-full bg-purple-100 dark:bg-purple-900/30 overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                            {formData.photoUrl ? (
                                <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#851c74]">
                                    {(formData.alias || formData.name || "U").substring(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 w-full">
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">URL de Fotografía</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-xs font-bold ring-[#851c74] focus:ring-2"
                            placeholder="https://ejemplo.com/foto.jpg"
                            value={formData.photoUrl}
                            onChange={e => setFormData({ ...formData, photoUrl: e.target.value })}
                        />
                        <p className="text-[9px] text-gray-400 mt-2 ml-1 italic">Ingresa una URL de imagen para tu avatar.</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Nombre Real (Filiación)</label>
                        <input
                            type="text"
                            required
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-sm font-bold ring-[#851c74] focus:ring-2"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Alias / Nombre Público</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-sm font-bold ring-[#851c74] focus:ring-2"
                            placeholder="¿Cómo quieres que te vean los demás?"
                            value={formData.alias}
                            onChange={e => setFormData({ ...formData, alias: e.target.value })}
                        />
                        <p className="text-[9px] text-gray-400 mt-2 ml-1 italic">Este es el nombre que se mostrará en las tareas y reportes públicos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Teléfono</label>
                            <input
                                type="tel"
                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none text-sm font-bold ring-[#851c74] focus:ring-2"
                                placeholder="+54 9..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Email (Referencia)</label>
                            <input
                                type="email"
                                disabled
                                className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-none text-sm font-bold opacity-60 cursor-not-allowed"
                                value={formData.email}
                            />
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-2xl text-center text-xs font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#851c74] text-white font-black p-6 rounded-[2rem] shadow-xl shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            GUARDAR CAMBIOS
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
