"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequestModal } from "@/components/dashboard/RequestModal";

export default function RequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data.map((r: any) => ({
                    ...r,
                    responsible: r.submittedBy?.name || 'Usuario Móvil',
                    initials: (r.submittedBy?.name || 'UM').substring(0, 2).toUpperCase(),
                    color: "purple",
                    statusColor: r.status === 'pending' ? 'amber' : r.status === 'approved' ? 'green' : 'red',
                    territory: r.territory?.name || 'Nacional'
                })));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        const res = await fetch(`/api/requests/${id}/approve`, { method: 'POST' });
        if (res.ok) {
            fetchRequests();
            setModalOpen(false);
        }
    };

    const handleReject = async (id: string, reason: string) => {
        const res = await fetch(`/api/requests/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: reason })
        });
        if (res.ok) {
            fetchRequests();
            setModalOpen(false);
        }
    };

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-24 space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gestión de Solicitudes</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Validación y Aprobaciones</p>
                </div>
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </header>

            {loading ? (
                <div className="py-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest text-xs">Sincronizando solicitudes...</div>
            ) : requests.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                    <span className="material-symbols-outlined text-gray-200 text-6xl mb-4">fact_check</span>
                    <p className="font-black text-gray-400 uppercase tracking-widest">No hay solicitudes registradas</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <div
                            key={req.id}
                            onClick={() => { setSelectedRequest(req); setModalOpen(true); }}
                            className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-[#851c74]/20 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-xl flex items-center justify-center font-black ${req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                        req.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {req.initials}
                                </div>
                                <div>
                                    <h4 className="font-black text-sm group-hover:text-[#851c74] transition-colors uppercase tracking-tight">Solicitud de {req.type}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{req.territory} • {req.responsible}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                        req.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {req.status}
                                </span>
                                <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-all">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RequestModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                request={selectedRequest}
                mode={selectedRequest?.status === 'pending' ? "approve" : "manage"}
                onApprove={handleApprove}
                onReject={handleReject}
                onUpdateStatus={() => { }}
            />
        </main>
    );
}
