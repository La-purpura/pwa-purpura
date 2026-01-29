
import { db } from './db';
import { Table } from 'dexie';

export type EntityType = 'tasks' | 'projects' | 'alerts' | 'reports' | 'posts';

export class BaseRepository<T extends { id: string }> {
    constructor(
        private table: Table<T>,
        private entityName: EntityType
    ) { }

    async getAll() {
        return this.table.toArray();
    }

    async getById(id: string) {
        return this.table.get(id);
    }

    async create(data: T, syncd = false) {
        return db.transaction('rw', [this.table, db.sync_queue, db.change_log], async () => {
            await this.table.put(data);

            if (!syncd) {
                await db.sync_queue.add({
                    entity: this.entityName,
                    action: 'create',
                    payload: data,
                    idempotencyKey: globalThis.crypto.randomUUID(),
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
            }

            await db.change_log.add({
                entity: this.entityName,
                entity_id: data.id,
                field: 'ALL',
                new_value: data,
                timestamp: new Date().toISOString()
            });

            return data;
        });
    }

    async update(id: string, changes: Partial<T>, syncd = false) {
        return db.transaction('rw', [this.table, db.sync_queue, db.change_log], async () => {
            const exists = await this.table.get(id);
            if (!exists) throw new Error("Entity not found locally");

            const updated = { ...exists, ...changes, updatedAt: new Date().toISOString() };
            await this.table.put(updated);

            if (!syncd) {
                await db.sync_queue.add({
                    entity: this.entityName,
                    action: 'update',
                    payload: { id, ...changes },
                    idempotencyKey: globalThis.crypto.randomUUID(),
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
            }

            // Log detailed changes for conflict resolution
            const timestamp = new Date().toISOString();
            const logEntries = Object.keys(changes).map(key => ({
                entity: this.entityName,
                entity_id: id,
                field: key,
                old_value: (exists as any)[key],
                new_value: (changes as any)[key],
                timestamp
            }));

            if (logEntries.length > 0) {
                await db.change_log.bulkAdd(logEntries);
            }

            return updated;
        });
    }

    async delete(id: string, syncd = false) {
        return db.transaction('rw', [this.table, db.sync_queue, db.change_log], async () => {
            await this.table.delete(id);

            if (!syncd) {
                await db.sync_queue.add({
                    entity: this.entityName,
                    action: 'delete',
                    payload: { id },
                    idempotencyKey: globalThis.crypto.randomUUID(),
                    status: 'pending',
                    createdAt: new Date().toISOString()
                });
            }

            await db.change_log.add({
                entity: this.entityName,
                entity_id: id,
                field: 'ALL',
                new_value: null, // deleted
                timestamp: new Date().toISOString()
            });
        });
    }
}

export const localRepository = {
    tasks: new BaseRepository(db.tasks, 'tasks'),
    projects: new BaseRepository(db.projects, 'projects'),
    reports: new BaseRepository(db.reports, 'reports'),
    alerts: new BaseRepository(db.alerts, 'alerts'),
    posts: new BaseRepository(db.posts, 'posts')
};
