
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/guard";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/sync/push
 * Procesa un lote de acciones offline con soporte para idempotencia y conflictos básicos.
 */
export async function POST(request: Request) {
    try {
        const session = await requireAuth();
        const { actions } = await request.json(); // Array de { id, type, payload, idempotencyKey, timestamp }

        if (!actions || !Array.isArray(actions)) {
            return NextResponse.json({ error: "Lote de acciones inválido" }, { status: 400 });
        }

        const results = [];

        for (const action of actions) {
            const { type, payload, idempotencyKey } = action;

            // 1. Verificar Idempotencia
            const existingRecord = await prisma.idempotencyRecord.findUnique({
                where: { key: idempotencyKey }
            });

            if (existingRecord) {
                results.push({
                    idempotencyKey,
                    status: existingRecord.responseStatus,
                    body: existingRecord.responseBody,
                    cached: true
                });
                continue;
            }

            let result;
            try {
                // 2. Procesar según tipo
                switch (type) {
                    case 'CREATE_TASK':
                        result = await prisma.task.create({
                            data: {
                                ...payload,
                                territories: payload.territoryIds ? {
                                    create: payload.territoryIds.map((tid: string) => ({ territoryId: tid }))
                                } : undefined
                            }
                        });
                        break;
                    case 'CREATE_REPORT':
                        result = await prisma.report.create({
                            data: { ...payload, reportedById: session.sub }
                        });
                        break;
                    case 'UPDATE_TASK':
                        // Detección de conflicto básica
                        const currentTask = await prisma.task.findUnique({ where: { id: payload.id } });
                        if (currentTask && payload.lastUpdatedAt && new Date(currentTask.updatedAt) > new Date(payload.lastUpdatedAt)) {
                            // Conflicto detectado
                            await prisma.conflict.create({
                                data: {
                                    entityType: 'Task',
                                    entityId: payload.id,
                                    userId: session.sub,
                                    data: payload,
                                    reason: 'VERSION_MISMATCH'
                                }
                            });
                            throw new Error("CONFLICT");
                        }
                        result = await prisma.task.update({ where: { id: payload.id }, data: payload });
                        break;
                    default:
                        throw new Error("UNSUPPORTED_TYPE");
                }

                // 3. Registrar éxito e Idempotencia
                const responseBody = result;
                await prisma.idempotencyRecord.create({
                    data: {
                        key: idempotencyKey,
                        userId: session.sub,
                        responseStatus: 201,
                        responseBody: responseBody as any
                    }
                });

                results.push({ idempotencyKey, status: 201, body: responseBody });
                logAudit("OFFLINE_ACTION_SYNCED", type, result.id, session.sub, { type });

            } catch (err: any) {
                const status = err.message === 'CONFLICT' ? 409 : 500;
                results.push({ idempotencyKey, status, error: err.message });
            }
        }

        return NextResponse.json({ results });

    } catch (error) {
        return handleApiError(error);
    }
}
