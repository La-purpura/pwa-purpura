import { describe, it, expect, vi } from 'vitest';
import { requirePermission, PermissionError } from '@/lib/guard';
import { ROLE_PERMISSIONS } from '@/lib/rbac';

// Mock getSession
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

import { getSession } from '@/lib/auth';

describe('RBAC & Guard', () => {
    it('should allow access if user has permission', async () => {
        (getSession as any).mockResolvedValue({
            user: { id: '1' },
            role: 'SuperAdminNacional',
            territoryId: null
        });

        const session = await requirePermission('users:view');
        expect(session).toBeDefined();
        expect(session.role).toBe('SuperAdminNacional');
    });

    it('should throw PermissionError if user lacks permission', async () => {
        (getSession as any).mockResolvedValue({
            user: { id: '2' },
            role: 'Militante',
            // Militante only has content:view, etc.
        });

        await expect(requirePermission('users:delete'))
            .rejects
            .toThrow(PermissionError);
    });

    it('should throw AuthError if no session', async () => {
        (getSession as any).mockResolvedValue(null);

        await expect(requirePermission('users:view'))
            .rejects
            .toThrow('Usuario no autenticado');
    });

    it('should validate roles defined in RBAC', () => {
        expect(ROLE_PERMISSIONS['SuperAdminNacional']).toBeDefined();
        expect(ROLE_PERMISSIONS['Militante']).toBeDefined();
    });
});
