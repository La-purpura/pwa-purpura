"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

// Mock Data for Referentes with specific territory mapping
const MOCK_TEAM_MEMBERS = [
  { id: 1, name: "Mateo Ramirez", role: "Coordinador Seccional", section: "Sección Capital", district: "La Plata", status: "online", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsex1fjy_qWkj-evRxe55n0I7aGu936O8VTe44Hjcc-J5kV75TC7bvERqTGYd3RX86pZyyXiatcmoWqvAaiU7a7OiX83xF3uPrRh6nM8BQQBggwEKVzQIw2iJYpWyonPdk3-6EWA4GivgkO0p1YwrNRXjTE1iElv33u4Nez-K1cjA7LM0_OmMTO9N_EJ6tCScIg40xvpuH6w-S14n_x5NT8Wm99R_GqRpxVDpOyq5vHH6-V9TgryI8MwTmQGsT4uG7Sh3wIaJGJO8" },
  { id: 2, name: "Sofia Lopez", role: "Referente Distrital", section: "Sección Primera", district: "San Isidro", status: "away", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-u_qMSm1CEjTsTH9AP2GM9LTCd1VXC260s8sVwEdb4lIMAkETZYxJQMT4lxxRTKc9Kh_gDs2XK4XHjag09SPfOQtReSdM-iy53a5ayBrr9udxINJSod-Dgo075EsSs2PgvmUJzoWl2ipcKZSalt3SG46i71IyHs1-6LAHOakiB_xjL6jb35D5mMED5YYXC6Fma7D7f4zjkPlynQwJusDjXrEfbfPJP87Qr3nNinSLuT0s6GQGGF4105ReHet0Oej_eQ0JSQKTvpc" },
  { id: 3, name: "Elena Cruz", role: "Voluntaria", section: "Sección Tercera", district: "Quilmes", status: "online", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD90BEcUyCU-Wdws1K-wbCaH9ZqgmlzVoTJzD7s33dZ75m0OUzbCNLCVV2c9TTa38QzokoZHc96GQ4oi6aqZgB6C3D3YdvWpFCSY8Ub_WVaHDUukboJmD33G-jEkCUWzTupreuO_5cFzTEsSHryeZSBANXXKCKl1VnOA9dJ5Ux4-GHU6Cjj4CB6sWdiEjYqJwOwsU-PdTQJxUiV0HMaWQ4-lOucTB8O5d5BwwacErz_uhRWtB1qcQsGjofYXrfl4FwcBf-0q_F2hTk" },
  { id: 4, name: "Lucas Mendez", role: "Referente Distrital", section: "Sección Capital", district: "La Plata", status: "offline", avatar: "https://i.pravatar.cc/150?u=lucas" },
  { id: 5, name: "Ana Torres", role: "Coordinador Seccional", section: "Sección Primera", district: "Vicente López", status: "online", avatar: "https://i.pravatar.cc/150?u=ana" },
  { id: 6, name: "Carlos Ruiz", role: "Voluntario", section: "Sección Tercera", district: "Avellaneda", status: "busy", avatar: "https://i.pravatar.cc/150?u=carlos" },
];

export default function TeamPage() {
  const territoryFilter = useAppStore((state) => state.territoryFilter);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Filter Logic: Global Territory + Local Search + Local Role Filter
  const filteredMembers = MOCK_TEAM_MEMBERS.filter(m => {
    // 1. Global Filter (Store)
    const matchSection = territoryFilter.section ? m.section === territoryFilter.section : true;
    const matchDistrict = territoryFilter.district ? m.district === territoryFilter.district : true;

    // 2. Local Search
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.district.toLowerCase().includes(search.toLowerCase());

    // 3. Role Filter
    const matchRole = roleFilter === 'all'
      ? true
      : roleFilter === 'coordinador'
        ? m.role.includes("Coordinador")
        : !m.role.includes("Coordinador");

    return matchSection && matchDistrict && matchSearch && matchRole;
  });

  const activeFiltersLabel = territoryFilter.section
    ? `${territoryFilter.section}${territoryFilter.district ? ` > ${territoryFilter.district}` : ""}`
    : "Toda la Provincia";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Equipo de Referentes</h1>
          <p className="text-sm text-[#851c74] font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">filter_alt</span>
            Filtrando por: {activeFiltersLabel}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/team/invite" className="bg-[#851c74] hover:bg-[#6a165c] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">person_add</span>
            Nuevo Miembro
          </Link>
        </div>
      </div>

      {/* Local Controls */}
      <div className="bg-white dark:bg-[#20121d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <input
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm focus:ring-2 focus:ring-[#851c74] outline-none transition-all"
            placeholder="Buscar por nombre o distrito..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          {['all', 'coordinador', 'field'].map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${roleFilter === f
                  ? 'bg-[#851c74]/10 text-[#851c74] border border-[#851c74]/20'
                  : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                }`}
            >
              {f === 'all' ? 'Todos' : f === 'coordinador' ? 'Coordinadores' : 'Operativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-[#20121d] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 group hover:border-[#851c74]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                  />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#20121d] ${member.status === 'online' ? 'bg-green-500' :
                      member.status === 'busy' ? 'bg-red-500' :
                        member.status === 'away' ? 'bg-orange-500' : 'bg-gray-400'
                    }`}></span>
                </div>
                <button className="text-gray-400 hover:text-[#851c74] transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>

              <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate">{member.name}</h3>
              <p className="text-[#851c74] text-xs font-bold uppercase tracking-wide mb-4">{member.role}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-gray-400 text-lg">location_on</span>
                  <span className="truncate">{member.district}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="material-symbols-outlined text-gray-400 text-lg">map</span>
                  <span className="truncate">{member.section}</span>
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                <button className="flex-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-xs font-bold transition-colors">
                  Perfil
                </button>
                <button className="flex-1 bg-[#851c74] hover:bg-[#6a165c] text-white py-2 rounded-lg text-xs font-bold transition-colors shadow-md shadow-purple-900/10">
                  Mensaje
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#20121d] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <span className="material-symbols-outlined text-3xl">group_off</span>
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white">No se encontraron referentes</h3>
          <p className="text-gray-500 text-sm mt-1">Prueba cambiando el filtro de territorio o los términos de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
