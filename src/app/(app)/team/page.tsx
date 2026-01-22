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

type Territory = { id: string; name: string; type: string };
type Branch = { id: string; name: string };

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useRBAC();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Data for forms
  const [availableTerritories, setAvailableTerritories] = useState<Territory[]>([]);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);

  // Form State
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Militante",
    territoryId: "",
    branchId: ""
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        fetch("/api/territories"),
        fetch("/api/branches")
      ]);
      if (tRes.ok) setAvailableTerritories(await tRes.json());
      if (bRes.ok) setAvailableBranches(await bRes.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (showCreate) fetchFormOptions();
  }, [showCreate]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al crear usuario");
        return;
      }

      const data = await res.json();
      alert(`Usuario creado! Password temporal: ${data.tempPassword}`);
      setShowCreate(false);
      fetchUsers(); // Refresh list
      setNewUser({ name: "", email: "", role: "Militante", territoryId: "", branchId: "" });
    } catch (e) {
      alert("Error de conexión");
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.territory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Equipo</h1>
          <p className="text-sm text-gray-500">Gestión de usuarios y roles</p>
        </div>

        {hasPermission('users:invite') && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#851c74] hover:bg-[#6a165c] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Invitar Usuario
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#20121d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <input
          className="w-full md:w-96 pl-4 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[#851c74] outline-none transition-all"
          placeholder="Buscar por nombre, email o territorio..."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10">Cargando equipo...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-[#20121d] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-[#851c74]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#20121d] ${member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                </div>
                <span className="text-xs font-mono text-gray-400">ID: {member.id.slice(-4)}</span>
              </div>

              <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">{member.name}</h3>
              <p className="text-gray-500 text-xs mb-1">{member.email}</p>
              <p className="text-[#851c74] text-xs font-bold uppercase tracking-wide mb-4">{member.role}</p>

              <div className="space-y-2 mb-6 border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-gray-400 text-sm">location_on</span>
                  <span className="truncate">{member.territory}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-gray-400 text-sm">category</span>
                  <span className="truncate">{member.branch}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#20121d] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4">Invitar Nuevo Miembro</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Nombre Completo</label>
                <input required className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200"
                  value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Email</label>
                <input required type="email" className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200"
                  value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500">Rol</label>
                  <select required className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200"
                    value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="Militante">Militante</option>
                    <option value="Referente">Referente</option>
                    <option value="Colaborador">Colaborador</option>
                    <option value="Coordinador">Coordinador</option>
                    <option value="AdminProvincial">Admin Provincial</option>
                    <option value="AdminNacional">Admin Nacional</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Rama</label>
                  <select className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200"
                    value={newUser.branchId} onChange={e => setNewUser({ ...newUser, branchId: e.target.value })}>
                    <option value="">Ninguna</option>
                    {availableBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500">Territorio Asignado</label>
                <select className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200"
                  value={newUser.territoryId} onChange={e => setNewUser({ ...newUser, territoryId: e.target.value })}>
                  <option value="">Nacional / Sin territorio específico</option>
                  {availableTerritories.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.type === 'province' ? 'Provincia: ' : ''}{t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold text-gray-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-[#851c74] hover:bg-[#6a165c] text-white font-bold">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
