"use client";

import { useAppStore } from "@/lib/store";
import AdminDashboardDesktop from "@/components/dashboard/AdminDashboardDesktop";
import AdminDashboardMobile from "@/components/dashboard/AdminDashboardMobile";
import UserDashboardDesktop from "@/components/dashboard/UserDashboardDesktop";
import UserDashboardMobile from "@/components/dashboard/UserDashboardMobile";

export default function DashboardPage() {
    const { user } = useAppStore();

    if (!user) return null;

    const isAdmin = ["SuperAdminNacional", "AdminNacional", "AdminProvincial", "Coordinador"].includes(user.role);

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            {isAdmin ? (
                <>
                    <div className="hidden md:block">
                        <AdminDashboardDesktop />
                    </div>
                    <div className="md:hidden">
                        <AdminDashboardMobile />
                    </div>
                </>
            ) : (
                <>
                    <div className="hidden md:block">
                        <UserDashboardDesktop />
                    </div>
                    <div className="md:hidden">
                        <UserDashboardMobile />
                    </div>
                </>
            )}
        </div>
    );
}
