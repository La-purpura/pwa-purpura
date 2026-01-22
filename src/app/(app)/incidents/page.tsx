"use client";

import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import Link from "next/link";

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
  createdAt: string;
  reportedBy: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
  };
}

export default function IncidentsPage() {
  const { hasPermission } = useRBAC();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/incidents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, categoryFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'CLOSED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!hasPermission("incidents:view")) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Incidencias en Territorio</h1>
          <p className="text-gray-500">Reportes georeferenciados de problemas y necesidades.</p>
        </div>
        {hasPermission("incidents:create") && (
          <Link
            href="/incidents/new"
            className="bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Nueva Incidencia
          </Link>
        )}
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-white dark:bg-[#20121d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-bold text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="RESOLVED">Resuelto</option>
            <option value="CLOSED">Cerrado</option>
          </select>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-[#20121d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
          <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Categoría</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent border-none outline-none font-bold text-sm"
          >
            <option value="">Todas las categorías</option>
            <option value="Infraestructura">Infraestructura</option>
            <option value="Seguridad">Seguridad</option>
            <option value="Salud">Salud</option>
            <option value="Social">Social</option>
            <option value="Ambiental">Ambiental</option>
          </select>
        </div>
      </div>

      {/* Lista de Incidencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#851c74]/20 border-t-[#851c74] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-400 uppercase">Cargando incidencias...</p>
            </div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            No se encontraron incidencias con los filtros seleccionados.
          </div>
        ) : (
          incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="group bg-white dark:bg-[#20121d] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${getPriorityColor(incident.priority)}`}>
                        {incident.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>
                    <h3 className="font-black text-lg leading-tight line-clamp-2 group-hover:text-[#851c74] transition-colors">
                      {incident.title}
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-colors">
                    chevron_right
                  </span>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-gray-400 text-base">category</span>
                  <span className="font-bold text-gray-600 dark:text-gray-400">{incident.category}</span>
                </div>

                {/* Location */}
                {incident.latitude && incident.longitude && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="font-mono">{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</span>
                  </div>
                )}

                {/* Reporter */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-[10px] font-bold text-[#851c74]">
                      {incident.reportedBy.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{incident.reportedBy.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
