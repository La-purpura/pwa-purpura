"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";

export default function AdminPostsPage() {
    const { hasPermission } = useRBAC();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("news");
    const [submitting, setSubmitting] = useState(false);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts");
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, type }),
            });
            if (res.ok) {
                setShowCreate(false);
                setTitle("");
                setContent("");
                fetchPosts();
            }
        } catch (error) {
            alert("Error al crear");
        } finally {
            setSubmitting(false);
        }
    };

    if (!hasPermission("posts:manage")) return <div className="p-8 text-center">Acceso denegado</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gestión de Comunicados</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-[#851c74] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-all"
                >
                    {showCreate ? "Cancelar" : "Nuevo Comunicado"}
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-[#20121d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4 animate-in slide-in-from-top duration-300">
                    <div>
                        <label className="block text-sm font-bold mb-1">Título</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Tipo</label>
                        <select
                            value={type}
                            onChange={e => setType(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 outline-none"
                        >
                            <option value="news">Noticia General</option>
                            <option value="urgent">Urgente (Requiere Lectura)</option>
                            <option value="internal">Nota Interna</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Contenido</label>
                        <textarea
                            required
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 h-32 outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        disabled={submitting}
                        type="submit"
                        className="w-full py-3 bg-[#851c74] text-white font-bold rounded-xl disabled:opacity-50"
                    >
                        {submitting ? "Publicando..." : "Publicar Ahora"}
                    </button>
                </form>
            )}

            <div className="bg-white dark:bg-[#20121d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                        <tr>
                            <th className="px-6 py-4">Comunicado</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Alcance</th>
                            <th className="px-6 py-4 text-center">Leído</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Cargando comunicaciones...</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay comunicados publicados</td></tr>
                        ) : posts.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold">{post.title}</p>
                                    <p className="text-xs text-gray-400">{new Date(post.publishedAt).toLocaleDateString()} • Por {post.author.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${post.type === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {post.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {post.territoryId ? "Territorial" : post.branchId ? "Rama" : "Global"}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-[#851c74]">
                                    {/* Aquí podríamos hacer un fetch rápido de lecturas o dejarlo como botón de ver detalle */}
                                    -
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
