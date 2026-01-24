"use client";

import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import Link from "next/link";

interface Report {
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
    alias?: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    alias?: string;
  };
}

export default function ReportsPage() {
  const { hasPermission, user } = useRBAC();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
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

  const isAdmin = user?.role.includes('Admin') || user?.role === 'SuperAdminNacional';

  if (!hasPermission("reports:view")) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Reportes en Territorio</h1>
          <p className="text-gray-500">Gestión de problemas y necesidades detectadas.</p>
        </div>
        {hasPermission("reports:create") && (
          <Link
            href="/reports/new"
            className="bg-[#851c74] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Nuevo Reporte
          </Link>
        )}
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
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

        <div className="md:col-span-2 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
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

      {/* Lista de Reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#851c74]/20 border-t-[#851c74] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-400 uppercase">Cargando reportes...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            No se encontraron reportes con los filtros seleccionados.
          </div>
        ) : (
          reports.map((report) => (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              className="group bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl hover:border-[#851c74]/30 transition-all"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <h3 className="font-black text-lg leading-tight line-clamp-2 group-hover:text-[#851c74] transition-colors">
                      {report.title}
                    </h3>
                  </div>
                </div>

                {/* Reporter */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-[10px] font-bold text-[#851c74]">
                      {(report.reportedBy.alias || report.reportedBy.name).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {report.reportedBy.alias || report.reportedBy.name}
                      </span>
                      {isAdmin && report.reportedBy.alias && (
                        <span className="text-[9px] text-gray-400 italic">Real: {report.reportedBy.name}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(report.createdAt).toLocaleDateString()}
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
