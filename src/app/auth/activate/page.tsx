"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

// Componente interno para manejar useSearchParams
function ActivateForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const name = searchParams.get('name') || "Usuario";
    const email = searchParams.get('email') || "usuario@lapurpura.com";

    // Estados visuales simulados
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Las contraseñas no coinciden");
            return;
        }

        setIsActivating(true);

        try {
            const res = await fetch('/api/auth/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password
                })
            });

            if (res.ok) {
                router.push('/auth/welcome?name=' + encodeURIComponent(name));
            } else {
                const data = await res.json();
                alert(data.error || "Error al activar la cuenta");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#851c74] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[#851c74]/30">
                    LP
                </div>
                <h1 className="text-2xl font-extrabold text-[#851c74] mb-1">Activar Cuenta</h1>
                <p className="text-sm text-gray-500">Bienvenido/a, <span className="font-bold text-gray-800 dark:text-gray-200">{name}</span></p>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400">mail</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">{email}</span>
                    <span className="material-symbols-outlined text-green-500 ml-auto text-sm">verified</span>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nueva Contraseña</label>
                    <input
                        required
                        type="password"
                        minLength={6}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74] transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Contraseña</label>
                    <input
                        required
                        type="password"
                        minLength={6}
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 transition-all ${confirm && password !== confirm ? 'ring-red-500 focus:ring-red-500' : 'ring-[#851c74]'
                            }`}
                        placeholder="••••••••"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                    />
                    {confirm && password !== confirm && (
                        <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                    )}
                </div>

                <div className="flex items-center gap-2 py-2">
                    <input type="checkbox" id="terms" required className="accent-[#851c74] w-4 h-4 cursor-pointer" />
                    <label htmlFor="terms" className="text-xs text-gray-500 cursor-pointer">Acepto los Términos y Condiciones de Uso</label>
                </div>

                <button
                    type="submit"
                    disabled={isActivating}
                    className="w-full bg-[#851c74] text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#851c74]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isActivating ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Activando...
                        </>
                    ) : (
                        "ACTIVAR CUENTA"
                    )}
                </button>
            </form>
        </div>
    );
}

export default function ActivatePage() {
    return (
        <main className="min-h-screen bg-[#f3eef2] dark:bg-black flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <Suspense fallback={<div className="text-[#851c74] font-bold">Cargando...</div>}>
                <ActivateForm />
            </Suspense>
        </main>
    );
}
