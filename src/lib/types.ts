import { Role } from "./rbac";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    territory: string;
    territoryId?: string;
    branchId?: string;
    avatar: string;
}

export interface Task {
    id: string;
    title: string;
    status: "pending" | "in_progress" | "done" | "completed";
    date: string;
    description: string | null;
    dueDate: string | null;
    priority: "high" | "medium" | "low" | "critical";
    category: string;
    territory: string;
    assignee: string;
    subtasksDone: number;
    subtasksTotal: number;
}

export interface Incident {
    id: string;
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    status: "open" | "resolved" | "in_review";
    date: string;
    location: string;
    description: string;
    territory: string;
    createdAt: string;
    priority: "high" | "medium" | "low" | "critical";
}

export interface Alert {
    id: string;
    title: string;
    message?: string;
    type: "warning" | "info" | "error" | "system" | "security" | "news";
    isRead: boolean;
    date: string;
    timeAgo?: string;
    createdAt?: string;
    territory?: string;
}

export interface Kpis {
    activeAlerts: number;
    pendingTasks: number;
    projects: number;
    coverage: number;
    incidents: number;
}

export interface Draft {
    id: string;
    title: string;
    type: string;
    progress: number;
    lastModified: string;
}

export type ProjectStatus = 'draft' | 'submitted' | 'needs_changes' | 'approved' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ProjectKPI {
    id: string;
    name: string;
    unit: string;
    baseline: number;
    target: number;
    deadline?: string;
}

export interface Project {
    id: string;
    code: string;
    title: string;
    branch: string;
    type: string;
    priority: ProjectPriority;
    status: ProjectStatus;
    description: string;
    kpis: ProjectKPI[];
    deadline?: string;
    territoryLevel?: string;
    headquarterTerritory?: string;
}

export interface News {
    id: string;
    title: string;
    summary: string;
    author: string;
    date: string;
}

export interface Report {
    id: string;
    title: string;
    status: "resolved" | "pending" | "critical";
    territory: string;
    createdAt: string;
}
