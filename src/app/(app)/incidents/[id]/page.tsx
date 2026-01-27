"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";

interface Incident {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    photoUrl: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    reportedBy: {
        name: string;
        alias?: string;
        email: string;
        role: string;
    };
    assignedTo?: {
        name: string;
        alias?: string;
        email: string;
        role: string;
    };
    territory?: {
        name: string;
    };
}

export default function IncidentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { hasPermission, user } = useRBAC();
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchIncident = async () => {
        try {
            const res = await fetch(`/api/incidents/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setIncident(data);
            } else {
                router.push('/incidents');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchIncident();
        }
    }, [params.id]);

    const updateStatus = async (newStatus: string) => {
        if (!incident) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/incidents/${incident.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchIncident();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-500';
            case 'HIGH': return 'bg-orange-500';
            case 'MEDIUM': return 'bg-yellow-500';
            case 'LOW': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-gray-500';
            case 'IN_PROGRESS': return 'bg-blue-500';
            case 'RESOLVED': return 'bg-green-500';
            case 'CLOSED': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const isAdmin = user?.role.includes('Admin') || user?.role === 'SuperAdminNacional';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#851c74]/20 border-t-[#851c74] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Cargando reporte...</p>
                </div>
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 font-bold">Incidencia no encontrada</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${getPriorityColor(incident.priority)}`}>
                            {incident.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${getStatusColor(incident.status)}`}>
                            {incident.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black mb-2">{incident.title}</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[10px] font-bold text-[#851c74]">
                            {(incident.reportedBy.alias || incident.reportedBy.name).substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-gray-500 text-sm">
                            Reportado por <span className="font-bold">{incident.reportedBy.alias || incident.reportedBy.name}</span>
                            {isAdmin && incident.reportedBy.alias && <span className="text-xs italic ml-1">(Real: {incident.reportedBy.name})</span>}
                            • {new Date(incident.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Descripción */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-black mb-4">Descripción de la Incidencia</h2>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                            {incident.description || "Sin descripción detallada."}
                        </p>
                    </div>

                    {/* Foto */}
                    {incident.photoUrl && (
                        <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black mb-4">Evidencia Fotográfica</h2>
                            <img
                                src={incident.photoUrl}
                                alt="Evidencia"
                                className="w-full rounded-2xl shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Mapa Simulado/Info Geolocalización */}
                    {incident.latitude && incident.longitude && (
                        <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">location_on</span>
                                Geolocalización
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">place</span>
                                        {incident.address || "Dirección no especificada"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Coordenadas</p>
                                    <p className="font-mono text-xs">{incident.latitude}, {incident.longitude}</p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-[#851c74] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-sm">map</span>
                                    Abrir Mapa Externo
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna Lateral */}
                <div className="space-y-6">
                    {/* Acciones de Gestión */}
                    {hasPermission('reports:manage') && (
                        <div className="bg-[#851c74] p-8 rounded-[2.5rem] text-white shadow-xl">
                            <h2 className="text-lg font-black mb-4">Gestión Operativa</h2>
                            <div className="space-y-3">
                                {incident.status === 'PENDING' && (
                                    <button
                                        onClick={() => updateStatus('IN_PROGRESS')}
                                        disabled={updating}
                                        className="w-full bg-white text-[#851c74] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-white/90 transition-all shadow-md"
                                    >
                                        Iniciar Resolución
                                    </button>
                                )}
                                {incident.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => updateStatus('RESOLVED')}
                                        disabled={updating}
                                        className="w-full bg-white text-green-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-white/90 transition-all shadow-md"
                                    >
                                        Marcar como Resuelto
                                    </button>
                                )}
                                {(incident.status === 'RESOLVED' || incident.status === 'IN_PROGRESS') && (
                                    <button
                                        onClick={() => updateStatus('CLOSED')}
                                        disabled={updating}
                                        className="w-full bg-black/20 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 hover:bg-black/30 transition-all"
                                    >
                                        Cerrar Expediente
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ficha Técnica */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <h2 className="text-lg font-black">Detalles</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Categoría</p>
                                <p className="font-bold text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg inline-block">{incident.category}</p>
                            </div>

                            {incident.territory && (
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Territorio</p>
                                    <p className="font-bold text-sm">{incident.territory.name}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Involucrados</p>
                                <div className="space-y-3 mt-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-[10px] font-bold text-[#851c74]">
                                            {(incident.reportedBy.alias || incident.reportedBy.name).substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[11px] leading-none mb-1">{incident.reportedBy.alias || incident.reportedBy.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">{incident.reportedBy.role}</p>
                                        </div>
                                    </div>

                                    {incident.assignedTo && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                {(incident.assignedTo.alias || incident.assignedTo.name).substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[11px] leading-none mb-1">{incident.assignedTo.alias || incident.assignedTo.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">{incident.assignedTo.role}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registro Histórico (Timeline) */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-black mb-6">Auditoría</h2>
                        <div className="space-y-6">
                            <AuditItem label="Incidencia Generada" date={incident.createdAt} icon="add_circle" active />
                            {incident.status !== 'PENDING' && (
                                <AuditItem label="Actualización" date={incident.updatedAt} icon="update" active />
                            )}
                            {incident.resolvedAt && (
                                <AuditItem label="Resolución Finalizada" date={incident.resolvedAt} icon="verified" active color="text-green-500" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AuditItem({ label, date, icon, active, color }: any) {
    return (
        <div className="flex gap-4">
            <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-sm">{icon}</span>
            </div>
            <div>
                <p className="text-xs font-bold leading-tight">{label}</p>
                <p className="text-[10px] text-gray-400">{new Date(date).toLocaleString()}</p>
            </div>
        </div>
    );
}