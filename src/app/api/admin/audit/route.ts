import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission, handleApiError } from "@/lib/guard";

export const dynamic = 'force-dynamic';

// GET: Fetch audit logs with advanced filtering
export async function GET(request: Request) {
    try {
        const session = await requirePermission('audit:view');
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const actorId = searchParams.get('actorId');
        const action = searchParams.get('action');
        const entity = searchParams.get('entity');

        const where: any = {};
        if (actorId) where.actorId = actorId;
        if (action) where.action = action;
        if (entity) where.entity = entity;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    actor: {
                        select: { name: true, email: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' }, // Fixed: timestamp -> createdAt
                skip,
                take: limit
            }),
            prisma.auditLog.count({ where })
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return handleApiError(error);
    }
}
