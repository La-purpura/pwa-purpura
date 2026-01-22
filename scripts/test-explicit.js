
const { Client } = require('pg');

console.log("Testing connection with explicit params...");

const client = new Client({
    user: 'postgres',
    host: 'db.mhmgrwodxgrttmzfusmp.supabase.co',
    database: 'postgres',
    password: '2015@AituyLeon',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅ Conexión exitosa (Password correcto)!');
        client.end();
    })
    .catch(e => {
        console.error('❌ Error de conexión:', e.message);
        process.exit(1);
    });
