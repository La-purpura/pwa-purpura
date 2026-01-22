#!/usr/bin/env node

/**
 * Script para cambiar entre base de datos local (SQLite) y producción (Supabase)
 * 
 * Uso:
 *   node scripts/switch-db.js local
 *   node scripts/switch-db.js production
 */

const fs = require('fs');
const path = require('path');

const mode = process.argv[2];

if (!mode || !['local', 'production'].includes(mode)) {
    console.error('❌ Uso: node scripts/switch-db.js [local|production]');
    process.exit(1);
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

if (mode === 'local') {
    console.log('🔄 Cambiando a SQLite (desarrollo local)...');
    schema = schema.replace(/provider = "postgresql"/, 'provider = "sqlite"');
    console.log('✅ Schema actualizado a SQLite');
    console.log('📝 No olvides actualizar DATABASE_URL en .env a: file:./dev.db');
} else {
    console.log('🔄 Cambiando a PostgreSQL (producción)...');
    schema = schema.replace(/provider = "sqlite"/, 'provider = "postgresql"');
    console.log('✅ Schema actualizado a PostgreSQL');
    console.log('📝 No olvides actualizar DATABASE_URL en .env con tu URL de Supabase');
}

fs.writeFileSync(schemaPath, schema);
console.log('🎉 Cambio completado!');
