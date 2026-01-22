const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando Seed M3...');

    // LIMPIEZA
    try {
        await prisma.postRead.deleteMany();
        await prisma.post.deleteMany();
        await prisma.auditLog.deleteMany();
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.alert.deleteMany();
        await prisma.request.deleteMany();
        await prisma.territory.deleteMany();
        await prisma.branch.deleteMany();
    } catch (e) { console.log('Base limpia o vacía'); }

    // 1. RAMAS
    const branches = ['Nacional', 'Profesional', 'PyMes', 'Deportes'];
    const branchMap = {};

    for (const name of branches) {
        const b = await prisma.branch.upsert({
            where: { name },
            update: {},
            create: { name }
        });
        branchMap[name] = b.id;
    }
    console.log('✅ Ramas creadas');

    // 2. TERRITORIOS
    const nacional = await prisma.territory.create({
        data: { name: 'Nacional', type: 'country' }
    });

    const buenosAires = await prisma.territory.create({
        data: { name: 'Buenos Aires', type: 'province', parentId: nacional.id }
    });

    const mendoza = await prisma.territory.create({
        data: { name: 'Mendoza', type: 'province', parentId: nacional.id }
    });

    await prisma.territory.create({
        data: { name: 'La Plata', type: 'locality', parentId: buenosAires.id }
    });

    const godoyCruz = await prisma.territory.create({
        data: { name: 'Godoy Cruz', type: 'locality', parentId: mendoza.id }
    });

    console.log('✅ Territorios creados');

    // 3. USUARIO ADMIN
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@purpura.app' },
        update: {
            territoryId: nacional.id,
            branchId: branchMap['Nacional']
        },
        create: {
            email: 'admin@purpura.app',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SuperAdminNacional',
            status: 'ACTIVE',
            territoryId: nacional.id,
            branchId: branchMap['Nacional']
        },
    });

    console.log('✅ Admin actualizado:', admin.email);

    // 4. USUARIO REFERENTE (M8 Test)
    const referente = await prisma.user.upsert({
        where: { email: 'referente.mendoza@purpura.app' },
        update: {
            territoryId: mendoza.id,
            branchId: branchMap['Deportes']
        },
        create: {
            email: 'referente.mendoza@purpura.app',
            name: 'Referente Mendoza',
            password: hashedPassword,
            role: 'Referente',
            status: 'ACTIVE',
            territoryId: mendoza.id,
            branchId: branchMap['Deportes']
        },
    });
    console.log('✅ Referente creado:', referente.email);

    // 5. SOLICITUDES INICIALES (M8)
    await prisma.request.create({
        data: {
            type: 'Relevamiento Social',
            data: JSON.stringify({ familias: 10, observacion: 'Necesidad de insumos básicos en Barrio Centro' }),
            status: 'pending',
            submittedById: referente.id,
            territoryId: mendoza.id
        }
    });
    console.log('✅ Solicitud inicial creada');

    // 6. COMUNICADOS INICIALES (M9)
    await prisma.post.create({
        data: {
            title: 'Bienvenido a La Púrpura',
            content: 'Estamos lanzando la nueva plataforma de gestión territorial.',
            type: 'news',
            authorId: admin.id
        }
    });

    await prisma.post.create({
        data: {
            title: 'URGENTE: Censo Territorial',
            content: 'Todos los referentes deben completar su censo antes del viernes.',
            type: 'urgent',
            authorId: admin.id,
            territoryId: nacional.id
        }
    });

    console.log('✅ Comunicados iniciales creados');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
