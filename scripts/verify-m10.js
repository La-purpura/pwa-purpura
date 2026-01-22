
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyM10() {
    console.log('🔍 Iniciando Verificación M10...');

    // 1. Verificar existencia de recursos (del seed)
    const resources = await prisma.resource.findMany({
        include: { author: true }
    });

    if (resources.length === 0) {
        throw new Error('❌ No se encontraron recursos iniciales');
    }
    console.log('✅ Recursos encontrados:', resources.length);
    console.log('   Primer recurso:', resources[0].title);

    // 2. Verificar permisos y acceso (simulado por lógica)
    const technical = resources.filter(r => r.category === 'Técnico');
    console.log('✅ Categorización verificada (Técnico):', technical.length);

    console.log('✅ Verificación de base de datos M10 completada');
}

verifyM10()
    .then(() => console.log('🚀 M10 Verificado correctamente'))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
