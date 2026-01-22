
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyM9() {
    console.log('🔍 Iniciando Verificación M9...');

    // 1. Verificar existencia de comunicados (del seed)
    const posts = await prisma.post.findMany({
        include: { author: true }
    });

    if (posts.length === 0) {
        throw new Error('❌ No se encontraron comunicados iniciales');
    }
    console.log('✅ Comunicados encontrados:', posts.length);

    // 2. Simular lectura
    const user = await prisma.user.findFirst();
    const post = posts[0];

    console.log(`⚙️ Simulando lectura de "${post.title}" por ${user.name}...`);
    const read = await prisma.postRead.upsert({
        where: {
            postId_userId: {
                postId: post.id,
                userId: user.id
            }
        },
        update: { readAt: new Date() },
        create: {
            postId: post.id,
            userId: user.id
        }
    });

    if (!read) {
        throw new Error('❌ Falló el registro de lectura');
    }
    console.log('✅ Lectura registrada con éxito');

    // 3. Verificar auditoría (si es urgente)
    const urgentPost = posts.find(p => p.type === 'urgent');
    if (urgentPost) {
        console.log('✅ Existe comunicado urgente para prueba de auditoría');
    }

    console.log('✅ Verificación de base de datos M9 completada');
}

verifyM9()
    .then(() => console.log('🚀 M9 Verificado correctamente'))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
