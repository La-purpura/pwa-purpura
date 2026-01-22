
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyM12() {
    console.log('🔍 Iniciando Verificación M12...');

    // 1. Verificar existencia de incidencias
    const incidents = await prisma.incident.findMany({
        include: {
            reportedBy: true,
            assignedTo: true,
            territory: true
        }
    });

    if (incidents.length === 0) {
        throw new Error('❌ No se encontraron incidencias iniciales');
    }
    console.log('✅ Incidencias encontradas:', incidents.length);

    // 2. Verificar geolocalización
    const withLocation = incidents.filter(i => i.latitude && i.longitude);
    console.log('✅ Incidencias con geolocalización:', withLocation.length);

    if (withLocation.length > 0) {
        console.log(`   Ejemplo: ${withLocation[0].title} en (${withLocation[0].latitude}, ${withLocation[0].longitude})`);
    }

    // 3. Verificar categorización y prioridad
    const critical = incidents.filter(i => i.priority === 'CRITICAL');
    console.log('✅ Incidencias críticas:', critical.length);

    // 4. Verificar estados
    const pending = incidents.filter(i => i.status === 'PENDING');
    const inProgress = incidents.filter(i => i.status === 'IN_PROGRESS');
    console.log(`✅ Estados: ${pending.length} pendientes, ${inProgress.length} en progreso`);

    console.log('✅ Verificación de base de datos M12 completada');
}

verifyM12()
    .then(() => console.log('🚀 M12 Verificado correctamente'))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
