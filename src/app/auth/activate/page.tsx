"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

/**
 * Componente interno para manejar el formulario de activación.
 */
function ActivateForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [isValidating, setIsValidating] = useState(true);
    const [inviteData, setInviteData] = useState<{
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
    } | null>(null);
    const [validationError, setValidationError] = useState("");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isActivating, setIsActivating] = useState(false);

    useEffect(() => {
        if (!token) {
            setValidationError("Enlace de invitación no proporcionado.");
            setIsValidating(false);
            return;
        }

        const validate = async () => {
            try {
                const res = await fetch(`/api/invites/validate?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setInviteData(data);
                } else {
                    setValidationError(data.error || "Invitación no válida");
                }
            } catch (e) {
                setValidationError("Error al validar la invitación.");
            } finally {
                setIsValidating(false);
            }
        };

        validate();
    }, [token]);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            alert("Las contraseñas no coinciden");
            return;
        }

        setIsActivating(true);

        try {
            const res = await fetch('/api/invites/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password,
                    confirmPassword: confirm
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Redigir al home (el API ya seteó la cookie de sesión)
                router.push('/home');
            } else {
                alert(data.error || "Error al activar la cuenta");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsActivating(false);
        }
    };

    if (isValidating) {
        return (
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#851c74]"></div>
                <p className="text-[#851c74] font-bold">Validando invitación...</p>
            </div>
        );
    }

    if (validationError) {
        return (
            <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-2xl border border-red-100 text-center">
                <span className="material-symbols-outlined text-red-500 text-5xl mb-4">error_outline</span>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Enlace No Válido</h1>
                <p className="text-gray-500 mb-6">{validationError}</p>
                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-100 p-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#851c74] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[#851c74]/30">
                    LP
                </div>
                <h1 className="text-2xl font-extrabold text-[#851c74] mb-1">Activar Cuenta</h1>
                <p className="text-sm text-gray-500">
                    Hola <span className="font-bold text-gray-800 dark:text-gray-200">{inviteData?.firstName || "Referente"}</span>, establece tu contraseña para comenzar.
                </p>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 mb-6 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400">mail</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono truncate">{inviteData?.email}</span>
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
                    disabled={isActivating || !password || (password !== confirm)}
                    className="w-full bg-[#851c74] text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#851c74]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
