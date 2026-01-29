
import Dexie, { type Table } from 'dexie';

export interface SyncState {
    id: string; // entity name
    lastSync: string; // ISO date
}

export class AppDatabase extends Dexie {
    tasks!: Table<any>;
    projects!: Table<any>;
    alerts!: Table<any>;
    reports!: Table<any>;
    posts!: Table<any>;
    users_light!: Table<any>;
    sync_state!: Table<SyncState>;
    offline_actions!: Table<any>;

    // Offline-First Infrastructure
    sync_queue!: Table<any>;
    change_log!: Table<any>;
    meta!: Table<any>;

    // Uploads & Attachments
    attachments!: Table<any>;
    uploads_queue!: Table<any>;

    constructor() {
        super('PurpuraDB');
        this.version(5).stores({
            tasks: 'id, status, priority, createdAt, updatedAt',
            projects: 'id, status, leaderId, createdAt, updatedAt',
            alerts: 'id, severity, status, createdAt',
            reports: 'id, category, status, createdAt, updatedAt',
            posts: 'id, authorId, publishedAt',
            users_light: 'id, email',
            sync_state: 'id',
            offline_actions: '++id, type, status, createdAt',

            // Infrastructure v4
            sync_queue: '++id, status, entity, action, retry_count, createdAt',
            change_log: '++id, entity, entity_id, timestamp', // detailed changeset in payload
            meta: 'id',

            // New tables v5 (Start fresh or append? Dexie handles appendix well if we keep history)
            // PR-29: Attachments & Uploads
            attachments: 'id, owner_id, status, type, createdAt', // metadata + local blob if needed
            uploads_queue: '++id, status, retry_count, createdAt' // specialized queue for binaries?
        });
    }
}

export const db = new AppDatabase();
