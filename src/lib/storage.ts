
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_BUCKET = process.env.R2_BUCKET || "pwa-purpura-files";
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

let s3Client: S3Client | null = null;

function getClient() {
    if (!s3Client) {
        if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
            console.warn("Storage credentials missing. File operations will fail.");
            // We return a client anyway but it might fail on operations if envs are missing. 
            // Better to throw or return null? I'll let it fail at operation time or use basic mock logic if needed?
            // User requested "Storage real".
        }

        s3Client = new S3Client({
            region: "auto",
            endpoint: R2_ENDPOINT,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID || "",
                secretAccessKey: R2_SECRET_ACCESS_KEY || "",
            },
        });
    }
    return s3Client;
}

/**
 * Uploads a file buffer to R2/S3.
 * Returns the object Key.
 */
export async function uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
): Promise<string> {
    const client = getClient();
    const key = `${Date.now()}-${fileName}`;

    await client.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
    }));

    return key;
}

/**
 * Generates a signed URL for reading a file.
 * Valid for 1 hour.
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
    const client = getClient();
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key
    });

    return await getSignedUrl(client, command, { expiresIn: 3600 });
}

/**
 * Deletes a file from storage.
 */
export async function deleteFile(key: string): Promise<void> {
    const client = getClient();
    await client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key
    }));
}
