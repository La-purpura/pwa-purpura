"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";

export function NotificationsPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const alerts = useAppStore((state) => state.alerts);
    const markAsRead = useAppStore((state) => state.markAlertAsRead);

    const unreadCount = alerts.filter(a => !a.isRead).length;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#20121d]"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-12 right-0 w-80 bg-white dark:bg-[#20121d] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold">Notificaciones</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{unreadCount} nuevas</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {alerts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <span className="material-symbols-outlined text-3xl mb-2">notifications_off</span>
                                    <p className="text-xs">No tienes notificaciones</p>
                                </div>
                            ) : (
                                alerts.map(alert => (
                                    <div key={alert.id} className={`p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!alert.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                                        <div className="flex gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.priority === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{alert.type}</p>
                                                <p className="text-xs text-gray-500 mb-2">{alert.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-gray-400">{alert.territory}</span>
                                                    {!alert.isRead && (
                                                        <button onClick={() => markAsRead(alert.id)} className="text-[10px] text-[#851c74] font-bold hover:underline">Marcar leída</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-center">
                            <button className="text-xs font-bold text-[#851c74]">Ver todas</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
