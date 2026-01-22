"use client";

import { useEffect, useState } from "react";
import { useRBAC } from "@/hooks/useRBAC";

interface Post {
    id: string;
    title: string;
    content: string;
    type: string;
    publishedAt: string;
    isRead: boolean;
    author: { name: string };
}

export function AnnouncementFeed() {
    const { hasPermission } = useRBAC();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

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

    const markAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/posts/${id}/read`, { method: "POST" });
            if (res.ok) {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, isRead: true } : p));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return <div className="p-4 text-center">Cargando comunicados...</div>;
    if (posts.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold">Comunicados</h2>
                {hasPermission('posts:manage') && (
                    <a href="/admin/posts" className="text-xs text-[#851c74] font-bold hover:underline">Gestionar</a>
                )}
            </div>

            <div className="space-y-3">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className={`p-4 rounded-2xl border transition-all ${post.type === 'urgent'
                                ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20'
                                : 'bg-white border-gray-100 dark:bg-[#20121d] dark:border-gray-800'
                            } ${!post.isRead ? 'ring-2 ring-purple-500/20' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {post.type === 'urgent' && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">
                                        <span className="material-symbols-outlined text-xs leading-none">emergency</span> Urgente
                                    </span>
                                )}
                                <h3 className="font-bold text-sm">{post.title}</h3>
                            </div>
                            <span className="text-[10px] text-gray-400">
                                {new Date(post.publishedAt).toLocaleDateString()}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {post.content}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">Por {post.author.name}</span>
                            {!post.isRead && (
                                <button
                                    onClick={() => markAsRead(post.id)}
                                    className="text-[10px] font-bold text-[#851c74] hover:underline flex items-center gap-2 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                                >
                                    <span className="material-symbols-outlined text-sm leading-none">check_circle</span> Marcar leído
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
