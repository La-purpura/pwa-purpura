
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived' | 'cancelled';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'processed';

interface Transition<T extends string> {
    from: T[];
    to: T;
    requiresReason?: boolean;
    requiredRole?: string[]; // Optional: restrict by role here or kept in guard?
}

export const PROJECT_TRANSITIONS: Transition<ProjectStatus>[] = [
    { from: ['draft'], to: 'active' },
    { from: ['active'], to: 'completed', requiresReason: true },
    { from: ['active', 'draft'], to: 'cancelled', requiresReason: true },
    { from: ['completed', 'cancelled'], to: 'archived' },
    // Reactivación (opcional)
    { from: ['cancelled', 'completed'], to: 'active', requiresReason: true } // "Re-open"
];

export const REQUEST_TRANSITIONS: Transition<RequestStatus>[] = [
    { from: ['pending'], to: 'approved', requiresReason: true }, // Approval notes
    { from: ['pending'], to: 'rejected', requiresReason: true }, // Rejection reason
    { from: ['approved'], to: 'processed' }
];

export class WorkflowError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "WorkflowError";
    }
}

export function validateTransition<T extends string>(
    currentStatus: T,
    newStatus: T,
    transitions: Transition<T>[],
    reason?: string
): void {
    const transition = transitions.find(t => t.to === newStatus && t.from.includes(currentStatus));

    if (!transition) {
        throw new WorkflowError(`Transición inválida de '${currentStatus}' a '${newStatus}'`);
    }

    if (transition.requiresReason && (!reason || reason.trim().length === 0)) {
        throw new WorkflowError(`Esta transición requiere un motivo justificativo.`);
    }
}
