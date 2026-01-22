const { Client } = require('pg');

console.log("Testing NEW Supabase project connection...");

const client = new Client({
    user: 'postgres',
    host: 'db.rlxcxgrwtvxqsxoxtybd.supabase.co',
    database: 'postgres',
    password: 'vUz.$#9pH*P9+MA',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        console.log('✅ Conexión exitosa a Supabase!');
        return client.query('SELECT version()');
    })
    .then(res => {
        console.log('📊 PostgreSQL version:', res.rows[0].version);
        client.end();
    })
    .catch(e => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    });
