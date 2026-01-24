import { z } from "zod";

export const UserInviteSchema = z.object({
    email: z.string().email("Email inválido"),
    name: z.string().min(2, "Nombre demasiado corto"),
    role: z.string(),
    territoryId: z.string().optional().nullable(),
    branchId: z.string().optional().nullable(),
    password: z.string().min(8).optional()
});

export const TaskSchema = z.object({
    title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
    description: z.string().optional().nullable(),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
    dueDate: z.string().datetime().optional().nullable(),
    assigneeId: z.string().optional().nullable(),
    territoryIds: z.array(z.string()).optional()
});

export const ReportSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    category: z.string(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
    address: z.string().optional().nullable(),
    territoryIds: z.array(z.string()).optional()
});

export const ProjectSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional().nullable(),
    branch: z.string().default("General"),
    type: z.string().default("Operativo"),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    territoryIds: z.array(z.string()).optional()
});
