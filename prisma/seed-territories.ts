const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Poblando jerarquía de territorios (PBA)...');

    // 1. Pais
    const pais = await prisma.territory.upsert({
        where: { id: 'nacional' },
        update: {},
        create: { id: 'nacional', name: 'Nacional', type: 'country' }
    });

    // 2. Provincia
    const pba = await prisma.territory.upsert({
        where: { id: 'pba' },
        update: { parentId: pais.id },
        create: { id: 'pba', name: 'Provincia de Buenos Aires', type: 'province', parentId: pais.id }
    });

    // Secciones Electorales
    const secciones = [
        { id: 'sec1', name: 'Sección Electoral 1', municipios: ['Campana', 'Escobar', 'General San Martín', 'Hurlingham', 'Ituzaingó', 'José C. Paz', 'Luján', 'Malvinas Argentinas', 'Merlo', 'Moreno', 'Morón', 'Pilar', 'San Fernando', 'San Isidro', 'San Miguel', 'Tigre', 'Tres de Febrero', 'Vicente López'] },
        { id: 'sec2', name: 'Sección Electoral 2', municipios: ['Arrecifes', 'Baradero', 'Capitán Sarmiento', 'Pergamino', 'Ramallo', 'San Nicolás', 'San Pedro'] },
        { id: 'sec3', name: 'Sección Electoral 3', municipios: ['Almirante Brown', 'Avellaneda', 'Berazategui', 'Berisso', 'Cañuelas', 'Ensenada', 'Esteban Echeverría', 'Ezeiza', 'Florencio Varela', 'La Matanza', 'Lanús', 'Lomas de Zamora', 'Quilmes', 'San Vicente'] },
        { id: 'sec4', name: 'Sección Electoral 4', municipios: ['Bragado', 'Chacabuco', 'Chivilcoy', 'Junín', 'Lincoln', 'Pehuajó', 'Trenque Lauquen'] },
        { id: 'sec5', name: 'Sección Electoral 5', municipios: ['Ayacucho', 'Balcarce', 'Castelli', 'Chascomús', 'Dolores', 'General Pueyrredón', 'Mar Chiquita', 'Pinamar', 'Villa Gesell'] },
        { id: 'sec6', name: 'Sección Electoral 6', municipios: ['Bahía Blanca', 'Coronel Rosales', 'Coronel Suárez', 'Patagones', 'Tres Arroyos'] },
        { id: 'sec7', name: 'Sección Electoral 7', municipios: ['Azul', 'Bolívar', 'Olavarría', 'Saladillo', 'Veinticinco de Mayo'] },
        { id: 'sec8', name: 'Sección Electoral 8', municipios: ['La Plata'] },
    ];

    for (const sec of secciones) {
        const s = await prisma.territory.upsert({
            where: { id: sec.id },
            update: { parentId: pba.id },
            create: { id: sec.id, name: sec.name, type: 'section', parentId: pba.id }
        });

        for (const muni of sec.municipios) {
            await prisma.territory.create({
                data: {
                    name: muni,
                    type: 'locality',
                    parentId: s.id
                }
            });
        }
    }

    console.log('✅ Jerarquía completada.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
