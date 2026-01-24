"use client";

import { useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/store";

export function SyncManager() {
    const { offlineQueue, removeFromOfflineQueue, setSyncStatus, syncStatus } = useAppStore();

    const processQueue = useCallback(async () => {
        if (offlineQueue.length === 0 || syncStatus === 'syncing') return;

        console.log(`[SyncManager] Processing ${offlineQueue.length} items...`);
        setSyncStatus('syncing');

        const itemsToProcess = [...offlineQueue].sort((a, b) => a.timestamp - b.timestamp);
        let successCount = 0;

        for (const item of itemsToProcess) {
            try {
                const response = await fetch(item.endpoint, {
                    method: item.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.payload),
                });

                if (response.ok) {
                    removeFromOfflineQueue(item.id);
                    successCount++;
                } else {
                    console.error(`[SyncManager] Failed to sync item ${item.id}:`, await response.text());
                    // We don't remove it, it will stay for retry. 
                    // Note: In a real app we might want to handle 4xx vs 5xx differently
                }
            } catch (error) {
                console.error(`[SyncManager] Network error syncing item ${item.id}:`, error);
                break; // Stop processing if we lost connection again
            }
        }

        if (successCount === itemsToProcess.length) {
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
            setSyncStatus('error');
        }
    }, [offlineQueue, removeFromOfflineQueue, setSyncStatus, syncStatus]);

    useEffect(() => {
        const handleOnline = () => {
            console.log("[SyncManager] Back online. Starting sync...");
            processQueue();
        };

        window.addEventListener('online', handleOnline);

        // Also try to sync on mount if online
        if (window.navigator.onLine) {
            processQueue();
        }

        return () => window.removeEventListener('online', handleOnline);
    }, [processQueue]);

    return null; // This is a headless logic component
}
