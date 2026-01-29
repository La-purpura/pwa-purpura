
'use client';

import React, { useState } from 'react';
import { compressImage, generateThumbnail, validateFileLimits } from '@/lib/client/compression';

interface FileUploadProps {
    ownerType: string;
    ownerId: string;
    onUploadComplete?: (attachment: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ ownerType, ownerId, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState<{ before: number, after: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setStats(null);
        setProgress(0);

        // 1. Validar límites
        const validation = validateFileLimits(file);
        if (!validation.valid) {
            setError(validation.error || 'Archivo inválido');
            return;
        }

        setUploading(true);

        try {
            let fileToUpload = file;
            let thumbnailKey = null;

            // 2. Comprimir si es imagen
            if (file.type.startsWith('image/')) {
                setProgress(10);
                const compressed = await compressImage(file);
                fileToUpload = compressed.file;
                setStats({ before: compressed.originalSize, after: compressed.compressedSize });

                setProgress(30);
                // Generar Thumbnail
                const thumbFile = await generateThumbnail(file);

                // 3. Subir Thumbnail primero
                setProgress(40);
                const thumbPresignRes = await fetch('/api/uploads/presign', {
                    method: 'POST',
                    body: JSON.stringify({ fileName: thumbFile.name, mimeType: thumbFile.type, fileSize: thumbFile.size })
                });
                const thumbPresign = await thumbPresignRes.json();

                await fetch(thumbPresign.uploadUrl, {
                    method: 'PUT',
                    body: thumbFile,
                    headers: { 'Content-Type': thumbFile.type }
                });
                thumbnailKey = thumbPresign.key;
            }

            // 4. Subir Archivo Principal
            setProgress(60);
            const presignRes = await fetch('/api/uploads/presign', {
                method: 'POST',
                body: JSON.stringify({ fileName: fileToUpload.name, mimeType: fileToUpload.type, fileSize: fileToUpload.size })
            });
            const presign = await presignRes.json();

            setProgress(80);
            await fetch(presign.uploadUrl, {
                method: 'PUT',
                body: fileToUpload,
                headers: { 'Content-Type': fileToUpload.type }
            });

            // 5. Commit a la DB
            setProgress(90);
            const commitRes = await fetch('/api/attachments/commit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: file.name,
                    fileKey: presign.key,
                    thumbnailKey,
                    fileSize: fileToUpload.size,
                    mimeType: fileToUpload.type,
                    ownerType,
                    ownerId
                })
            });

            const attachment = await commitRes.json();
            setProgress(100);
            if (onUploadComplete) onUploadComplete(attachment);

        } catch (err: any) {
            setError(err.message || 'Error durante la subida');
        } finally {
            setUploading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer"
            />

            {uploading && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-purple-600 mt-1 font-medium text-center">Subiendo... {progress}%</p>
                </div>
            )}

            {stats && (
                <div className="mt-3 flex justify-between text-[11px] font-mono text-gray-500 px-1">
                    <span>Original: {formatSize(stats.before)}</span>
                    <span className="text-green-600 font-bold">Optimizado: {formatSize(stats.after)}</span>
                    <span className="text-green-600 font-bold">-{Math.round((1 - stats.after / stats.before) * 100)}%</span>
                </div>
            )}

            {error && (
                <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
};
