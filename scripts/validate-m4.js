
const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log('\n🧪 INICIANDO TEST DE INTEGRACIÓN M4\n');

    // 1. LOGIN ADMIN
    console.log('1️⃣  Logueando como Admin (admin@purpura.app)...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@purpura.app', password: 'admin123' }),
        headers: { 'Content-Type': 'application/json' }
    });

    if (!loginRes.ok) throw new Error(`Admin login falló: ${loginRes.status}`);

    // Obtener cookie correctamente (Node fetch maneja headers distinto a browser)
    const setCookie = loginRes.headers.get('set-cookie');
    if (!setCookie) throw new Error('No se recibió cookie de sesión');

    // Simplificación para reenviar cookie en siguientes requests
    const sessionCookie = setCookie.split(';')[0];
    const headers = { 'Content-Type': 'application/json', 'Cookie': sessionCookie };

    console.log('✅ Login Admin exitoso.');

    // 2. BUSCAR TERRITORIO
    console.log('2️⃣  Buscando territorio "La Plata"...');
    const terrRes = await fetch(`${BASE_URL}/api/territories`, { headers });
    const territories = await terrRes.json();

    // Debug: imprimir si no encuentra
    if (!Array.isArray(territories)) throw new Error('La API de territorios no devolvió un array');

    const laPlata = territories.find(t => t.name.includes("La Plata"));
    if (!laPlata) {
        console.error('Territorios disponibles:', territories.map(t => t.name));
        throw new Error('No se encontró "La Plata". ¿Ejecutaste el seed?');
    }
    console.log(`✅ Territorio encontrado: ${laPlata.name} (ID: ${laPlata.id})`);

    // 3. CREAR USUARIO
    const newUserEmail = `ref_${Date.now()}@test.com`;
    const newPass = 'Referente123!';

    console.log(`3️⃣  Creando usuario: ${newUserEmail} ...`);
    const createRes = await fetch(`${BASE_URL}/api/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Referente Test',
            email: newUserEmail,
            role: 'Referente',
            territoryId: laPlata.id,
            password: newPass
        })
    });

    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(`Fallo al crear usuario: ${JSON.stringify(createData)}`);
    console.log('✅ Usuario creado exitosamente.');

    // 4. LOGIN COMO NUEVO USUARIO
    console.log('4️⃣  Verificando login del nuevo usuario...');
    const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: newUserEmail, password: newPass }),
        headers: { 'Content-Type': 'application/json' }
    });

    const userData = await userLoginRes.json();
    if (!userLoginRes.ok) throw new Error(`Login del nuevo usuario falló: ${JSON.stringify(userData)}`);

    console.log('✅ Login del Referente exitoso.');

    // 5. VALIDAR DATOS DEL USUARIO
    if (userData.user.territory !== "La Plata") {
        throw new Error(`❌ Error de asignación: Se esperaba "La Plata", se recibió "${userData.user.territory}"`);
    }

    if (userData.user.role !== "Referente") {
        throw new Error(`❌ Error de rol: Se esperaba "Referente", se recibió "${userData.user.role}"`);
    }

    console.log('\n🎉 PRUEBA EXITOSA: El flujo de creación y login funciona correctamente.\n');
}

main().catch(err => {
    console.error('\n❌ TEST FALLÓ:', err.message);
    process.exit(1);
});
