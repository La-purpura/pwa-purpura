"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    data?: any;
}

export function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications?limit=15");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
        } catch (e) {
            console.error(e);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
            >
                <span className={`material-symbols-outlined transition-colors ${isOpen ? 'text-[#851c74]' : 'text-gray-600 dark:text-gray-300'}`}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#20121d] animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-12 right-0 w-80 md:w-96 bg-white dark:bg-[#20121d] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                            <h3 className="font-bold text-sm">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold bg-[#851c74]/10 text-[#851c74] px-2 py-0.5 rounded-full">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse flex gap-3">
                                            <div className="size-8 bg-gray-100 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                                                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_off</span>
                                    <p className="text-xs font-medium">No tienes notificaciones</p>
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.isRead ? "bg-purple-50/30 dark:bg-purple-900/10" : ""}`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 size-2 rounded-full flex-shrink-0 ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'success' ? 'bg-green-500' : notification.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={`text-sm font-bold truncate ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug mb-2 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                {notification.data?.url && (
                                                    <Link
                                                        href={notification.data.url}
                                                        onClick={() => setIsOpen(false)}
                                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#851c74] hover:underline"
                                                    >
                                                        Ver detalle
                                                        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
