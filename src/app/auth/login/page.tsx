"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAppStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Fetch full profile and access
                const [meRes, accessRes] = await Promise.all([
                    fetch('/api/me'),
                    fetch('/api/me/effective-access')
                ]);

                if (meRes.ok && accessRes.ok) {
                    const meData = await meRes.json();
                    const accessData = await accessRes.json();
                    setUser({ ...meData, ...accessData });
                    router.replace("/dashboard");
                } else {
                    setError("Error al cargar perfil tras login.");
                }
            } else {
                setError(data.error || "Credenciales incorrectas");
            }
        } catch (err) {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="text-center mb-10">
                    <div className="inline-flex size-16 bg-[#851c74]/10 rounded-2xl items-center justify-center text-[#851c74] mb-4">
                        <span className="material-symbols-outlined text-3xl">login</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Acceso Agentes</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Introduce tus credenciales</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Oficial</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#851c74]/20 focus:border-[#851c74] transition-all outline-none"
                            placeholder="ejemplo@purpura.app"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/50 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#851c74]/20 focus:border-[#851c74] transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                            <p className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-tighter">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#851c74] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#6a165d] shadow-lg shadow-purple-900/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm text-white/50">key</span>
                                Entrar al Sistema
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-800 text-center">
                    <Link href="/recover-password" title="Recuperar Contraseña">
                        <span className="text-[10px] font-black uppercase text-gray-400 hover:text-[#851c74] transition-colors tracking-widest">¿Olvidaste tu contraseña?</span>
                    </Link>
                </div>
            </div>

            <div className="mt-8">
                <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
                </Link>
            </div>
        </main>
    );
}
