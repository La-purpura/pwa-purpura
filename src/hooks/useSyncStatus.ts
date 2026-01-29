
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/client/db";
import { useEffect, useState } from "react";

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error' | 'pending';

export function useSyncStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const queueStats = useLiveQuery(async () => {
        const pendingCount = await db.sync_queue.where('status').equals('pending').count();
        const syncingCount = await db.sync_queue.where('status').equals('syncing').count();
        const errorCount = await db.sync_queue.where('status').equals('error').count();
        const conflictCount = await db.sync_queue.where('status').equals('conflict').count();
        const uploadsCount = await db.uploads_queue.where('status').anyOf('pending', 'error').count();

        return { pendingCount, syncingCount, errorCount, conflictCount, uploadsCount };
    }, []) || { pendingCount: 0, syncingCount: 0, errorCount: 0, conflictCount: 0, uploadsCount: 0 };

    const { pendingCount, syncingCount, errorCount, conflictCount, uploadsCount } = queueStats;

    let status: SyncStatus = 'synced';
    let label = 'Sincronizado';
    let details = '';

    if (!isOnline) {
        status = 'offline';
        label = 'Sin conexión';
        details = `${pendingCount + uploadsCount} cambios pendientes`;
    } else if (conflictCount > 0) {
        status = 'error'; // Conflicts are errors requiring attention
        label = 'Conflictos detectados';
        details = `${conflictCount} requieren revisión`;
    } else if (errorCount > 0) {
        status = 'error';
        label = 'Error de sincronización';
        details = 'Reintentando...';
    } else if (syncingCount > 0) {
        status = 'syncing';
        label = 'Sincronizando...';
    } else if (pendingCount > 0 || uploadsCount > 0) {
        status = 'pending';
        label = 'Guardado local';
        details = 'Esperando red...';
    }

    return {
        status,
        label,
        details,
        isOnline,
        stats: queueStats
    };
}
