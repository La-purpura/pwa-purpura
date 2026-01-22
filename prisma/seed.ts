const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando Seed M3...');

    // LIMPIEZA (Solo para dev, borra todo para reiniciar IDs)
    // Comentar si se quiere preservar datos
    try {
        await prisma.auditLog.deleteMany();
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.alert.deleteMany();
        await prisma.request.deleteMany();
        // await prisma.user.deleteMany(); // Dejamos users si queremos
        await prisma.territory.deleteMany(); // Reseteamos estructura territorial
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
    // Root
    const nacional = await prisma.territory.create({
        data: { name: 'Nacional', type: 'country' }
    });

    // Provincias
    const buenosAires = await prisma.territory.create({
        data: { name: 'Buenos Aires', type: 'province', parentId: nacional.id }
    });

    const mendoza = await prisma.territory.create({
        data: { name: 'Mendoza', type: 'province', parentId: nacional.id }
    });

    // Localidades
    await prisma.territory.create({
        data: { name: 'La Plata', type: 'locality', parentId: buenosAires.id }
    });

    await prisma.territory.create({
        data: { name: 'Vicente López', type: 'locality', parentId: buenosAires.id }
    });

    await prisma.territory.create({
        data: { name: 'Godoy Cruz', type: 'locality', parentId: mendoza.id }
    });

    console.log('✅ Territorios creados');

    // 3. USUARIO ADMIN
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Upsert user
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
