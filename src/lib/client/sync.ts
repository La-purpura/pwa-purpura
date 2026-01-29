
import { db } from './db';

/**
 * Service to manage synchronization between API and IndexedDB.
 */
export const syncService = {
    /**
     * Performs an initial full sync or pulls deltas if already bootstrapped.
     */
    async syncAll() {
        try {
            const lastSyncEntry = await db.sync_state.get('global');

            if (!lastSyncEntry) {
                return this.bootstrap();
            } else {
                return this.pull(lastSyncEntry.lastSync);
            }
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    },

    /**
     * Initial full sync.
     */
    async bootstrap() {
        const response = await fetch('/api/sync/bootstrap');
        if (!response.ok) throw new Error('Bootstrap failed');

        const data = await response.json();

        await db.transaction('rw', [db.tasks, db.projects, db.alerts, db.reports, db.posts, db.sync_state], async () => {
            await db.tasks.bulkPut(data.tasks);
            await db.projects.bulkPut(data.projects);
            await db.alerts.bulkPut(data.alerts);
            await db.reports.bulkPut(data.reports);
            await db.posts.bulkPut(data.posts);
            await db.sync_state.put({ id: 'global', lastSync: data.timestamp });
        });

        return data;
    },

    /**
     * Delta sync.
     */
    async pull(since: string) {
        const response = await fetch(`/api/sync/pull?since=${encodeURIComponent(since)}`);
        if (!response.ok) throw new Error('Pull failed');

        const data = await response.json();

        await db.transaction('rw', [db.tasks, db.projects, db.alerts, db.reports, db.posts, db.sync_state], async () => {
            if (data.tasks.length) await db.tasks.bulkPut(data.tasks);
            if (data.projects.length) await db.projects.bulkPut(data.projects);
            if (data.alerts.length) await db.alerts.bulkPut(data.alerts);
            if (data.reports.length) await db.reports.bulkPut(data.reports);
            if (data.posts.length) await db.posts.bulkPut(data.posts);
            await db.sync_state.put({ id: 'global', lastSync: data.timestamp });
        });

        return data;
    }
};
