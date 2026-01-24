"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";
import Link from "next/link";

type Post = {
    id: string;
    title: string;
    content: string;
    type: string;
    publishedAt: string;
    author: { name: string };
    isRead: boolean;
};

export default function NewsPage() {
    const router = useRouter();
    const { hasPermission } = useRBAC();
    const [posts, setPosts] = useState<Post[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (currentCursor: string | null = null) => {
        if (currentCursor) setLoadingMore(true);
        else setLoading(true);

        try {
            const url = `/api/posts?cursor=${currentCursor || ""}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (currentCursor) {
                    setPosts(prev => [...prev, ...data.items]);
                } else {
                    setPosts(data.items);
                }
                setCursor(data.nextCursor);
                setHasMore(!!data.nextCursor);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleMarkAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/posts/${id}/read`, { method: 'POST' });
            if (res.ok) {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, isRead: true } : p));
            }
        } catch (e) { console.error(e); }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <header className="bg-white dark:bg-[#1a1a1a] p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black dark:text-white">Comunicación</h1>
                        <p className="text-[10px] font-black uppercase text-[#851c74] tracking-widest mt-1">Canal Oficial Interno</p>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                {posts.map(post => (
                    <div
                        key={post.id}
                        onClick={() => !post.isRead && handleMarkAsRead(post.id)}
                        className={`bg-white dark:bg-[#1a1a1a] rounded-[2rem] border transition-all p-6 ${post.isRead ? 'border-transparent opacity-75' : 'border-[#851c74]/20 shadow-lg shadow-purple-900/5'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black uppercase bg-[#851c74]/10 text-[#851c74] px-2.5 py-1 rounded-full">
                                {post.type}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold">
                                {new Date(post.publishedAt).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' })}
                            </span>
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">{post.title}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap line-clamp-4 leading-relaxed mb-4">
                            {post.content}
                        </div>

                        <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xs text-gray-500">person</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 capitalize">{post.author.name}</span>
                            </div>

                            {!post.isRead && (
                                <div className="flex items-center gap-1.5 text-[#851c74]">
                                    <span className="size-1.5 bg-[#851c74] rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Nuevo</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="py-10 text-center text-[#851c74] font-bold animate-pulse">Cargando comunicados...</div>
                )}

                {!loading && hasMore && (
                    <button
                        onClick={() => fetchPosts(cursor)}
                        disabled={loadingMore}
                        className="w-full py-4 text-xs font-black uppercase text-[#851c74] hover:bg-white dark:hover:bg-[#1a1a1a] rounded-2xl transition-all"
                    >
                        {loadingMore ? 'Cargando...' : 'Cargar más antiguos'}
                    </button>
                )}

                {!loading && posts.length === 0 && (
                    <div className="py-20 text-center text-gray-400 italic">No hay comunicados publicados aún.</div>
                )}
            </div>

            {hasPermission('posts:create') && (
                <button
                    onClick={() => router.push("/news/create")}
                    className="fixed bottom-24 right-4 bg-[#851c74] text-white size-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
                >
                    <span className="material-symbols-outlined text-2xl">add_comment</span>
                </button>
            )}
        </main>
    );
}
