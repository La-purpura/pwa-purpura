"use client";

import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditProfilePage() {
    const user = useAppStore((state) => state.user);
    const setUser = useAppStore((state) => state.setUser);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "261 555 1234", // Mock field not in main user type yet, but useful for form
        territory: user?.territory || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call API to update
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedUserMock = await res.json();
                // Client side update
                setUser({ ...user!, ...formData });
                // Note: In real app, we would use the response from server, 
                // but our mock server returns static mockUser + changes, so we trust our formData for local store
                router.back();
            }
        } catch (error) {
            console.error("Error updating profile", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold text-[#171216] dark:text-white">Editar Mis Datos</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Nombre Completo</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white font-medium"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Teléfono</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white font-medium"
                    />
                </div>

                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-800 flex gap-3">
                    <span className="material-symbols-outlined text-orange-500">info</span>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                        Para cambios de Territorio o Rol, por favor contacte a un administrador.
                    </p>
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
                            <span className="material-symbols-outlined">save</span>
                            Guardar Cambios
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
