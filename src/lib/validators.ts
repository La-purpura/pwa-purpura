
import { z } from 'zod';

export const TaskSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
    dueDate: z.string().datetime().optional(), // Expects ISO string
    territoryIds: z.array(z.string()).optional(),
    assigneeId: z.string().optional()
});

export const ReportSchema = z.object({
    title: z.string().min(5),
    category: z.string(),
    description: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    photoUrl: z.string().url().optional(),
    priority: z.enum(['low', 'medium', 'high']),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});
