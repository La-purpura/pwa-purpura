"use client";

import { useEffect, useState } from "react";

type AuditLog = {
    id: string;
    action: string;
    actor: {
        name: string;
        email: string;
    };
    metadata: string;
    createdAt: string;
};

export default function HistoryTimeline({ entity, entityId }: { entity: string, entityId: string }) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/audit?entity=${entity}&entityId=${entityId}&limit=20`)
            .then(res => res.json())
            .then(data => {
                if (data.logs) {
                    setLogs(data.logs);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [entity, entityId]);

    if (loading) return <div className="text-sm text-gray-500 p-4">Cargando historial...</div>;
    if (logs.length === 0) return <div className="text-sm text-gray-400 p-4">Sin cambios registrados.</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Historial de Cambios</h3>
            <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-4 space-y-6">
                {logs.map((log) => {
                    let meta = {};
                    try { meta = JSON.parse(log.metadata); } catch (e) { }

                    // Format Metadata cleanly for UI
                    const reason = (meta as any).reason;
                    const from = (meta as any).from;
                    const to = (meta as any).to;

                    return (
                        <div key={log.id} className="relative">
                            <div className="absolute -left-[25px] top-1 size-4 bg-gray-200 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatAction(log.action)} por <span className="font-bold text-primary">{log.actor.name}</span>
                                </span>
                                {from && to && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{from}</span>
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded font-medium">{to}</span>
                                    </div>
                                )}
                                {reason && (
                                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs italic text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                        "{reason}"
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function formatAction(action: string) {
    if (action === 'PROJECT_STATUS_CHANGED') return 'Cambio de Estado';
    if (action === 'REQUEST_APPROVED') return 'Solicitud Aprobada';
    if (action === 'REQUEST_REJECTED') return 'Solicitud Rechazada';
    if (action === 'USER_CREATED') return 'Creación de Usuario';
    return action.replace(/_/g, ' ');
}
