import { useAppStore } from "@/lib/store";
import { Permission, ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/permissions";

export function useRBAC() {
    const user = useAppStore((state) => state.user);

    /**
     * Check if the current user has a specific permission.
     */
    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;
        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
    };

    /**
     * Check if the current user has access to a specific territory scope.
     * This is a simplified ABAC implementation.
     */
    const hasScope = (targetTerritory: string): boolean => {
        if (!user) return false;

        // Super Admin has full scope
        if (user.role === "SuperAdminNacional") return true;

        // TODO: Implement real hierarchy check (e.g. if user is "Provincia", they have access to "Municipio X")
        // For now, simple exact match or full national access
        if (user.territory === "Nacional") return true;

        return user.territory === targetTerritory;
    };

    return {
        user,
        roleLabel: user ? ROLE_LABELS[user.role] : "Invitado",
        hasPermission,
        hasScope
    };
}
