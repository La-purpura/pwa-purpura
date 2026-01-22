import { Role } from "./permissions";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  territory: string;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "done";
  date: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
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
  priority: "high" | "medium" | "low" | "critical"; // Mapping to severity usually
}

export interface Alert {
  id: string;
  title: string;
  message?: string;
  type: "warning" | "info" | "error" | "system" | "security" | "news"; // Added extended types for AlertsHub
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
  progress: number; // 0-100
  lastModified: string;
}

// Reutilizamos tipos de server-db.ts o redefinimos para el frontend si no compartimos
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
  deadline?: string; // Legacy support or alias for endDate

  // Add other fields as optional for frontend if not always populated
  territoryLevel?: string;
  headquarterTerritory?: string;
}

export const mockDrafts: Draft[] = [
  { id: "d1", title: "Encuesta de Satisfacción", type: "survey", progress: 60, lastModified: "Hace 2h" },
  { id: "d2", title: "Informe de Visita - Escuela 404", type: "report", progress: 30, lastModified: "Ayer" },
];

// Mock inicial para desarrollo frontend
export const mockProjects: Project[] = [
  {
    id: "p1",
    code: "PT-2024-ZN-001",
    title: "Mejora Urbana Zona 1",
    branch: "Infraestructura",
    type: "Operativo",
    priority: "high",
    status: "in_progress",
    description: "Renovación completa de luminarias.",
    kpis: [{ id: "k1", name: "Luminarias", unit: "u", baseline: 0, target: 50 }],
    deadline: "2024-03-01"
  },
  {
    id: "p2",
    code: "PT-2024-SAL-002",
    title: "Operativo Vacunación",
    branch: "Salud",
    type: "Campaña",
    priority: "critical",
    status: "draft",
    description: "Campaña antigripal.",
    kpis: [{ id: "k2", name: "Dosis", unit: "u", baseline: 0, target: 1000 }],
    deadline: "2024-04-15"
  }
];

export const mockUserAdmin: User = {
  id: "admin-1",
  name: "Super Admin Nacional",
  email: "admin@lapurpura.com",
  role: "SuperAdminNacional",
  territory: "Nacional",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzx-VaGVrMQA2ZySeUcKkrzxuiAjEaqtxxWEBxoxmmheyOgzNSnl1ZUyJfchXj_o2AiYz8R1ufZOSI0ePDZBJEyKVB3rYVqInPRRtN48E5EzPRYRb92XQdgS6rDfUq4YJ6_ez1NcpTXAJhB-HP3TxlVtmH2mFuFuptl7kFYevHoHJWk8h3eRTMt2_D4RA5wSbvc-VIo5HNOqlVJR4GO8YRBZg_rIY48u7vX-BQ49IwP3eBx0D8Bby2Izvj_YOKA06dCkjkpP-oC30",
};

export const mockUserRegular: User = {
  id: "user-1",
  name: "Juan Pérez",
  email: "juan.perez@lapurpura.com",
  role: "Colaborador",
  territory: "San Isidro",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzx-VaGVrMQA2ZySeUcKkrzxuiAjEaqtxxWEBxoxmmheyOgzNSnl1ZUyJfchXj_o2AiYz8R1ufZOSI0ePDZBJEyKVB3rYVqInPRRtN48E5EzPRYRb92XQdgS6rDfUq4YJ6_ez1NcpTXAJhB-HP3TxlVtmH2mFuFuptl7kFYevHoHJWk8h3eRTMt2_D4RA5wSbvc-VIo5HNOqlVJR4GO8YRBZg_rIY48u7vX-BQ49IwP3eBx0D8Bby2Izvj_YOKA06dCkjkpP-oC30",
};

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Censo Barrio La Gloria",
    status: "in_progress",
    date: "2024-01-20",
    description: "Relevamiento de familias con necesidades básicas insatisfechas.",
    dueDate: "2024-01-25",
    priority: "high",
    category: "Operativo",
    territory: "La Matanza",
    assignee: "Juan Pérez",
    subtasksDone: 15,
    subtasksTotal: 45
  },
  {
    id: "t2",
    title: "Reparto de Folletería",
    status: "done",
    date: "2024-01-18",
    description: "Difusión de actividades del centro comunitario.",
    dueDate: "2024-01-18",
    priority: "medium",
    category: "Difusión",
    territory: "Vicente López",
    assignee: "Maria Gomez",
    subtasksDone: 200,
    subtasksTotal: 200
  },
  {
    id: "t3",
    title: "Asistencia Alimentaria",
    status: "pending",
    date: "2024-01-22",
    description: "Entrega de módulos en sede central.",
    dueDate: "2024-01-22",
    priority: "high",
    category: "Social",
    territory: "Quilmes",
    assignee: "Carlos Ruiz",
    subtasksDone: 0,
    subtasksTotal: 100
  },
];

