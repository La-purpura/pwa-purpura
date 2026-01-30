
import { NextRequest } from 'next/server';

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(requestOrIp: NextRequest | string, config: RateLimitConfig = { limit: 100, windowMs: 60 * 1000 }) {
    let ip = 'anonymous';
    let token: string | undefined;

    if (typeof requestOrIp === 'string') {
        ip = requestOrIp;
    } else {
        // Safe access if it's NextRequest
        const req = requestOrIp as NextRequest;
        ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
        token = req.cookies.get('session')?.value;
    }

    const key = token ? `token:${token}` : `ip:${ip}`;

    const now = Date.now();
    const record = rateLimitMap.get(key) || { count: 0, lastReset: now };

    if (now - record.lastReset > config.windowMs) {
        record.count = 0;
        record.lastReset = now;
    }

    record.count += 1;
    rateLimitMap.set(key, record);

    const isRateLimited = record.count > config.limit;

    return {
        isRateLimited,
        info: {
            limit: config.limit,
            remaining: Math.max(0, config.limit - record.count),
            reset: new Date(record.lastReset + config.windowMs).toISOString()
        }
    };
}
