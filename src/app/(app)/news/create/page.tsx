"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function CreateNewsPage() {
    const router = useRouter();
    const addNews = useAppStore((state) => state.addNews);
    const [loading, setLoading] = useState(false);

    const [news, setNews] = useState({
        title: "",
        content: "",
        segment: "all"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newNewsItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: news.title,
            summary: news.content,
            author: "Administrador",
            date: new Date().toISOString().split('T')[0]
        };

        setTimeout(() => {
            addNews(newNewsItem);
            setLoading(false);
            router.push("/dashboard");
            alert("Comunicación enviada con éxito");
        }, 1000);
    };

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark p-6 pb-24 text-[#171216] dark:text-white">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-2xl font-bold">Nueva Comunicación</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Asunto</label>
                    <input
                        type="text"
                        required
                        value={news.title}
                        onChange={(e) => setNews({ ...news, title: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white"
                        placeholder="Ej: Aviso importante sobre..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Destinatarios</label>
                    <select
                        value={news.segment}
                        onChange={(e) => setNews({ ...news, segment: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white appearance-none"
                    >
                        <option value="all">Todos los Usuarios</option>
                        <option value="admins">Solo Administradores</option>
                        <option value="territory">Mi Territorio</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">Mensaje</label>
                    <textarea
                        required
                        value={news.content}
                        onChange={(e) => setNews({ ...news, content: e.target.value })}
                        className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-none shadow-sm focus:ring-2 focus:ring-primary text-[#171216] dark:text-white h-48 resize-none"
                        placeholder="Escribe tu comunicado aquí..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#851c74] text-white font-bold p-4 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-8"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">send</span>
                            Enviar Comunicado
                        </>
                    )}
                </button>
            </form>
        </main>
    );
}
