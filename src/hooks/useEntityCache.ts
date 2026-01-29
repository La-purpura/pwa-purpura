
import { useState, useEffect } from 'react';
import { db } from '@/lib/client/db';
import { syncService } from '@/lib/client/sync';
import { useLiveQuery } from 'dexie-react-hooks';

/**
 * Hook to get entities from cache and refresh them from API.
 * Pattern: Stale-While-Revalidate (SWR) with IndexedDB.
 */
export function useEntityCache<T>(
    tableName: 'tasks' | 'projects' | 'alerts' | 'reports' | 'posts',
    filter?: (item: T) => boolean
) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Live query from IndexedDB
    // @ts-ignore
    const data = useLiveQuery(
        async () => {
            // @ts-ignore
            const items = await db[tableName].toArray();
            return filter ? items.filter(filter) : items;
        },
        [tableName] // dependencies
    );

    useEffect(() => {
        async function refresh() {
            if (!navigator.onLine) {
                setLoading(false);
                return;
            }

            try {
                await syncService.syncAll();
            } catch (err: any) {
                console.warn('Refresh failed, using cache:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        refresh();
    }, [tableName]);

    return {
        data: data || [],
        loading: loading && (!data || data.length === 0),
        isRefreshing: loading,
        error
    };
}
