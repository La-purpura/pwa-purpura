
import { db } from './db';

const MAX_IMAGE_SIZE = 1920; // px
const THUMBNAIL_SIZE = 320; // px
const QUALITY = 0.8;

interface ComputedFile {
    file: File;
    originalSize: number;
    compressedSize: number;
}

/**
 * Compresses an image client-side.
 */
export async function compressImage(file: File): Promise<ComputedFile> {
    if (!file.type.startsWith('image/')) {
        return { file, originalSize: file.size, compressedSize: file.size };
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Resize if too big
            if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                if (width > height) {
                    height = Math.round((height * MAX_IMAGE_SIZE) / width);
                    width = MAX_IMAGE_SIZE;
                } else {
                    width = Math.round((width * MAX_IMAGE_SIZE) / height);
                    height = MAX_IMAGE_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Compression failed"));
                    return;
                }
                const compressedFile = new File([blob], file.name, {
                    type: 'image/webp', // Force WebP for better compression
                    lastModified: Date.now(),
                });
                resolve({
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: compressedFile.size
                });
            }, 'image/webp', QUALITY);
        };
        img.onerror = error => reject(error);
    });
}

/**
 * Generates a thumbnail.
 */
export async function generateThumbnail(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                height = Math.round((height * THUMBNAIL_SIZE) / width);
                width = THUMBNAIL_SIZE;
            } else {
                width = Math.round((width * THUMBNAIL_SIZE) / height);
                height = THUMBNAIL_SIZE;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], `thumb_${file.name}`, { type: 'image/webp' }));
                } else {
                    reject(new Error("Thumbnail generation failed"));
                }
            }, 'image/webp', 0.6);
        };
        img.onerror = reject;
    });
}

/**
 * Validates file constraints.
 */
export function validateFileLimits(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE_MB = 10;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return { valid: false, error: `El archivo excede el límite de ${MAX_SIZE_MB}MB.` };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: 'Formato de archivo no soportado.' };
    }

    return { valid: true };
}

/**
 * Handles offline upload queuing.
 */
export async function queueUpload(file: File, ownerId: string, type: 'task' | 'incident' | 'profile') {
    // 1. Compress
    const { file: optimizedFile } = await compressImage(file);

    // 2. Local Preview (store blob locally?)
    // Storing large blobs in IndexedDB can degrade performance, but for offline pending uploads it's necessary.
    // We should clean them up after sync.

    const attachmentId = globalThis.crypto.randomUUID();

    await db.attachments.add({
        id: attachmentId,
        owner_id: ownerId,
        type: type, // 'task_attachment', 'profile_picture'
        status: 'pending_upload',
        file: optimizedFile, // Binary stored locally temporarily
        mimeType: optimizedFile.type,
        size: optimizedFile.size,
        name: optimizedFile.name,
        createdAt: new Date().toISOString()
    });

    await db.uploads_queue.add({
        attachmentId: attachmentId,
        status: 'pending',
        retry_count: 0,
        createdAt: new Date().toISOString()
    });

    return attachmentId;
}
