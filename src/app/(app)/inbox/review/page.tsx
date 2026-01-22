"use client";

import { useState, useEffect } from "react";
import { RequestModal } from "@/components/dashboard/RequestModal";
import { useRBAC } from "@/hooks/useRBAC";

export default function InboxReviewPage() {
    const { hasPermission } = useRBAC();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"approve" | "manage">("approve");

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/requests");
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/requests/${id}/approve`, { method: "POST" });
            if (res.ok) {
                setModalOpen(false);
                fetchRequests();
            }
        } catch (error) {
            alert("Error al aprobar");
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            const res = await fetch(`/api/requests/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feedback: reason }),
            });
            if (res.ok) {
                setModalOpen(false);
                fetchRequests();
            }
        } catch (error) {
            alert("Error al rechazar");
        }
    };

    if (!hasPermission("forms:review")) return <div className="p-8 text-center">No tienes permiso</div>;

    return (
        <div className="max-w-[1200px] mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold">Bandeja de Revisión</h1>

            <div className="bg-white dark:bg-[#20121d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Territorio</th>
                            <th className="px-6 py-4">Solicitante</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">Cargando...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay solicitudes pendientes</td></tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 font-bold">{req.type}</td>
                                <td className="px-6 py-4">{req.territory?.name || "Global"}</td>
                                <td className="px-6 py-4">{req.submittedBy.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedRequest({
                                                ...req,
                                                responsible: req.submittedBy.name,
                                                initials: req.submittedBy.name.substring(0, 2).toUpperCase(),
                                                color: 'purple',
                                                statusColor: req.status === 'pending' ? 'yellow' : 'green',
                                                territory: req.territory?.name || "Global"
                                            });
                                            setModalMode("approve");
                                            setModalOpen(true);
                                        }}
                                        className="text-[#851c74] font-bold"
                                    >
                                        Revisar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <RequestModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                request={selectedRequest}
                mode={modalMode}
                onApprove={handleApprove}
                onReject={handleReject}
                onUpdateStatus={() => { }}
            />
        </div>
    );
}
