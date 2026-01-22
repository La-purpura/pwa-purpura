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
        email: string;
        role: string;
    };
    assignedTo?: {
        name: string;
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
    const { hasPermission } = useRBAC();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#851c74]/20 border-t-[#851c74] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold">Cargando incidencia...</p>
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
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white ${getPriorityColor(incident.priority)}`}>
                            {incident.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white ${getStatusColor(incident.status)}`}>
                            {incident.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-black mb-2">{incident.title}</h1>
                    <p className="text-gray-500 text-sm">
                        Reportado por <span className="font-bold">{incident.reportedBy.name}</span> el {new Date(incident.createdAt).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Principal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Descripción */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-black mb-4">Descripción</h2>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {incident.description || "Sin descripción detallada."}
                        </p>
                    </div>

                    {/* Mapa */}
                    {incident.latitude && incident.longitude && (
                        <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#851c74]">location_on</span>
                                Ubicación
                            </h2>
                            <div className="space-y-4">
                                {/* Mapa estático (Google Maps Static API) */}
                                <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                                    <img
                                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${incident.latitude},${incident.longitude}&zoom=15&size=600x300&markers=color:red%7C${incident.latitude},${incident.longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`}
                                        alt="Mapa de ubicación"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Fallback si no hay API key
                                            e.currentTarget.src = `https://via.placeholder.com/600x300/851c74/ffffff?text=Mapa+no+disponible`;
                                        }}
                                    />
                                    <a
                                        href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        Abrir en Maps
                                    </a>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <p className="text-xs font-black uppercase text-gray-400 mb-1">Latitud</p>
                                        <p className="font-mono font-bold">{incident.latitude.toFixed(6)}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                        <p className="text-xs font-black uppercase text-gray-400 mb-1">Longitud</p>
                                        <p className="font-mono font-bold">{incident.longitude.toFixed(6)}</p>
                                    </div>
                                </div>
                                {incident.address && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">place</span>
                                        {incident.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Foto */}
                    {incident.photoUrl && (
                        <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-black mb-4">Evidencia Fotográfica</h2>
                            <img
                                src={incident.photoUrl}
                                alt="Evidencia"
                                className="w-full rounded-2xl"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://via.placeholder.com/800x400/cccccc/666666?text=Imagen+no+disponible';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Columna Lateral */}
                <div className="space-y-6">
                    {/* Acciones */}
                    {hasPermission('incidents:manage') && (
                        <div className="bg-gradient-to-br from-[#851c74] to-purple-600 p-6 rounded-3xl text-white">
                            <h2 className="text-lg font-black mb-4">Acciones</h2>
                            <div className="space-y-2">
                                {incident.status === 'PENDING' && (
                                    <button
                                        onClick={() => updateStatus('IN_PROGRESS')}
                                        disabled={updating}
                                        className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
                                    >
                                        Marcar En Progreso
                                    </button>
                                )}
                                {incident.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => updateStatus('RESOLVED')}
                                        disabled={updating}
                                        className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
                                    >
                                        Marcar Resuelto
                                    </button>
                                )}
                                {incident.status === 'RESOLVED' && (
                                    <button
                                        onClick={() => updateStatus('CLOSED')}
                                        disabled={updating}
                                        className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
                                    >
                                        Cerrar Incidencia
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Información */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
                        <h2 className="text-lg font-black">Información</h2>

                        <div>
                            <p className="text-xs font-black uppercase text-gray-400 mb-1">Categoría</p>
                            <p className="font-bold">{incident.category}</p>
                        </div>

                        {incident.territory && (
                            <div>
                                <p className="text-xs font-black uppercase text-gray-400 mb-1">Territorio</p>
                                <p className="font-bold">{incident.territory.name}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs font-black uppercase text-gray-400 mb-1">Reportado por</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs font-bold text-[#851c74]">
                                    {incident.reportedBy.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{incident.reportedBy.name}</p>
                                    <p className="text-xs text-gray-400">{incident.reportedBy.role}</p>
                                </div>
                            </div>
                        </div>

                        {incident.assignedTo && (
                            <div>
                                <p className="text-xs font-black uppercase text-gray-400 mb-1">Asignado a</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600">
                                        {incident.assignedTo.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{incident.assignedTo.name}</p>
                                        <p className="text-xs text-gray-400">{incident.assignedTo.role}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-black mb-4">Timeline</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>
                                </div>
                                <div className="pb-4">
                                    <p className="font-bold text-sm">Incidencia creada</p>
                                    <p className="text-xs text-gray-400">{new Date(incident.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {incident.status !== 'PENDING' && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        {incident.status !== 'IN_PROGRESS' && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>}
                                    </div>
                                    <div className="pb-4">
                                        <p className="font-bold text-sm">En progreso</p>
                                        <p className="text-xs text-gray-400">{new Date(incident.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}

                            {incident.resolvedAt && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Resuelta</p>
                                        <p className="text-xs text-gray-400">{new Date(incident.resolvedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}