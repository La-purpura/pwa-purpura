import prisma from "./prisma";

export type AuditAction =
    | "TASK_CREATED" | "TASK_UPDATED" | "TASK_COMPLETED"
    | "ALERT_CREATED"
    | "PROJECT_CREATED" | "PROJECT_APPROVED"
    | "LOGIN_SUCCESS" | "USER_CREATED" | "PASSWORD_CHANGED" | "ACCOUNT_ACTIVATED"
    | "USER_INVITED" | "INVITE_ACCEPTED" | "INVITE_REVOKED"
    | "POST_PUBLISHED" | "POST_READ"
    | "RESOURCE_UPLOADED" | "RESOURCE_DELETED";

export async function logAudit(
    action: AuditAction,
    entity: string,
    entityId: string,
    actorId: string,
    metadata?: Record<string, any>
) {
    // Fire and forget (optional: await if critical)
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
