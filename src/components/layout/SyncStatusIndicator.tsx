"use client";

import { useAppStore } from "@/lib/store";
import { useEffect, useState } from "react";

export function SyncStatusIndicator() {
    const { offlineQueue, syncStatus } = useAppStore();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(window.navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const pendingCount = offlineQueue.length;

    if (pendingCount === 0 && isOnline && syncStatus !== 'syncing') return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom-4 duration-300">
            <div className={`
        flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md
        ${!isOnline
                    ? 'bg-amber-500/90 border-amber-400 text-white'
                    : syncStatus === 'syncing'
                        ? 'bg-blue-600/90 border-blue-400 text-white'
                        : syncStatus === 'error'
                            ? 'bg-red-600/90 border-red-400 text-white'
                            : 'bg-green-600/90 border-green-400 text-white'
                }
      `}>
                <span className="material-symbols-outlined text-sm animate-pulse">
                    {!isOnline ? 'cloud_off' : syncStatus === 'syncing' ? 'sync' : syncStatus === 'error' ? 'sync_problem' : 'cloud_done'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {!isOnline
                        ? `${pendingCount} Pendientes - Offline`
                        : syncStatus === 'syncing'
                            ? `Sincronizando ${pendingCount}...`
                            : syncStatus === 'error'
                                ? 'Error al sincronizar'
                                : 'Todo sincronizado'}
                </span>
            </div>
        </div>
    );
}
