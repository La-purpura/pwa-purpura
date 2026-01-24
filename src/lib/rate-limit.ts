/**
 * Simple In-Memory Rate Limiter for Next.js API Routes (Serverless environments will reset this frequently, but it's a start)
 * Forproduction, use Upstash Redis or a similar external store.
 */

const trackers = new Map<string, { count: number; lastReset: number }>();

interface RateLimitOptions {
    limit: number;
    windowMs: number;
}

export function rateLimit(ip: string, options: RateLimitOptions) {
    const now = Date.now();
    const trackerKey = ip;

    const tracker = trackers.get(trackerKey) || { count: 0, lastReset: now };

    // Check if window has expired
    if (now - tracker.lastReset > options.windowMs) {
        tracker.count = 0;
        tracker.lastReset = now;
    }

    tracker.count++;
    trackers.set(trackerKey, tracker);

    return {
        success: tracker.count <= options.limit,
        current: tracker.count,
        limit: options.limit,
        remaining: Math.max(0, options.limit - tracker.count),
        reset: tracker.lastReset + options.windowMs
    };
}
