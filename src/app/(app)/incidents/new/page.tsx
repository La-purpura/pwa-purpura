"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/useRBAC";

export default function NewIncidentPage() {
  const router = useRouter();
  const { hasPermission } = useRBAC();
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Infraestructura");
  const [priority, setPriority] = useState("MEDIUM");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const getLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setGettingLocation(false);

          // Reverse geocoding (opcional, requiere API externa)
          setAddress(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener la ubicación. Verifica los permisos.");
          setGettingLocation(false);
        }
      );
    } else {
      alert("Geolocalización no disponible en este dispositivo");
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          latitude,
          longitude,
          address,
          photoUrl
        })
      });

      if (res.ok) {
        router.push("/incidents");
      } else {
        const error = await res.json();
        alert(error.error || "Error al crear incidencia");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission("incidents:create")) {
    return <div className="p-8 text-center text-red-500 font-bold">Acceso Denegado</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2">Reportar Incidencia</h1>
        <p className="text-gray-500">Documenta problemas en territorio con geolocalización automática.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
          <label className="block text-xs font-black uppercase text-gray-400 mb-2">Título de la Incidencia *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Luminaria rota en Av. Libertador"
            className="w-full bg-transparent border-none outline-none text-lg font-bold"
          />
        </div>

        {/* Categoría y Prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold"
            >
              <option value="Infraestructura">Infraestructura</option>
              <option value="Seguridad">Seguridad</option>
              <option value="Salud">Salud</option>
              <option value="Social">Social</option>
              <option value="Ambiental">Ambiental</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-black uppercase text-gray-400 mb-2">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold"
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
          <label className="block text-xs font-black uppercase text-gray-400 mb-2">Descripción Detallada</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el problema con el mayor detalle posible..."
            className="w-full bg-transparent border-none outline-none h-32 resize-none"
          />
        </div>

        {/* Geolocalización */}
        <div className="bg-gradient-to-br from-[#851c74] to-purple-600 p-6 rounded-3xl text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-black text-lg mb-1">Ubicación GPS</h3>
              <p className="text-sm opacity-90">
                {latitude && longitude ? "✓ Ubicación capturada" : "Presiona el botón para obtener tu ubicación"}
              </p>
            </div>
            <button
              type="button"
              onClick={getLocation}
              disabled={gettingLocation}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              {gettingLocation ? "Obteniendo..." : "Obtener GPS"}
            </button>
          </div>

          {latitude && longitude && (
            <div className="bg-black/20 p-4 rounded-2xl space-y-2">
              <p className="text-xs font-mono">Lat: {latitude.toFixed(6)}</p>
              <p className="text-xs font-mono">Lng: {longitude.toFixed(6)}</p>
              {address && <p className="text-xs opacity-80">{address}</p>}
            </div>
          )}
        </div>

        {/* Foto (opcional) */}
        <div className="bg-white dark:bg-[#20121d] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
          <label className="block text-xs font-black uppercase text-gray-400 mb-2">URL de Foto (opcional)</label>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://ejemplo.com/foto.jpg"
            className="w-full bg-transparent border-none outline-none"
          />
          <p className="text-xs text-gray-400 mt-2">Puedes subir la foto a un servicio externo y pegar el enlace aquí.</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !title || !category}
          className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-3xl font-black text-lg shadow-2xl disabled:opacity-50 active:scale-[0.98] transition-all"
        >
          {submitting ? "Enviando Reporte..." : "Reportar Incidencia"}
        </button>
      </form>
    </div>
  );
}
