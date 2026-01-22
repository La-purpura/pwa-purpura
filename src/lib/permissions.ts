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
    | "audit:view" | "audit:export"

    // Intranet (Posts)
    | "posts:view" | "posts:create" | "posts:manage";

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
        "users:view", "users:invite", "users:edit", "users:revoke", "users:delete",
        "roles:assign", "roles:manage",
        "territory:view", "territory:manage",
        "forms:view", "forms:create", "forms:edit_own", "forms:submit", "forms:review", "forms:request_changes", "forms:approve", "forms:reject", "templates:manage",
        "incidents:view", "incidents:create", "incidents:manage",
        "projects:view", "projects:create", "projects:manage",
        "content:view", "content:publish", "content:archive", "documents:upload", "documents:version",
        "chat:use", "chat:create_channel", "chat:moderate",
        "audit:view", "audit:export",
        "posts:view", "posts:create", "posts:manage"
    ],
    AdminNacional: [
        "users:view", "users:invite", "users:edit", "users:revoke", "roles:assign", "territory:view", "territory:manage",
        "forms:view", "forms:review", "forms:request_changes", "forms:approve", "forms:reject",
        "incidents:view", "incidents:manage", "projects:view", "projects:manage",
        "content:view", "content:publish", "documents:upload", "chat:use", "chat:create_channel", "audit:view",
        "posts:view", "posts:create", "posts:manage"
    ],
    AdminProvincial: [
        "users:view", "users:invite", "users:edit", "users:revoke", "roles:assign", "territory:view",
        "forms:view", "forms:review", "forms:request_changes", "forms:approve", "forms:reject",
        "incidents:view", "incidents:manage", "projects:view", "projects:manage",
        "content:view", "content:publish", "documents:upload", "chat:use", "chat:create_channel", "audit:view",
        "posts:view", "posts:create"
    ],
    Coordinador: [
        "users:view", "territory:view", "forms:view", "forms:review", "forms:request_changes",
        "incidents:view", "incidents:create", "incidents:manage", "projects:view", "projects:create", "projects:manage",
        "content:view", "content:publish", "chat:use", "chat:create_channel", "audit:view",
        "posts:view"
    ],
    Colaborador: [
        "forms:view", "forms:edit_own", "forms:submit",
        "incidents:view", "incidents:create", "incidents:manage", "projects:view", "projects:create",
        "content:view", "documents:upload", "chat:use",
        "posts:view"
    ],
    Referente: [
        "forms:create", "forms:edit_own", "forms:submit",
        "incidents:create", "incidents:manage", "projects:create", "projects:manage",
        "documents:upload", "content:view", "chat:use",
        "posts:view"
    ],
    Militante: [
        "content:view", "chat:use",
        "posts:view"
    ],
    AuditorLectura: [
        "users:view", "territory:view", "forms:view", "incidents:view", "projects:view", "content:view", "audit:view",
        "posts:view"
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
