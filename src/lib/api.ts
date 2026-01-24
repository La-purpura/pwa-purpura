import { useAppStore } from "./store";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
    method?: HttpMethod;
    body?: any;
    title?: string; // Title for the offline queue item
    skipQueue?: boolean;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
    const { method = 'GET', body, title = 'Operación en segundo plano', skipQueue = false } = options;
    const isOnline = typeof window !== 'undefined' ? window.navigator.onLine : true;

    // If reading data (GET), we always try to fetch, if offline it will fail anyway (or we could use a cache)
    if (method === 'GET') {
        return fetch(endpoint);
    }

    // If writing data and offline, queue it (unless skipped)
    if (!isOnline && !skipQueue) {
        const addToQueue = useAppStore.getState().addToOfflineQueue;
        addToQueue({
            endpoint,
            method: method as any,
            payload: body,
            title
        });

        // Return a mock successful response so the UI doesn't crash, 
        // but the user should be notified it's queued.
        return new Response(JSON.stringify({ queued: true, message: "En cola para sincronizar" }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // If online or skipQueue, execute normally
    return fetch(endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}
