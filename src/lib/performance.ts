
import crypto from 'crypto';

/**
 * Generates an ETag for a set of items based on their IDs and updatedAt timestamps.
 */
export function generateETag(items: any[]): string {
    const hash = crypto.createHash('md5');
    items.forEach(item => {
        hash.update(`${item.id}:${item.updatedAt || item.createdAt}`);
    });
    return `W/"${hash.digest('hex')}"`;
}

/**
 * Validates If-None-Match header and returns 304 if it matches.
 */
export function validateETag(request: Request, items: any[]): { status: 304 } | null {
    const ifNoneMatch = request.headers.get('if-none-match');
    const etag = generateETag(items);

    if (ifNoneMatch === etag) {
        return { status: 304 };
    }
    return null;
}
