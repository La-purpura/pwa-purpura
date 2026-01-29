
'use client';

import React, { useState, useEffect } from 'react';

export const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner && isOnline) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[9999] p-2 text-center text-xs font-bold transition-all duration-300 transform ${isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                } ${showBanner ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">
                    {isOnline ? 'cloud_done' : 'cloud_off'}
                </span>
                {isOnline ? '¡Estás en línea!' : 'Sin conexión a internet - Modo offline'}
                {isOnline && (
                    <button
                        onClick={() => window.location.reload()}
                        className="ml-2 underline"
                    >
                        Sincronizar ahora
                    </button>
                )}
            </div>
        </div>
    );
};