export const mockIncidents: Incident[] = [
  {
    id: "i1",
    title: "Luminaria Rota",
    severity: "low",
    status: "open",
    date: "2024-01-19",
    location: "Calle San Martín 1200",
    description: "Falla en el alumbrado público",
    territory: "Avellaneda",
    priority: "low",
    createdAt: new Date().toISOString()
  },
  {
    id: "i2",
    title: "Microbasural detectado",
    severity: "medium",
    status: "open",
    date: "2024-01-18",
    location: "Espana y Rivadavia",
    description: "Acumulación de residuos en esquina",
    territory: "Lanús",
    priority: "medium",
    createdAt: new Date().toISOString()
  },
];

export const mockAlerts: Alert[] = [
  { id: "a1", title: "Nueva tarea asignada", message: "Se te ha asignado 'Censo B. La Gloria'", type: "info", isRead: false, date: "Hace 5 min", timeAgo: "5m", createdAt: new Date().toISOString(), territory: "La Matanza" },
  { id: "a2", title: "Alerta climática: Granizo", message: "Se pronostica granizo severo en zona Este", type: "warning", isRead: false, date: "Hace 1 hora", timeAgo: "1h", createdAt: new Date(Date.now() - 3600000).toISOString(), territory: "Zona Este" },
  { id: "a3", title: "Sistema Inactivo", message: "Mantenimiento programado 22:00hs", type: "system", isRead: true, date: "Ayer", timeAgo: "1d", createdAt: new Date(Date.now() - 86400000).toISOString() },
];

export const mockKpis: Kpis = {
  activeAlerts: 4,
  pendingTasks: 12,
  projects: 8,
  coverage: 68,
  incidents: 24,
};

export interface News {
  id: string;
  title: string;
  summary: string;
  author: string;
  date: string;
}

export const mockNews: News[] = [
  { id: "n1", title: "Actualización de Protocolos", summary: "Nuevas directivas para el relevamiento en zonas rojas.", author: "Admin", date: "2024-01-15" },
  { id: "n2", title: "Feriado del 25 de Mayo", summary: "El centro permanecerá cerrado.", author: "RRHH", date: "2024-05-20" }
];

export const mockInvites = [
  { id: "inv1", email: "nuevo@lapurpura.com", text: "Invitación pendiente" }
];

export const mockOfflineQueue = [];

// Note: Report interface might need to be exported if used elsewhere
export interface Report {
  id: string;
  title: string;
  status: "resolved" | "pending" | "critical";
  territory: string;
  createdAt: string;
}

export const mockReports: Report[] = [
  { id: "r1", title: "Reporte Mensual Enero", status: "resolved", territory: "Zona Norte", createdAt: "2024-01-20T10:00:00Z" },
  { id: "r2", title: "Incidente de Seguridad", status: "critical", territory: "Zona Sur", createdAt: "2024-01-21T14:30:00Z" },
  { id: "r3", title: "Relevamiento de Campo", status: "pending", territory: "Godoy Cruz", createdAt: "2024-01-22T09:15:00Z" }
];

export const mockSurveys = [
  { id: "s1", title: "Encuesta de Calidad", responses: 15 }
];

export const mockUsers = [
  mockUserAdmin,
  mockUserRegular
];

export const mockUser = mockUserAdmin;
