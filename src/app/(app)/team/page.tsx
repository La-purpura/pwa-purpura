"use client";

import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/useRBAC";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  territory: string;
  branch: string;
  status: string;
  avatar: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"members" | "pending">("members");
  const { hasPermission } = useRBAC();
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, iRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/invites")
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (iRes.ok) setInvitations(await iRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas revocar esta invitación?")) return;
    try {
      const res = await fetch(`/api/invites/${id}/revoke`, { method: "POST" });
      if (res.ok) {
        setInvitations(invitations.map(i => i.id === id ? { ...i, revokedAt: new Date().toISOString() } : i));
        alert("Invitación revocada");
      } else {
        const data = await res.json();
        alert(data.error || "Error al revocar");
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvites = invitations.filter(i =>
    i.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Equipo</h1>
          <p className="text-sm text-gray-500">Gestión de usuarios e invitaciones</p>
        </div>

        {hasPermission('users:invite') && (
          <a
            href="/team/invite"
            className="bg-[#851c74] hover:bg-[#6a165c] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Crear Nueva Invitación
          </a>
        )}
      </div>

      {/* Tabs y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white dark:bg-[#20121d] p-1 rounded-xl border border-gray-100 dark:border-gray-800 w-full md:w-auto">
          <button
            onClick={() => setTab("members")}
            className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "members" ? "bg-[#851c74] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            Miembros ({users.length})
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "pending" ? "bg-[#851c74] text-white shadow-md" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            Pendientes ({invitations.length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#20121d] border border-gray-100 dark:border-gray-800 text-sm focus:ring-2 focus:ring-[#851c74] outline-none transition-all"
            placeholder="Buscar..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#851c74]"></div>
          <p className="text-gray-500 font-medium">Cargando información del equipo...</p>
        </div>
      ) : (
        <>
          {tab === "members" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map((member) => (
                <div key={member.id} className="bg-white dark:bg-[#20121d] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-[#851c74]/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm text-[#851c74] font-bold text-xl uppercase">
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#20121d] ${member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">ID: {member.id.slice(-4)}</span>
                  </div>

                  <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">{member.name || "Sin nombre"}</h3>
                  <p className="text-gray-500 text-xs mb-1 truncate">{member.email}</p>
                  <p className="text-[#851c74] text-xs font-bold uppercase tracking-wide mb-4">{member.role}</p>

                  <div className="space-y-2 mb-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                      <span className="truncate">{member.territory || "No asignado"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "pending" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredInvites.length > 0 ? filteredInvites.map((invite) => (
                <div key={invite.id} className="bg-white dark:bg-[#20121d] rounded-2xl p-5 shadow-sm border border-orange-100 dark:border-orange-900/30 border-l-4 border-l-orange-400 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-800">
                      Pendiente
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Expira: {new Date(invite.expiresAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-800 dark:text-white text-base truncate mb-1">{invite.email}</h3>
                  <p className="text-[#851c74] text-xs font-bold uppercase tracking-wide mb-6">{invite.role}</p>

                  <div className="flex flex-col gap-2">
                    {!invite.revokedAt && !invite.usedAt && (
                      <button
                        onClick={() => handleRevoke(invite.id)}
                        className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 text-red-600 dark:text-red-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Revocar invitación"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Revocar Enlace
                      </button>
                    )}
                    {invite.revokedAt && (
                      <span className="text-[10px] text-red-500 font-bold uppercase text-center py-2 bg-red-50 dark:bg-red-900/10 rounded-xl">
                        Revocada
                      </span>
                    )}
                    {invite.usedAt && (
                      <span className="text-[10px] text-green-500 font-bold uppercase text-center py-2 bg-green-50 dark:bg-green-900/10 rounded-xl">
                        Utilizada
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500">No hay invitaciones pendientes.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
