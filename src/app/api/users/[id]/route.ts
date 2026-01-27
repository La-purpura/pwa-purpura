import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, enforceScope, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * PATCH /api/users/:id
 * Actualiza datos de un usuario (Rol, Rama, Alcance, Estado).
 * Solo accesible para administradores.
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requirePermission('users:edit');
        const { id } = params;

        const scopeFilter = await enforceScope(session);

        const body = await request.json();

        const { role, branchId, territoryId, territoryScope, status, name, alias, phone } = body;

        // 1. Verificar existencia y alcance
        const existingUser = await prisma.user.findFirst({
            where: {
                id,
                ...scopeFilter
            }
        });
        if (!existingUser) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // 2. Preparar actualización
        const updateData: any = {};
        if (role) updateData.role = role;
        if (branchId !== undefined) updateData.branchId = branchId;
        if (territoryId !== undefined) updateData.territoryId = territoryId;
        if (territoryScope !== undefined) updateData.territoryScope = territoryScope;
        if (status) updateData.status = status;
        if (name) updateData.name = name;
        if (alias !== undefined) updateData.alias = alias;
        if (phone !== undefined) updateData.phone = phone;

        // 3. Ejecutar actualización y flushing de sesiones si hay cambios críticos
        const isCriticalChange = role || branchId !== undefined || territoryId !== undefined;

        const updatedUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: updateData
            });

            if (isCriticalChange) {
                await tx.session.deleteMany({ where: { userId: id } });
            }

            return user;
        });

        // 4. Auditar cambios específicos
        if (role && role !== existingUser.role) {
            logAudit("ROLE_UPDATED", "User", id, session.sub, { from: existingUser.role, to: role });
        }
        if (territoryId !== existingUser.territoryId || territoryScope !== undefined) {
            logAudit("SCOPE_UPDATED", "User", id, session.sub, {
                territoryId,
                territoryScope
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                status: updatedUser.status
            }
        });

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/users/:id
 * Eliminación física de usuario. Usar con precaución.
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requirePermission('users:delete');
        const { id } = params;

        // Se recomienda usar REVOKE en lugar de DELETE para mantener integridad de logs/tareas
        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Usuario eliminado físicamente" });
    } catch (error) {
        return handleApiError(error);
    }
}
