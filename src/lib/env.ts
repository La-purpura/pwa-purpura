export function validateEnv() {
    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        const msg = `Faltan variables de entorno críticas: ${missing.join(', ')}`;

        // En Vercel Build, estas variables pueden no estar disponibles.
        // Solo lanzamos error si NO estamos en el proceso de build de Vercel.
        // Esto permite que el build termine y el error se reporte en runtime si es necesario.
        if (process.env.VERCEL === '1' || process.env.NODE_ENV === 'test') {
            console.warn(`⚠️ [BUILD WARNING]: ${msg}`);
            return;
        }

        throw new Error(msg);
    }

    if (!process.env.DATABASE_URL?.startsWith('postgresql://') && !process.env.DATABASE_URL?.startsWith('postgres://')) {
        const dbError = 'DATABASE_URL debe ser una URL de PostgreSQL válida (postgresql://...)';
        if (process.env.VERCEL === '1') {
            console.warn(`⚠️ [BUILD WARNING]: ${dbError}`);
            return;
        }
        throw new Error(dbError);
    }
}

// Ejecutar validación al importar
if (process.env.NODE_ENV !== 'test') {
    validateEnv();
}
