"use client";

import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/useRBAC";
import { ROLE_LABELS, Role } from "@/lib/rbac";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  territory: string;
  territoryId: string;
  branch: string;
  branchId: string;
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

  // Estado para Edición
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [territories, setTerritories] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, iRes, rRes, bRes, tRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/invites"),
        fetch("/api/roles"),
        fetch("/api/branches"),
        fetch("/api/territories")
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (iRes.ok) setInvitations(await iRes.json());
      if (rRes.ok) setRoles(await rRes.json());
      if (bRes.ok) setBranches(await bRes.json());
      if (tRes.ok) setTerritories(await tRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevokeInvite = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas revocar esta invitación?")) return;
    try {
      const res = await fetch(`/api/invites/${id}/revoke`, { method: "POST" });
      if (res.ok) {
        setInvitations(invitations.map(i => i.id === id ? { ...i, revokedAt: new Date().toISOString() } : i));
      } else {
        const data = await res.json();
        alert(data.error || "Error al revocar");
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const handleRevokeUser = async (id: string) => {
    if (!confirm("¿ESTÁS SEGURO? Esto cortará el acceso inmediatamente e invalidará todas sus sesiones activas.")) return;
    try {
      const res = await fetch(`/api/users/${id}/revoke`, { method: "POST" });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: 'REVOKED' } : u));
        alert("Acceso revocado");
      } else {
        const data = await res.json();
        alert(data.error || "Error al revocar");
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const handleEnableUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/enable`, { method: "POST" });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: 'ACTIVE' } : u));
        alert("Acceso habilitado");
      }
    } catch (e) { alert("Error de conexión"); }
  };

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editingUser.role,
          branchId: editingUser.branchId || null,
          territoryId: editingUser.territoryId || null,
          name: editingUser.name
        })
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchData();
        alert("Permisos actualizados correctamente");
      } else {
        const data = await res.json();
        alert(data.error || "Error al actualizar");
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
            placeholder="Buscar por nombre o email..."
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
                <div key={member.id} className={`bg-white dark:bg-[#20121d] rounded-2xl p-5 shadow-sm border ${member.status === 'REVOKED' ? 'opacity-60 grayscale' : 'border-gray-100 dark:border-gray-800'} transition-all`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm text-[#851c74] font-bold text-xl uppercase">
                        {member.name?.charAt(0) || member.email?.charAt(0)}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#20121d] ${member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    {member.status === 'REVOKED' && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">REVOCADO</span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">{member.name || "Sin nombre"}</h3>
                  <p className="text-gray-500 text-xs mb-1 truncate">{member.email}</p>
                  <p className="text-[#851c74] text-xs font-bold uppercase tracking-wide mb-4">
                    {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS] || member.role}
                  </p>

                  <div className="space-y-2 mb-4 border-t border-gray-50 dark:border-gray-800 pt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                      <span className="truncate">{member.territory || "T. Nacional"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="material-symbols-outlined text-gray-400 text-sm">account_tree</span>
                      <span className="truncate">{member.branch || "Sin Rama"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                    {hasPermission('users:edit') && member.status === 'ACTIVE' && (
                      <>
                        <button
                          onClick={() => { setEditingUser(member); setIsEditModalOpen(true); }}
                          className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Editar
                        </button>
                        <button
                          onClick={() => handleRevokeUser(member.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                          title="Revocar Acceso"
                        >
                          <span className="material-symbols-outlined text-sm">block</span>
                        </button>
                      </>
                    )}
                    {hasPermission('users:edit') && member.status === 'REVOKED' && (
                      <button
                        onClick={() => handleEnableUser(member.id)}
                        className="w-full bg-green-50 dark:bg-green-900/10 text-green-600 p-2 rounded-xl text-xs font-bold"
                      >
                        Habilitar Acceso
                      </button>
                    )}
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
                  <p className="text-[#851c74] text-xs font-bold uppercase tracking-wide mb-6">
                    {ROLE_LABELS[invite.role as keyof typeof ROLE_LABELS] || invite.role}
                  </p>

                  <div className="flex flex-col gap-2">
                    {!invite.revokedAt && !invite.usedAt && (
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 text-red-600 dark:text-red-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Revocar Enlace
                      </button>
                    )}
                    {invite.revokedAt && (
                      <span className="text-[10px] text-red-500 font-bold uppercase text-center py-2 bg-red-50 dark:bg-red-100/10 rounded-xl">
                        Revocada
                      </span>
                    )}
                    {invite.usedAt && (
                      <span className="text-[10px] text-green-500 font-bold uppercase text-center py-2 bg-green-50 dark:bg-green-100/10 rounded-xl">
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

      {/* Modal de Edición de Permisos/Perfil */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <form onSubmit={handleUpdatePermissions} className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-1">Editar Perfil Operativo</h2>
            <p className="text-gray-500 text-sm mb-8">{editingUser.email}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rol en el Sistema</label>
                <select
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  {roles.map(r => (
                    <option key={r.code} value={r.code}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Rama</label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                    value={editingUser.branchId || ""}
                    onChange={e => setEditingUser({ ...editingUser, branchId: e.target.value })}
                  >
                    <option value="">Sin Rama / Nacional</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Territorio</label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 ring-[#851c74]"
                    value={editingUser.territoryId || ""}
                    onChange={e => setEditingUser({ ...editingUser, territoryId: e.target.value })}
                  >
                    <option value="">Nacional</option>
                    {territories.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 p-4 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 p-4 rounded-2xl font-bold bg-[#851c74] text-white shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
