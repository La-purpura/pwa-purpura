// src/lib/server-db.ts
/**
 * @deprecated ELIMINAR EN PR-00. Usar Prisma (@/lib/prisma) para persistencia real.
 * Este archivo solo se mantiene temporalmente para evitar errores de compilación durante la refactorización.
 */

// Tipos compartidos
export interface DbTask {
    id: string;
    title: string;
    description: string;
    status: "pending" | "in_progress" | "done";
    priority: "high" | "medium" | "low";
    territory: string;
    assigneeId?: string;
    dueDate: string;
    createdAt: string;
}

export interface DbRequest {
    id: string;
    taskId?: string; // Si viene de una tarea
    type: string; // "Relevamiento", "Alerta", "Proyecto"
    data: any; // El contenido del formulario
    submittedBy: string; // User ID
    status: "pending" | "approved" | "rejected" | "needs_changes";
    territory: string;
    createdAt: string;
    feedback?: string;
}

export interface DbAlert {
    id: string;
    title: string;
    type: 'info' | 'warning' | 'error' | 'news' | 'system'; // Expanded types
    message: string;
    isRead: boolean;
    date?: string;
    createdAt: string;
}

// Tipos auxiliares para Proyectos
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

export interface ProjectMilestone {
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'done' | 'blocked';
    startDate?: string;
    endDate?: string;
    responsibleId?: string;
}

export interface ProjectRisk {
    id: string;
    description: string;
    probability: 1 | 2 | 3 | 4 | 5; // 1-Baja, 5-Alta
    impact: 1 | 2 | 3 | 4 | 5;
    mitigation: string;
    responsibleId?: string;
}

// Modelo Principal de Proyecto
export interface DbProject {
    id: string;
    code: string; // Auto-generado: PT-202X-XXX
    title: string;
    branch: string; // Rama (PyME, Deportes, etc.)
    type: string; // Operativo, Institucional, etc.
    priority: ProjectPriority;
    status: ProjectStatus;

    // Alcance Territorial
    territoryLevel: 'province' | 'department' | 'locality' | 'multi';
    territories: string[]; // Lista de territorios involucrados
    headquarterTerritory: string; // Territorio cabecera

    // Detalles y Objetivos
    description: string; // Resumen ejecutivo
    problem?: string;
    generalObjective?: string;
    specificObjectives?: string[];
    targetPopulation?: string;
    successCriteria?: string;

    // Fechas
    startDate?: string;
    endDate?: string;

    // Métricas
    kpis: ProjectKPI[]; // Reemplaza al objeto simple {completed, total}

    // Equipo
    leaderId: string; // Responsable principal
    teamIds: string[]; // Co-responsables / Equipo

    // Planificación
    milestones: ProjectMilestone[];

    // Recursos
    resources?: {
        humanEstimate?: string;
        materials?: string[];
        budget?: { item: string; amount: number; currency: string; source: string }[];
    };

    // Auditoría y Riesgos
    risks: ProjectRisk[];

    // Meta
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Helper Class for Collections
class Collection<T extends { id: string }> {
    private data: T[] = [];

    constructor(initialData: T[] = []) {
        this.data = initialData;
    }

    getAll() { return this.data; }
    getById(id: string) { return this.data.find(d => d.id === id); }
    create(item: Omit<T, 'id'> & { id?: string }): T {
        const newItem = { ...item, id: item.id || Math.random().toString(36).substr(2, 9) } as T;
        this.data.push(newItem);
        return newItem;
    }
    update(id: string, updates: Partial<T>): T | null {
        const idx = this.data.findIndex(d => d.id === id);
        if (idx === -1) return null;
        this.data[idx] = { ...this.data[idx], ...updates };
        return this.data[idx];
    }
    delete(id: string) {
        this.data = this.data.filter(d => d.id !== id);
    }
}

// Base de Datos en Memoria (Singleton para desarrollo)
class InMemoryDatabase {
    private static instance: InMemoryDatabase;

    public tasks: Collection<DbTask>;
    public requests: Collection<DbRequest>;
    public alerts: Collection<DbAlert>; // Added alerts collection
    public projects: Collection<DbProject>;

    private constructor() {
        // Datos iniciales (Seeds)
        this.tasks = new Collection<DbTask>([{
            id: "TASK-SEED-01",
            title: "Relevamiento Inicial - Zona Centro",
            description: "Censo de comercios y situación barrial.",
            status: "pending",
            priority: "high",
            territory: "San Isidro",
            dueDate: "2024-02-01",
            createdAt: new Date().toISOString()
        }]);

        // Initialize alerts
        this.alerts = new Collection<DbAlert>([
            {
                id: "alert-1",
                title: "Inactividad Detectada",
                type: "warning",
                message: "Sin actividad en zona norte hace 3h",
                isRead: false,
                date: "Hace 3h",
                createdAt: new Date().toISOString()
            }
        ]);

        this.requests = new Collection<DbRequest>([{
            id: "REQ-SEED-01",
            type: "Relevamiento Social",
            data: { familias: 4, necesidades: "Alimentos" },
            submittedBy: "user-1",
            status: "pending",
            territory: "San Isidro",
            createdAt: new Date().toISOString()
        }]);

        this.projects = new Collection<DbProject>([
            {
                id: "p1",
                code: "PT-2024-ZN-001",
                title: "Mejora Urbana Zona 1",
                branch: "Infraestructura",
                type: "Operativo territorial",
                priority: "high",
                status: "in_progress",
                territoryLevel: "locality",
                territories: ["San Isidro"],
                headquarterTerritory: "San Isidro",
                description: "Renovación de espacios verdes y luminarias.",
                leaderId: "admin-1",
                teamIds: ["user-1"],
                kpis: [{ id: "k1", name: "Espacios Renovados", unit: "unidades", baseline: 0, target: 5, deadline: "2024-03-01" }],
                milestones: [],
                risks: [],
                createdBy: "admin-1",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: "p2",
                code: "PT-2024-NAC-004",
                title: "Campaña de Vacunación",
                branch: "Salud",
                type: "Campaña / comunicación",
                priority: "critical",
                status: "draft", // Changed from planning (invalid) to draft
                territoryLevel: "multi",
                territories: ["Nacional"],
                headquarterTerritory: "Nacional",
                description: "Coordinación con centros de salud.",
                leaderId: "admin-1",
                teamIds: [],
                kpis: [{ id: "k2", name: "Dosis Aplicadas", unit: "dosis", baseline: 0, target: 10000 }],
                milestones: [],
                risks: [],
                createdBy: "admin-1",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
        ]);
    }

    public static getInstance(): InMemoryDatabase {
        if (!InMemoryDatabase.instance) {
            InMemoryDatabase.instance = new InMemoryDatabase();
        }
        return InMemoryDatabase.instance;
    }
}

export const db = InMemoryDatabase.getInstance();
