
import imageCompression from 'browser-image-compression';

export interface CompressionResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    width: number;
    height: number;
}

export const LIMITS = {
    IMAGE: {
        MAX_ORIGINAL_SIZE: 5 * 1024 * 1024, // 5MB
        TARGET_SIZE: 1, // 1MB
        MAX_DIMENSION: 1600,
        QUALITY: 0.75
    },
    PDF: {
        MAX_SIZE: 15 * 1024 * 1024 // 15MB default
    }
};

/**
 * Comprime una imagen en el cliente antes de subirla.
 */
export async function compressImage(file: File, options?: { maxWidth?: number, quality?: number }): Promise<CompressionResult> {
    const originalSize = file.size;

    const compressionOptions = {
        maxSizeMB: LIMITS.IMAGE.TARGET_SIZE,
        maxWidthOrHeight: options?.maxWidth || LIMITS.IMAGE.MAX_DIMENSION,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: options?.quality || LIMITS.IMAGE.QUALITY
    };

    try {
        const compressedFile = await imageCompression(file, compressionOptions);

        // Obtener dimensiones finales
        const img = new Image();
        const objectUrl = URL.createObjectURL(compressedFile);

        return new Promise((resolve) => {
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                resolve({
                    file: new File([compressedFile], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' }),
                    originalSize,
                    compressedSize: compressedFile.size,
                    width: img.width,
                    height: img.height
                });
            };
            img.src = objectUrl;
        });
    } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        throw error;
    }
}

/**
 * Genera un thumbnail de 320px.
 */
export async function generateThumbnail(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.1, // Muy pequeño
        maxWidthOrHeight: 320,
        useWebWorker: true,
        fileType: 'image/webp'
    };

    try {
        const thumbBlob = await imageCompression(file, options);
        return new File([thumbBlob], "thumb_" + file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
    } catch (error) {
        console.error('Error generando thumbnail:', error);
        throw error;
    }
}

/**
 * Valida límites de archivo según tipo.
 */
export function validateFileLimits(file: File): { valid: boolean, error?: string } {
    if (file.type.startsWith('image/')) {
        if (file.size > LIMITS.IMAGE.MAX_ORIGINAL_SIZE) {
            return { valid: false, error: `La imagen original no debe superar los 5MB (Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
        }
    } else if (file.type === 'application/pdf') {
        if (file.size > LIMITS.PDF.MAX_SIZE) {
            return { valid: false, error: `El PDF no debe superar los 15MB (Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
        }
    }
    return { valid: true };
}
