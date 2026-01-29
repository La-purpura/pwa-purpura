
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
    },

    /**
     * Pushes pending offline actions to the server.
     */
    /**
     * Pushes pending offline actions to the server.
     * Implements exponential backoff for retries.
     */
    async pushActions() {
        // Find pending actions, sort by creation time to maintain order
        const pending = await db.sync_queue
            .where('status').anyOf('pending', 'error') // We retry errors too if eligible
            .sortBy('createdAt');

        if (pending.length === 0) return;

        // Filter out items that are not ready for retry yet (Exponential Backoff)
        const now = Date.now();
        const actionable = pending.filter(action => {
            if (action.status === 'pending') return true;

            // If error/retry, check backoff
            // Base: 2 seconds, Cap: 1 hour. Delay = 2^retries * 1000
            const delay = Math.min(3600000, Math.pow(2, action.retry_count || 0) * 2000);
            const lastErrorTime = action.lastErrorAt ? new Date(action.lastErrorAt).getTime() : 0;
            return (now - lastErrorTime) > delay;
        });

        if (actionable.length === 0) return;

        // Mark as syncing
        await Promise.all(actionable.map(a => db.sync_queue.update(a.id, { status: 'syncing' })));

        try {
            const response = await fetch('/api/sync/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actions: actionable })
            });

            if (!response.ok) {
                // If the entire batch request fails (network, 500), revert to error/pending with retry increment
                throw new Error(`Batch Push Failed: ${response.status}`);
            }

            const { results } = await response.json();

            // Apply results
            for (const res of results) {
                const action = actionable.find(a => a.idempotencyKey === res.idempotencyKey);
                if (!action) continue;

                if (res.status >= 200 && res.status < 300) {
                    await db.sync_queue.update(action.id, {
                        status: 'synced',
                        result: res.body,
                        syncedAt: new Date().toISOString()
                    });
                } else if (res.status === 409) {
                    await db.sync_queue.update(action.id, {
                        status: 'conflict',
                        error: 'Version mismatch or logic conflict',
                        conflictDetails: res.error
                    });
                } else {
                    // Application error (400, 500 specific to item)
                    await db.sync_queue.update(action.id, {
                        status: 'error',
                        last_error: res.error,
                        lastErrorAt: new Date().toISOString(),
                        retry_count: (action.retry_count || 0) + 1
                    });
                }
            }

        } catch (error: any) {
            console.error('Push actions network/batch failure:', error);

            // Revert all to error state with backoff increment
            for (const action of actionable) {
                await db.sync_queue.update(action.id, {
                    status: 'error',
                    last_error: error.message || 'Network Error',
                    lastErrorAt: new Date().toISOString(),
                    retry_count: (action.retry_count || 0) + 1
                });
            }
        }
    }
},

    /**
     * Uploads pending files.
     */
    async pushUploads() {
        const pending = await db.uploads_queue
            .where('status').anyOf('pending', 'error')
            .sortBy('createdAt');

        if (pending.length === 0) return;

        for (const task of pending) {
            // Check backoff
            if (task.status === 'error') {
                const delay = Math.min(3600000, Math.pow(2, task.retry_count || 0) * 2000);
                const lastErrorTime = task.lastErrorAt ? new Date(task.lastErrorAt).getTime() : 0;
                if (Date.now() - lastErrorTime < delay) continue;
            }

            const attachment = await db.attachments.get(task.attachmentId);
            if (!attachment || !attachment.file) {
                // If attachment is missing or has no file blob, we can't upload. Mark as failed permanently?
                // Or maybe it was already synced and cleaned up? Check status.
                if (attachment?.status === 'synced') {
                    await db.uploads_queue.delete(task.id);
                } else {
                    console.error('Attachment file missing for upload', task);
                    // Mark queue item as failed to avoid infinite loop
                    await db.uploads_queue.update(task.id, { status: 'failed_fatal', error: 'File blob missing' });
                }
                continue;
            }

            try {
                // 1. Get Presigned URL
                const preRes = await fetch('/api/uploads/presigned', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: attachment.name,
                        contentType: attachment.mimeType
                    })
                });

                if (!preRes.ok) throw new Error('Failed to get presigned URL');
                const { uploadUrl, key } = await preRes.json();

                // 2. Upload Binary
                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: attachment.file,
                    headers: { 'Content-Type': attachment.mimeType }
                });

                if (!uploadRes.ok) throw new Error('Failed to upload file to storage');

                // 3. Update Attachment Record (Local & Sync State)
                const publicUrl = uploadUrl.split('?')[0]; // simple approximation or return from server

                await db.attachments.update(attachment.id, {
                    status: 'synced',
                    url: publicUrl,
                    key: key,
                    file: null // Free up IndexedDB space!
                });

                // 4. Remove from queue
                await db.uploads_queue.delete(task.id);

            } catch (error: any) {
                console.error('Upload failed:', error);
                await db.uploads_queue.update(task.id, {
                    status: 'error',
                    last_error: error.message,
                    lastErrorAt: new Date().toISOString(),
                    retry_count: (task.retry_count || 0) + 1
                });
            }
        }
    },
        async queueAction(type: string, payload: any) {
    // Legacy support helper: try to parse type "CREATE_TASK" -> action="create", entity="tasks"
    const parts = type.split('_');
    const action = parts[0].toLowerCase();
    let entity = parts.slice(1).join('_').toLowerCase();
    if (!entity.endsWith('s')) entity += 's'; // simple pluralization

    const queueItem = {
        entity,
        action,
        payload,
        idempotencyKey: globalThis.crypto.randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    await db.sync_queue.add(queueItem);

    // Attempt sync immediately if online
    if (navigator.onLine) {
        this.pushActions().catch(() => { }); // Fire and forget
    }

    return action;
}
};
