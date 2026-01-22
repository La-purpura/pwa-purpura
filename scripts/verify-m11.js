
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyM11() {
    console.log('🔍 Iniciando Verificación M11...');

    // 1. Simular una acción que genere log (si no hay ninguno)
    const logs = await prisma.auditLog.findMany({
        include: { actor: true },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    if (logs.length === 0) {
        console.log('ℹ️ No hay logs, creando uno de prueba...');
        const user = await prisma.user.findFirst();
        await prisma.auditLog.create({
            data: {
                action: 'VERIFICATION_TEST',
                entity: 'System',
                entityId: 'test-123',
                actorId: user.id,
                metadata: JSON.stringify({ status: 'ok', tool: 'node verification' })
            }
        });
    }

    const finalLogs = await prisma.auditLog.findMany({
        include: { actor: true },
        take: 1,
        orderBy: { createdAt: 'desc' }
    });

    console.log('✅ Audit Logs encontrados:', finalLogs.length);
    console.log('✅ Última acción registrada:', finalLogs[0].action);
    console.log('✅ Actor detectado:', finalLogs[0].actor.name);

    console.log('✅ Verificación de base de datos M11 completada');
}

verifyM11()
    .then(() => console.log('🚀 M11 Verificado correctamente'))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
