import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
    level: LogLevel;
    message: string;
    requestId?: string;
    userId?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    latencyMs?: number;
    error?: any;
    timestamp: string;
    [key: string]: any; // Metadata extra
}

/**
 * Logger estructurado para backend.
 * Genera logs en formato JSON para fácil ingestión (Datadog, CloudWatch, etc).
 */
export class Logger {
    private static formatError(error: any) {
        if (error instanceof Error) {
            return {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause
            };
        }
        return error;
    }

    private static log(entry: Omit<LogEntry, 'timestamp'>) {
        const { error, ...rest } = entry;
        const logData: LogEntry = {
            ...rest,
            error: error ? this.formatError(error) : undefined,
            timestamp: new Date().toISOString()
        } as LogEntry;

        // En desarrollo, pretty print para legibilidad
        if (process.env.NODE_ENV === 'development') {
            const color = entry.level === 'error' ? '\x1b[31m' : entry.level === 'warn' ? '\x1b[33m' : '\x1b[36m';
            const reset = '\x1b[0m';
            console.log(`${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`, {
                ...logData,
                message: undefined,
                level: undefined,
                timestamp: undefined
            });
        } else {
            // En producción, JSON puro de una línea
            console.log(JSON.stringify(logData));
        }
    }

    static info(message: string, meta: Partial<LogEntry> = {}) {
        this.log({ level: 'info', message, ...meta });
    }

    static warn(message: string, meta: Partial<LogEntry> = {}) {
        this.log({ level: 'warn', message, ...meta });
    }

    static error(message: string, meta: Partial<LogEntry> = {}) {
        this.log({ level: 'error', message, ...meta });
    }

    static debug(message: string, meta: Partial<LogEntry> = {}) {
        if (process.env.LOG_LEVEL === 'debug') {
            this.log({ level: 'debug', message, ...meta });
        }
    }
}
