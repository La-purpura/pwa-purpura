"use client";

import { useState } from "react";

interface Request {
    id: string;
    type: string;
    territory: string;
    responsible: string;
    initials: string;
    color: string;
    status: string;
    statusColor: string;
}

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: Request | null;
    mode: "approve" | "manage";
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onUpdateStatus: (id: string, newStatus: string) => void;
}

export function RequestModal({ isOpen, onClose, request, mode, onApprove, onReject, onUpdateStatus }: RequestModalProps) {
    const [reason, setReason] = useState("");
    const [manageAction, setManageAction] = useState<"details" | "reject" | "update">("details");

    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-[#20121d] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-xl font-bold">
                            {mode === "approve" ? "Aprobar Solicitud" : "Gestionar Solicitud"}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">{request.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Resumen de Solicitud */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold bg-${request.statusColor}-100 text-${request.statusColor}-700`}>
                                {request.status}
                            </span>
                            <span className="text-sm font-bold text-gray-500">{request.type}</span>
                        </div>
                        <p className="font-medium text-lg mb-1">{request.territory}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className={`w-5 h-5 rounded-full bg-${request.color}-100 text-${request.color}-600 flex items-center justify-center text-[10px] font-bold`}>{request.initials}</div>
                            Solicitado por <span className="font-bold text-gray-700 dark:text-gray-300">{request.responsible}</span>
                        </div>
                    </div>

                    {mode === "approve" && (
                        <div className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">¿Estás seguro que deseas aprobar esta solicitud? Se notificará al responsable inmediatamente.</p>
                            <div className="flex gap-3 pt-2">
                                <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => onApprove(request.id)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                >
                                    Confirmar Aprobación
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === "manage" && (
                        <div className="space-y-4">
                            <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <button onClick={() => setManageAction("details")} className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${manageAction === "details" ? "bg-gray-100 text-[#851c74]" : "text-gray-400 hover:text-gray-600"}`}>Detalles</button>
                                <button onClick={() => setManageAction("update")} className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${manageAction === "update" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>Estado</button>
                                <button onClick={() => setManageAction("reject")} className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${manageAction === "reject" ? "bg-red-50 text-red-600" : "text-gray-400 hover:text-gray-600"}`}>Rechazar</button>
                            </div>

                            {manageAction === "details" && (
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p><strong>Fecha:</strong> 12 Oct 2024, 14:30 hs</p>
                                    <p><strong>Prioridad:</strong> Alta</p>
                                    <p><strong>Descripción:</strong> Solicitud de recursos urgentes para operativo barrial programado para el fin de semana.</p>
                                </div>
                            )}

                            {manageAction === "reject" && (
                                <div className="space-y-3">
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Motivo del rechazo..."
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 outline-none resize-none h-24 text-sm"
                                    />
                                    <button
                                        disabled={!reason.trim()}
                                        onClick={() => onReject(request.id, reason)}
                                        className="w-full py-3 bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-red-600 transition-colors"
                                    >
                                        Rechazar Solicitud
                                    </button>
                                </div>
                            )}

                            {manageAction === "update" && (
                                <div className="space-y-2">
                                    <button onClick={() => onUpdateStatus(request.id, "En Revisión")} className="w-full p-3 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex justify-between items-center group">
                                        En Revisión <span className="material-symbols-outlined text-gray-300 group-hover:text-blue-500">search</span>
                                    </button>
                                    <button onClick={() => onUpdateStatus(request.id, "Escalada")} className="w-full p-3 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex justify-between items-center group">
                                        Escalar a Provincia <span className="material-symbols-outlined text-gray-300 group-hover:text-purple-500">upload</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
