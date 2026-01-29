
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

    constructor() {
        super('PurpuraDB');
        this.version(1).stores({
            tasks: 'id, status, priority, createdAt',
            projects: 'id, status, leaderId, createdAt',
            alerts: 'id, severity, status, createdAt',
            reports: 'id, category, status, createdAt',
            posts: 'id, authorId, publishedAt',
            users_light: 'id, email',
            sync_state: 'id'
        });
    }
}

export const db = new AppDatabase();
