
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

    constructor() {
        super('PurpuraDB');
        this.version(2).stores({
            tasks: 'id, status, priority, createdAt, updatedAt',
            projects: 'id, status, leaderId, createdAt, updatedAt',
            alerts: 'id, severity, status, createdAt',
            reports: 'id, category, status, createdAt, updatedAt',
            posts: 'id, authorId, publishedAt',
            users_light: 'id, email',
            sync_state: 'id',
            offline_actions: '++id, type, status, createdAt',

            // New tables
            sync_queue: '++id, status, type, createdAt',
            change_log: '++id, entityId, entityType, operation, timestamp',
            meta: 'id'
        });
    }
}

export const db = new AppDatabase();
