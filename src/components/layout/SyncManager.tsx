
"use client";

import { useEffect } from "react";
import { syncService } from "@/lib/client/sync";
import { usePathname } from "next/navigation";

export function SyncManager() {
    const pathname = usePathname();

    useEffect(() => {
        // Run sync on mount (app start / refresh)
        if (navigator.onLine) {
            syncService.syncAll().catch(console.error);
            syncService.pushActions().catch(console.error);
            syncService.pushUploads().catch(console.error);
        }

        // Listener for online status
        const handleOnline = () => {
            console.log("Online detected: Triggering sync...");
            syncService.syncAll();
            syncService.pushActions();
            syncService.pushUploads();
        };

        window.addEventListener('online', handleOnline);

        // Periodically try to push actions (e.g. every minute) to ensure consistency or retry errors
        const intervalId = setInterval(() => {
            if (navigator.onLine) {
                syncService.pushActions().catch(() => { });
                syncService.pushUploads().catch(() => { });
                // Optional: Pull updates sparingly
                // syncService.pull(); 
            }
        }, 60000);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(intervalId);
        };
    }, []);

    // Route-based sync trigger?
    useEffect(() => {
        // When navigating to lists, we might want fresh data?
        // IndexedDB is source of truth, but we could trigger background pull.
        if (pathname === '/tasks' || pathname.includes('dashboard')) {
            // syncService.pull();
        }
    }, [pathname]);

    return null; // Logic component only
}
