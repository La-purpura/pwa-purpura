import prisma from "./prisma";

export type AuditAction =
    | "TASK_CREATED" | "TASK_UPDATED" | "TASK_COMPLETED" | "TASK_ASSIGNED"
    | "ALERT_CREATED" | "ALERT_UPDATED" | "ALERT_READ"
    | "PROJECT_CREATED" | "PROJECT_APPROVED" | "PROJECT_UPDATED" | "PROJECT_STATUS_CHANGED" | "MILESTONE_UPDATED"
    | "REQUEST_CREATED" | "REQUEST_APPROVED" | "REQUEST_REJECTED" | "REQUEST_DELETED"
    | "POST_PUBLISHED" | "POST_READ"
    | "LOGIN_SUCCESS" | "LOGIN_FAILURE" | "LOGOUT" | "USER_CREATED" | "PASSWORD_CHANGED" | "ACCOUNT_ACTIVATED"
    | "USER_INVITED" | "INVITE_ACCEPTED" | "INVITE_REVOKED"
    | "USER_REVOKED" | "USER_ENABLED" | "ROLE_UPDATED" | "SCOPE_UPDATED" | "PROFILE_UPDATED"
    | "REPORT_CREATED" | "REPORT_UPDATED" | "REPORT_DELETED"
    | "INCIDENT_CREATED" | "INCIDENT_UPDATED" | "INCIDENT_DELETED"
    | "RESOURCE_UPLOADED" | "RESOURCE_DELETED" | "RESOURCE_UPDATED"
    | "TASK_DELETED";

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

