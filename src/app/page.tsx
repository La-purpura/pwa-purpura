"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const setUser = useAppStore((state) => state.setUser);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identity.trim() || !password.trim()) {
      alert("Completa usuario y contraseña para ingresar.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identity.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al iniciar sesión");
        return;
      }

      // Login exitoso
      setUser(data.user);

      // Redirección basada en rol
      if (["SuperAdminNacional", "AdminNacional", "AdminProvincial"].includes(data.user.role)) {
        router.push("/dashboard");
      } else {
        router.push("/home"); // PWA User
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <main className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col justify-center items-center text-gray-800 dark:text-gray-100 transition-colors duration-300 antialiased relative overflow-hidden text-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[30%] bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md px-6 py-8 z-10 flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-32 h-32 mb-4 relative drop-shadow-xl filter">
            <img
              alt="La Púrpura Wolf Logo"
              className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQa0FxR3SZ0TfdFTkhotZxODDAKL89yCXMZFYafzSsJCymeP8eCT5g3w5hvXwjx4NdoFpSvaoPp_Wpy6L5x5eIiUkGtJh8-qYy-ZHSgaHkNz1OSn3LK5gXd7FWUV3QTanELtL_oIV9WiF9STme0CjP0u1m2Okis0WbEny7uBG86w_BNMvUuMmFWt-qXKpaAbgScJAhu3OiOunj1-QnkqmlnL7_yFEgJA0Nsd5dHD5QpR5oHDmrub719Vup56adKkPMHDNI4ikhebo"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">La Púrpura</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Gestión Operativa en Territorio
          </p>
        </div>
        <div className="w-full bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-white/50 dark:border-white/5 backdrop-blur-sm">
          <form className="space-y-5 text-left" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1" htmlFor="identity">
                Usuario o Correo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">
                    person
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm sm:text-sm"
                  id="identity"
                  placeholder="Ingresa tu usuario"
                  type="text"
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1" htmlFor="password">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm sm:text-sm"
                  id="password"
                  placeholder="••••••••"
                  type={passwordShown ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  onClick={togglePassword}
                >
                  <span className="material-symbols-outlined text-xl">
                    {passwordShown ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link className="text-xs font-medium text-primary hover:text-primary/80 transition-colors" href="/recover-password">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <button
              className="w-full flex justify-center py-3.5 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-primary/20"
              type="submit"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
        <div className="mt-8 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className="material-symbols-outlined text-sm mr-1.5 text-primary">cloud</span>
              <span>Online (Local DB)</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center max-w-[260px] leading-tight">
            Versión de desarrollo v2.0
          </p>
        </div>
      </div>
    </main>
  );
}
