import { User, Task, Incident, Alert, Kpis, Draft, Project, Report } from "./types";

export const mockDrafts: Draft[] = [
  { id: "d1", title: "Encuesta de Satisfacción", type: "survey", progress: 60, lastModified: "Hace 2h" },
  { id: "d2", title: "Informe de Visita - Escuela 404", type: "report", progress: 30, lastModified: "Ayer" },
];

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
  }
];

export const mockReports: Report[] = [
  { id: "r1", title: "Reporte Mensual Enero", status: "resolved", territory: "Zona Norte", createdAt: "2024-01-20T10:00:00Z" }
];
