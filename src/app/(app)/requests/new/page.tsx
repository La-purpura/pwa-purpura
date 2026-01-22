"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function NewRequestPage() {
    const router = useRouter();
    const user = useAppStore((state) => state.user);
    const [type, setType] = useState("Relevamiento Social");
    const [observation, setObservation] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    data: { observation },
                    territoryId: user?.territoryId
                }),
            });

            if (res.ok) {
                alert("Solicitud enviada correctamente");
                router.push("/dashboard");
            } else {
                const data = await res.json();
                alert(data.error || "Error al enviar solicitud");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Nueva Solicitud</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#20121d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-2">Tipo de Solicitud</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#851c74]"
                    >
                        <option>Relevamiento Social</option>
                        <option>Pedido de Recursos</option>
                        <option>Alerta Territorial</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Observaciones / Detalles</label>
                    <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        required
                        placeholder="Describe brevemente la solicitud..."
                        className="w-full p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-[#851c74] h-32 resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#851c74] text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                    {loading ? "Enviando..." : "Enviar Solicitud"}
                </button>
            </form>
        </div>
    );
}
