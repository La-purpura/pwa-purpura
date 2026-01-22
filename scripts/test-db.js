
require('dotenv').config();
const { Client } = require('pg');

console.log("Testing connection to:", process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

client.connect()
    .then(() => {
        console.log('✅ Conexión exitosa a Supabase!');
        client.end();
    })
    .catch(e => {
        console.error('❌ Error de conexión:', e.message);
        process.exit(1);
    });
