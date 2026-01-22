"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS, Role } from "@/lib/permissions";

export default function InviteUserPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Datos, 2: Roles, 3: Confirmación
    const [generatedLink, setGeneratedLink] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        lastname: "",
        email: "",
        phone: "",
        dni: "",
        role: "Referente" as Role,
        territory: "San Isidro", // Default mock
        branch: "Madre", // Rama principal
        accessLevel: "SELF_ONLY",
        expiresIn: "48h"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulación de generación de token
        const mockToken = `tk_${Math.random().toString(36).substr(2, 9)}`;
        const link = `${window.location.origin}/auth/activate?token=${mockToken}&name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`;

        setGeneratedLink(link);
        setStep(3);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        alert("¡Enlace copiado al portapapeles!");
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black p-6 pb-24 text-gray-800 dark:text-white">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-[#851c74]">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Invitar Usuario</h1>
                    <p className="text-xs text-gray-500">Alta de nuevo miembro del equipo</p>
                </div>
            </header>

            {step < 3 ? (
                <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }} className="max-w-xl mx-auto space-y-6">

                    {/* Steps Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1 ? 'bg-[#851c74] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className="h-1 w-12 bg-gray-200 dark:bg-gray-800"><div className={`h-full bg-[#851c74] transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2 ? 'bg-[#851c74] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>

                    <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#851c74]">person</span>
                                    Identidad
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre *</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellido *</label>
                                        <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                            value={formData.lastname} onChange={e => setFormData({ ...formData, lastname: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email *</label>
                                    <input required type="email" className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono</label>
                                        <input type="tel" className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">DNI</label>
                                        <input type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                            value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="bg-[#851c74] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                                        Siguiente
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-[#851c74]">verified_user</span>
                                    Asignación Operativa
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol del Sistema *</label>
                                    <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as Role })}>
                                        {Object.entries(ROLE_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rama Principal *</label>
                                        <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                            value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                                            <option value="Madre">Madre</option>
                                            <option value="Juventud">Juventud</option>
                                            <option value="Profesionales">Profesionales</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiración Link</label>
                                        <select className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                                            value={formData.expiresIn} onChange={e => setFormData({ ...formData, expiresIn: e.target.value })}>
                                            <option value="24h">24 Horas</option>
                                            <option value="48h">48 Horas</option>
                                            <option value="7d">7 Días</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nivel de Acceso</label>
                                    <div className="flex gap-2">
                                        {['SELF_ONLY', 'CHILDREN', 'FULL'].map(level => (
                                            <button key={level} type="button"
                                                onClick={() => setFormData({ ...formData, accessLevel: level })}
                                                className={`flex-1 p-2 rounded-lg text-xs font-bold border transition-colors ${formData.accessLevel === level
                                                        ? 'bg-[#851c74]/10 border-[#851c74] text-[#851c74]'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-500'
                                                    }`}>
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-between">
                                    <button type="button" onClick={() => setStep(1)} className="text-gray-500 font-bold px-4">
                                        Volver
                                    </button>
                                    <button type="submit" className="bg-[#851c74] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-[#851c74]/20">
                                        <span className="material-symbols-outlined">send</span>
                                        Crear Invitación
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            ) : (
                <div className="max-w-xl mx-auto bg-green-50 dark:bg-green-900/10 p-8 rounded-2xl border border-green-100 dark:border-green-800 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">check</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">¡Usuario Invitado!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Hemos generado un enlace de activación único para <strong>{formData.name}</strong>.</p>

                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 mb-6 overflow-hidden">
                        <span className="material-symbols-outlined text-gray-400">link</span>
                        <p className="text-xs font-mono text-gray-500 truncate flex-1 text-left">{generatedLink}</p>
                        <button onClick={copyLink} className="text-[#851c74] font-bold text-xs hover:underline whitespace-nowrap">COPIAR</button>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setStep(1); setGeneratedLink(""); }} className="text-gray-500 font-bold text-sm">Invitar otro</button>
                        <button onClick={() => window.open(generatedLink, '_blank')} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                            Simular Activación
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
