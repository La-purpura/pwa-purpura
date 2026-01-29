
"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/client/db";
import { AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { localRepository } from "@/lib/client/repository";

export function ConflictResolver() {
    const conflicts = useLiveQuery(() =>
        db.sync_queue.where('status').equals('conflict').toArray()
    );

    const [resolving, setResolving] = useState<string | null>(null);

    const resolveConflict = async (item: any, strategy: 'local' | 'remote') => {
        setResolving(item.id);
        try {
            if (strategy === 'local') {
                // Force push local: Reset status to pending, update retry count (or new idempotency key?)
                // Actually, if we stick to local, we just want to retry the push, implying "Overwrite remote".
                // But if remote rejected it, we might need to fetch fresh state first?
                // For "Last Write Wins" where User explicitly chooses Local:
                // We should probably update the local entity 'updatedAt' to be NOW, and re-queue as a fresh update.

                // 1. Mark current conflict item as resolved/deleted from queue
                await db.sync_queue.delete(item.id);

                // 2. Re-trigger update logic for the entity
                // We need to fetch the entity from local DB
                const table = (db as any)[item.entity];
                const entity = await table.get(item.payload.id);

                if (entity) {
                    await localRepository[item.entity as keyof typeof localRepository].update(entity.id, {
                        ...entity,
                        updatedAt: new Date().toISOString() // Bump time to win?
                    });
                }

            } else {
                // Accept Remote:
                // 1. Delete local pending action
                await db.sync_queue.delete(item.id);
                // 2. Re-fetch from server (Sync Pull specific entity or full pull)
                // syncService.pull() would happen automatically or manually.
                // For now, we just drop our local conflicting change.
                // Ideally we should revert local DB to remote state.
                // Since we don't have remote state handy here (unless in conflictDetails), 
                // we might need to fetch.
                await fetch(`/api/sync/pull?entity=${item.entity}&id=${item.payload.id}`)
                    .then(res => res.json())
                    .then(data => {
                        // Update local DB with remote data
                        const table = (db as any)[item.entity];
                        if (data) table.put(data);
                    });
            }
        } catch (e) {
            console.error("Failed to resolve conflict", e);
        } finally {
            setResolving(null);
        }
    };

    if (!conflicts || conflicts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96 bg-white shadow-2xl rounded-lg border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Conflictos de Sincronización ({conflicts.length})</span>
                </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {conflicts.map(item => (
                    <div key={item.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm text-gray-900 capitalize">
                                {item.entity} - {item.action}
                            </h4>
                            <span className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleTimeString()}
                            </span>
                        </div>

                        <p className="text-xs text-gray-600 mb-3">
                            El servidor rechazó esta operación. Es posible que el registro haya sido modificado por otro usuario.
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => resolveConflict(item, 'local')}
                                disabled={!!resolving}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                <Check className="w-3 h-3" />
                                Mantener Mío
                            </button>
                            <button
                                onClick={() => resolveConflict(item, 'remote')}
                                disabled={!!resolving}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <X className="w-3 h-3" />
                                Usar Servidor
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper mock to avoid type errors on dynamic generic object access
// In real app, typing 'db' better is recommended.
