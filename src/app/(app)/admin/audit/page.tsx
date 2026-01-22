"use client";

import { useEffect, useState } from "react";
import { useRBAC } from "@/hooks/useRBAC";

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    timestamp: string; // Keep as timestamp in UI if preferred, but map it from createdAt
    createdAt: string;
    metadata: string;
    actor: {
        name: string;
        email: string;
        role: string;
    };
}

export default function AdminAuditPage() {
    const { hasPermission } = useRBAC();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ pages: 1, total: 0 });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Filters
    const [actionFilter, setActionFilter] = useState("");
    const [entityFilter, setEntityFilter] = useState("");

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                action: actionFilter,
                entity: entityFilter
            });
            const res = await fetch(`/api/admin/audit?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, entityFilter]);

    const exportLogs = () => {
        const headers = ["Timestamp", "Actor", "Acción", "Entidad", "ID Entidad", "Metadata"];
        const csvContent = logs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.actor.name,
            log.action,
            log.entity,
            log.entityId,
            log.metadata?.replace(/"/g, '""') || ""
        ].map(val => `"${val}"`).join(",")).join("\n");

        const blob = new Blob([headers.join(",") + "\n" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!hasPermission("audit:view")) return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;

    const getActionColor = (action: string) => {
        if (action.includes("DELETE") || action.includes("REJECT") || action.includes("REVOKE")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        if (action.includes("CREATE") || action.includes("PUBLISH") || action.includes("UPLOAD") || action.includes("SUCCESS")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        if (action.includes("UPDATE") || action.includes("EDIT")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Auditoría de Sistema</h1>
                    <p className="text-gray-500 font-medium text-sm">Historial completo de acciones y trazabilidad de seguridad para cumplimiento organizacional.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchLogs()}
                        className="p-3 bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-gray-500 leading-none">refresh</span>
                    </button>
                    <button
                        onClick={exportLogs}
                        className="bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm leading-none">download</span>
                        Exportar CSV
                    </button>
                </div>
            </header>

            {/* Filtros Críticos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-[#20121d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400">search</span>
                    <input
                        placeholder="Filtrar logs por acción o entidad..."
                        className="bg-transparent border-none outline-none text-sm w-full font-medium"
                    />
                </div>
                <div className="bg-white dark:bg-[#20121d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Entidad</label>
                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-bold text-xs"
                    >
                        <option value="">Todas</option>
                        <option value="User">Usuarios</option>
                        <option value="Post">Comunicados</option>
                        <option value="Resource">Biblioteca</option>
                    </select>
                </div>
                <div className="bg-[#851c74] p-4 rounded-2xl text-white shadow-lg shadow-purple-900/20">
                    <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Impacto total</p>
                    <p className="text-2xl font-black leading-none">{pagination.total}</p>
                </div>
            </div>

            {/* Visualización de Logs */}
            <div className="bg-white dark:bg-[#20121d] rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-[10px] uppercase font-black tracking-widest text-gray-400 px-6">
                            <tr>
                                <th className="pl-8 pr-4 py-5 font-black">Registro Temporal</th>
                                <th className="px-6 py-5 font-black">Operador</th>
                                <th className="px-6 py-5 font-black">Acción Ejecutada</th>
                                <th className="px-6 py-5 font-black">Objetivo</th>
                                <th className="pl-4 pr-8 py-5 text-right font-black">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-[#851c74]/20 border-t-[#851c74] rounded-full animate-spin"></div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sincronizando Auditoría...</p>
                                    </div>
                                </td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-24 text-center text-gray-400 italic font-medium">No hay registros para mostrar.</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group">
                                    <td className="pl-8 pr-4 py-5 text-xs tabular-nums text-gray-400 font-medium">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-[#851c74] font-black text-xs">
                                                {log.actor.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 dark:text-gray-100 leading-tight">{log.actor.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{log.actor.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-gray-800 dark:text-gray-200 text-xs mb-0.5">{log.entity}</p>
                                        <p className="text-[9px] text-gray-400 font-mono tracking-tighter">ID: {log.entityId.substring(0, 12)}</p>
                                    </td>
                                    <td className="pl-4 pr-8 py-5 text-right">
                                        <button
                                            onClick={() => setSelectedLog(log)}
                                            className="p-2.5 text-gray-400 hover:text-[#851c74] hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all active:scale-90"
                                        >
                                            <span className="material-symbols-outlined text-sm leading-none">open_in_new</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visualizando {logs.length} de {pagination.total} registros</p>
                    <div className="flex gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                        </button>
                        <div className="hidden sm:flex items-center px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-black">
                            {page} / {pagination.pages}
                        </div>
                        <button
                            disabled={page === pagination.pages}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Detalle */}
            {selectedLog && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-[#171216] w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block ${getActionColor(selectedLog.action)}`}>
                                    {selectedLog.action}
                                    /</span>
                                <h2 className="text-2xl font-black leading-tight">Detalle de Actividad</h2>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:rotate-90 transition-all duration-300">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operador Logueado</p>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-full bg-[#851c74] text-white flex items-center justify-center text-xs font-bold">{selectedLog.actor.name.substring(0, 2)}</div>
                                        <div>
                                            <p className="text-sm font-black">{selectedLog.actor.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{selectedLog.actor.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</p>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <p className="text-sm font-black tabular-nums">{new Date(selectedLog.createdAt).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'medium' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Metadatos de la Operación</p>
                                <div className="p-6 bg-[#0a0509] rounded-3xl overflow-hidden border border-purple-500/10 shadow-inner">
                                    <pre className="text-xs text-purple-300 overflow-x-auto custom-scrollbar font-mono leading-relaxed">
                                        {JSON.stringify(JSON.parse(selectedLog.metadata || "{}"), null, 4)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 dark:bg-gray-800/20 flex gap-3">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="flex-1 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
