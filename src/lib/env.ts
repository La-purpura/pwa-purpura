export function validateEnv() {
    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Faltan variables de entorno críticas: ${missing.join(', ')}`);
    }

    if (!process.env.DATABASE_URL?.startsWith('postgresql://') && !process.env.DATABASE_URL?.startsWith('postgres://')) {
        throw new Error('DATABASE_URL debe ser una URL de PostgreSQL válida (postgresql://...)');
    }
}

// Ejecutar validación al importar
if (process.env.NODE_ENV !== 'test') {
    validateEnv();
}
