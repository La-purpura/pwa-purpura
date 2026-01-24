"use client";
// Force recompile


import { useAppStore } from "@/lib/store";
import AdminDashboardDesktop from "@/components/dashboard/AdminDashboardDesktop";
import AdminDashboardMobile from "@/components/dashboard/AdminDashboardMobile";
import UserDashboardDesktop from "@/components/dashboard/UserDashboardDesktop";
import UserDashboardMobile from "@/components/dashboard/UserDashboardMobile";

export default function DashboardPage() {
  const user = useAppStore((state) => state.user);

  // Si no hay usuario cargado aún (hidratación), o rol no definido, mostramos un estado de carga o nada
  if (!user) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;

  // Definimos qué roles ven el dashboard "Admin" (con gestión)
  const isAdmin = ["SuperAdminNacional", "AdminNacional", "AdminProvincial", "Coordinador"].includes(user.role);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* 
         Lógica de Renderizado Responsivo:
         Renderizamos tanto la versión móvil como la de escritorio y las ocultamos/mostramos con CSS.
         Esto es más robusto para SSR que usar hooks de tamaño de ventana y evita el flash inicial.
      */}

      {isAdmin ? (
        <>
          {/* Admin Desktop */}
          <div className="hidden md:block">
            <AdminDashboardDesktop />
          </div>
          {/* Admin Mobile */}
          <div className="md:hidden">
            <AdminDashboardMobile />
          </div>
        </>
      ) : (
        <>
          {/* User Desktop */}
          <div className="hidden md:block">
            <UserDashboardDesktop />
          </div>
          {/* User Mobile */}
          <div className="md:hidden">
            <UserDashboardMobile />
          </div>
        </>
      )}
    </div>
  );
}
