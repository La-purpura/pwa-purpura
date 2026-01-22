export type Permission =
    // Usuarios y Auth
    | "users:view" | "users:invite" | "users:edit" | "users:revoke" | "users:delete"
    | "roles:assign" | "roles:manage"

    // Territorio
    | "territory:view" | "territory:manage"

    // Relevamientos (Forms)
    | "forms:view" | "forms:create" | "forms:edit_own" | "forms:submit"
    | "forms:review" | "forms:request_changes" | "forms:approve" | "forms:reject"
    | "templates:manage"

    // Incidencias y Proyectos
    | "incidents:view" | "incidents:create" | "incidents:manage"
    | "projects:view" | "projects:create" | "projects:manage"

    // Contenido (Intranet/Biblioteca)
    | "content:view" | "content:publish" | "content:archive"
    | "documents:upload" | "documents:version"

    // Chat
    | "chat:use" | "chat:create_channel" | "chat:moderate"

    // Auditoría
    | "audit:view" | "audit:export";

export type Role =
    | "SuperAdminNacional"
    | "AdminNacional"
    | "AdminProvincial"
    | "Coordinador"
    | "Colaborador"
    | "Referente"
    | "Militante"
    | "AuditorLectura";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    SuperAdminNacional: [
        // FULL ACCESS
        "users:view", "users:invite", "users:edit", "users:revoke", "users:delete",
        "roles:assign", "roles:manage",
        "territory:view", "territory:manage",
        "forms:view", "forms:create", "forms:edit_own", "forms:submit", "forms:review", "forms:request_changes", "forms:approve", "forms:reject", "templates:manage",
        "incidents:view", "incidents:create", "incidents:manage",
        "projects:view", "projects:create", "projects:manage",
        "content:view", "content:publish", "content:archive", "documents:upload", "documents:version",
        "chat:use", "chat:create_channel", "chat:moderate",
        "audit:view", "audit:export"
    ],
    AdminNacional: [
        "users:view", "users:invite", "users:edit", "users:revoke",
        "roles:assign", // Limitado por política
        "territory:view", "territory:manage",
        "forms:view", "forms:review", "forms:request_changes", "forms:approve", "forms:reject",
        "incidents:view", "incidents:manage",
        "projects:view", "projects:manage",
        "content:view", "content:publish", "documents:upload",
        "chat:use", "chat:create_channel",
        "audit:view"
    ],
    AdminProvincial: [
        "users:view", "users:invite", "users:edit", "users:revoke", // Solo su provincia
        "roles:assign", // Limitado
        "territory:view", // Solo su provincia
        "forms:view", "forms:review", "forms:request_changes", "forms:approve", "forms:reject", // Solo su provincia
        "incidents:view", "incidents:manage",
        "projects:view", "projects:manage",
        "content:view", "content:publish", "documents:upload", // Scope provincial
        "chat:use", "chat:create_channel",
        "audit:view"
    ],
    Coordinador: [
        "users:view", // Solo su zona
        "territory:view",
        "forms:view", "forms:review", "forms:request_changes", // Pre-revisión
        "incidents:view", "incidents:create", "incidents:manage",
        "projects:view", "projects:create", "projects:manage",
        "content:view", "content:publish", // Notas internas
        "chat:use", "chat:create_channel",
        "audit:view" // Limitado
    ],
    Colaborador: [
        "forms:view", "forms:edit_own", "forms:submit",
        "incidents:view", "incidents:create", "incidents:manage",
        "projects:view", "projects:create",
        "content:view", "documents:upload", // Borradores
        "chat:use"
    ],
    Referente: [
        "forms:create", "forms:edit_own", "forms:submit",
        "incidents:create", "incidents:manage", // Scope propio
        "projects:create", "projects:manage", // Scope propio
        "documents:upload", // Evidencias
        "content:view",
        "chat:use"
    ],
    Militante: [
        "content:view",
        "chat:use"
        // Micro-reportes si se implementan irían aparte
    ],
    AuditorLectura: [
        "users:view",
        "territory:view",
        "forms:view",
        "incidents:view",
        "projects:view",
        "content:view",
        "audit:view"
        // Read-only total
    ]
};

export const ROLE_LABELS: Record<Role, string> = {
    SuperAdminNacional: "Super Admin Nacional",
    AdminNacional: "Admin Nacional",
    AdminProvincial: "Admin Provincial",
    Coordinador: "Coordinador Regional",
    Colaborador: "Colaborador",
    Referente: "Referente Territorial",
    Militante: "Militante",
    AuditorLectura: "Auditor"
};
