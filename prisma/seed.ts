const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario Admin Inicial
    const admin = await prisma.user.upsert({
        where: { email: 'admin@purpura.app' },
        update: {},
        create: {
            email: 'admin@purpura.app',
            name: 'Super Admin',
            password: hashedPassword,
            role: 'SuperAdminNacional',
            status: 'ACTIVE',
        },
    });

    console.log({ admin });
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
