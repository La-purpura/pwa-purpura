"use client";

import { useEffect, useState } from "react";
import { useRBAC } from "@/hooks/useRBAC";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  createdAt: string;
  author: { name: string };
}

export default function LibraryPage() {
  const { hasPermission } = useRBAC();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/resources")
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const categories = ["all", ...Array.from(new Set(resources.map(r => r.category)))];
  const filteredResources = filter === "all"
    ? resources
    : resources.filter(r => r.category === filter);

  if (loading) return <div className="p-8 text-center">Cargando biblioteca...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Biblioteca de Recursos</h1>
          <p className="text-gray-500">Manuales, protocolos y documentos estratégicos.</p>
        </div>
        {hasPermission('resources:manage') && (
          <a href="/admin/library" className="bg-[#851c74] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-all text-center">
            Gestionar Biblioteca
          </a>
        )}
      </header>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === cat
              ? 'bg-[#851c74] text-white shadow-md'
              : 'bg-white dark:bg-[#20121d] text-gray-500 border border-gray-100 dark:border-gray-800'
              }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grid de Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            No se encontraron documentos en esta categoría.
          </div>
        ) : (
          filteredResources.map(resource => (
            <div key={resource.id} className="group bg-white dark:bg-[#20121d] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all h-full flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-purple-50 dark:bg-purple-900/20 text-[#851c74] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {resource.category}
                  </span>
                  <span className="material-symbols-outlined text-gray-300 group-hover:text-[#851c74] transition-colors">description</span>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{resource.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{resource.description}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Puntaje: --</span>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-bold text-[#851c74] hover:underline"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  Abrir Documento
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
