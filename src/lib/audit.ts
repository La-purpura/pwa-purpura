import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // En producción usar singleton global

export type AuditAction =
    | "TASK_CREATED" | "TASK_UPDATED" | "TASK_COMPLETED"
    | "ALERT_CREATED"
    | "PROJECT_CREATED" | "PROJECT_APPROVED"
    | "LOGIN_SUCCESS" | "USER_CREATED";

export async function logAudit(
    action: AuditAction,
    entity: string,
    entityId: string,
    actorId: string,
    metadata?: Record<string, any>
) {
    // Fire and forget (no await blocking essential flow)
    prisma.auditLog.create({
        data: {
            action,
            entity,
            entityId,
            actorId,
            metadata: metadata ? JSON.stringify(metadata) : null
        }
    }).catch(err => {
        console.error("Audit Log Error:", err);
    });
}
