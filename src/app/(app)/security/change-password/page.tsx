"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("Las contraseñas nuevas no coinciden");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            if (res.ok) {
                alert("Contraseña actualizada correctamente");
                router.back();
            } else {
                const data = await res.json();
                alert(data.error || "Error al actualizar la contraseña");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Cambiar Contraseña</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Contraseña Actual</label>
                    <input
                        type="password"
                        required
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white"
                        placeholder="••••••••"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Nueva Contraseña</label>
                    <input
                        type="password"
                        required
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white"
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-400 pl-1">Mínimo 8 caracteres, una mayúscula y un número.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Confirmar Contraseña</label>
                    <input
                        type="password"
                        required
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold p-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-8"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">lock_reset</span>
                            Actualizar Contraseña
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
