import { ProjectStatus } from "./types";

/**
 * PROJECT_STATUS_FLOW
 * Define las transiciones permitidas para un proyecto.
 */
export const PROJECT_STATUS_FLOW: Record<ProjectStatus, ProjectStatus[]> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['approved', 'needs_changes', 'cancelled'],
    needs_changes: ['submitted', 'cancelled'],
    approved: ['in_progress', 'paused', 'cancelled'],
    in_progress: ['completed', 'paused', 'cancelled'],
    paused: ['in_progress', 'cancelled'],
    completed: [], // Final
    cancelled: []  // Final
};

/**
 * isValidTransition
 * Verifica si un salto de estado es válido según el flujo definido.
 */
export function isValidTransition(current: ProjectStatus, next: ProjectStatus): boolean {
    const allowed = PROJECT_STATUS_FLOW[current] || [];
    return allowed.includes(next);
}

/**
 * canApprove
 * Determina si el rol actual tiene permiso para aprobar proyectos.
 */
export function canApprove(role: string): boolean {
    return ['SuperAdminNacional', 'AdminNacional', 'AdminProvincial', 'Coordinador'].includes(role);
}
