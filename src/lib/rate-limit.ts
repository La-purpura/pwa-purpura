
import { NextRequest } from 'next/server';

interface RateLimitConfig {
    limit: number;
    windowMs: number;
}

// In-Memory store for simplified rate limiting on Edge (Map is per isolate, but acceptable for soft limiting)
// For strict distributed limiting, Redis (Upstash) is required.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * Basic generic Rate Limit implementation compatible with Edge Runtime.
 * Identifies users by IP or Token.
 */
export function rateLimit(request: NextRequest, config: RateLimitConfig = { limit: 100, windowMs: 60 * 1000 }) {
    const ip = request.ip || 'anonymous';
    const token = request.cookies.get('session')?.value;
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
