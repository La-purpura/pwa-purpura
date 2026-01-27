"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/lib/store";

export default function UserNewPage() {
  const router = useRouter();
  const addUser = useAppStore((state) => state.addUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [territory, setTerritory] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [availableTerritories, setAvailableTerritories] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    fetch('/api/territories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableTerritories(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = () => {
    const safeName = name.trim();
    const safeEmail = email.trim();
    if (!safeName || !safeEmail || !role) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    // Map basic UI roles to system RBAC roles
    let systemRole: any = role;
    if (role === "Administrador") systemRole = "AdminNacional";
    if (role === "Supervisor") systemRole = "Coordinador";
    if (role === "Operador") systemRole = "Colaborador";
    if (role === "Militante") systemRole = "Militante";

    const selectedTerritoryName = availableTerritories.find(t => t.id === territory)?.name || "Nacional";

    // Optimistic UI update
    addUser({
      id: crypto.randomUUID(),
      name: safeName,
      email: safeEmail,
      role: systemRole, // Use valid Role type
      status: 'ACTIVE',
      territory: selectedTerritoryName,
      // @ts-ignore: Optimistic update simplified
      branch: "General",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random`
    });

    void fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: safeName,
        email: safeEmail,
        role: systemRole,
        territoryId: territory || null,
        scopeIds: scopes,
        branchId: null
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + (err.error || "Desconocido"));
      } else {
        router.push("/users");
      }
    }).catch(() => null);
  };

  const territoryOptions = [
    { label: "Sin territorio (Nacional)", value: "" },
    ...availableTerritories.map(t => ({ label: t.name, value: t.id }))
  ];

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-manrope">
      <div className="max-w-md w-full mx-auto flex flex-col h-full">
        <header className="flex items-center justify-between px-4 py-3 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/users"
            className="group flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Volver"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-[#171216] dark:text-white">
            Nuevo Usuario
          </h1>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 no-scrollbar">
          <section className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDuration: "0.4s" }}>
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              <h3 className="text-[#171216] dark:text-gray-200 text-base font-bold tracking-tight">Datos Personales</h3>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-white/50 dark:border-gray-700/50 flex flex-col gap-5">
              <Field
                label="Nombre Completo"
                placeholder="Ej. Juan Perez"
                value={name}
                onChange={setName}
                validated={Boolean(name)}
              />
              <Field
                label="Correo Electronico"
                placeholder="juan@lapurpura.com"
                type="email"
                value={email}
                onChange={setEmail}
              />
              <Field
                label="Telefono"
                placeholder="+52 55 1234 5678"
                type="tel"
                value={phone}
                onChange={setPhone}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 animate-fade-in-up" style={{ animationDuration: "0.5s" }}>
            <div className="flex items-center gap-2 px-1 pt-2">
              <span className="material-symbols-outlined text-primary text-[20px]">settings_account_box</span>
              <h3 className="text-[#171216] dark:text-gray-200 text-base font-bold tracking-tight">Configuracion</h3>
            </div>
            <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 shadow-soft border border-white/50 dark:border-gray-700/50 flex flex-col gap-5">
              <SelectField
                label="Rol de Usuario"
                value={role}
                onChange={setRole}
                options={[
                  { label: "Seleccionar rol", value: "", disabled: true },
                  { label: "Administrador (Nacional)", value: "Administrador" },
                  { label: "Supervisor (Coordinador)", value: "Supervisor" },
                  { label: "Colaborador (Operador)", value: "Operador" },
                  { label: "Militante", value: "Militante" },
                ]}
              />
              <SelectField
                label="Territorio Principal"
                value={territory}
                onChange={setTerritory}
                options={territoryOptions}
                icon="map"
              />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
                  Scopes Adicionales
                </span>
                <div className="bg-gray-50 dark:bg-[#21242c] rounded-xl border border-input-border dark:border-gray-600 p-2 max-h-40 overflow-y-auto">
                  {availableTerritories.map(t => (
                    <label key={t.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scopes.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) setScopes([...scopes, t.id]);
                          else setScopes(scopes.filter(id => id !== t.id));
                        }}
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-300">{t.name}</span>
                    </label>
                  ))}
                  {availableTerritories.length === 0 && <span className="text-sm text-gray-400 p-2">Cargando territorios...</span>}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-4 pb-2">
            <button
              className="w-full h-14 bg-primary hover:bg-primary-dark text-white rounded-xl text-lg font-bold shadow-[0_4px_20px_-2px_rgba(135,29,117,0.4)] hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              type="button"
              onClick={handleSubmit}
            >
              <span className="material-symbols-outlined text-[24px]">add_circle</span>
              Crear Usuario
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Al crear el usuario se enviara un correo de confirmacion.
            </p>
          </div>
        </main>

        <nav className="bg-white dark:bg-[#2d3139] border-t border-gray-100 dark:border-gray-700 px-6 pb-6 pt-3 flex justify-between items-center text-xs font-medium z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/home" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span>Inicio</span>
          </Link>
          <Link href="/users" className="flex flex-col items-center gap-1 text-primary">
            <span className="material-symbols-outlined text-[24px] fill-current">group</span>
            <span>Usuarios</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
            <div className="size-12 -mt-8 bg-primary rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] border-4 border-background-light dark:border-background-dark">
              <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
            </div>
          </Link>
          <Link href="/tasks" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
            <span>Tareas</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">person</span>
            <span>Perfil</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  validated?: boolean;
};

function Field({ label, placeholder, type = "text", value, onChange, validated }: FieldProps) {
  return (
    <label className="flex flex-col w-full gap-2 group">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
        {label}
      </span>
      <div className="relative flex items-center">
        <input
          className="w-full h-12 px-4 rounded-xl border border-input-border dark:border-gray-600 bg-gray-50 dark:bg-[#21242c] text-[#171216] dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all-300 placeholder:text-gray-400"
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {validated && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-white dark:bg-[#21242c] rounded-full">
            <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
          </div>
        )}
      </div>
    </label>
  );
}

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  icon?: string;
  value: string;
  onChange: (value: string) => void;
};

function SelectField({ label, options, icon, value, onChange }: SelectFieldProps) {
  return (
    <label className="flex flex-col w-full gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1">
        {label}
      </span>
      <div className="relative">
        <select
          className="w-full h-12 px-4 pr-10 appearance-none rounded-xl border border-input-border dark:border-gray-600 bg-gray-50 dark:bg-[#21242c] text-[#171216] dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all-300"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.label} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <span className="material-symbols-outlined text-[24px]">{icon ?? "expand_more"}</span>
        </div>
      </div>
    </label>
  );
}
