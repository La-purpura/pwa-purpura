
"use client";

import { useSyncStatus } from "@/hooks/useSyncStatus";
import { Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncIndicator({ className }: { className?: string }) {
    const { status, label, details, stats } = useSyncStatus();

    const getIcon = () => {
        switch (status) {
            case 'offline': return <CloudOff className="w-4 h-4" />;
            case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'pending': return <Cloud className="w-4 h-4 text-amber-500" />; // Or custom icon
            case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Cloud className="w-4 h-4" />;
        }
    };

    const getColor = () => {
        switch (status) {
            case 'offline': return 'text-gray-500 bg-gray-100 border-gray-200';
            case 'syncing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'error': return 'text-red-600 bg-red-50 border-red-200';
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'synced': return 'text-green-600 bg-green-50 border-green-200 opacity-50 hover:opacity-100 transition-opacity';
            default: return 'text-gray-500';
        }
    };

    // If synced and no stats, maybe hide after a while? For now always show.
    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-help",
            getColor(),
            className
        )} title={details || label}>
            {getIcon()}
            <span className="hidden sm:inline">{label}</span>
            {stats.conflictCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {stats.conflictCount}
                </span>
            )}
            {details && status !== 'synced' && status !== 'error' && (
                <span className="text-[10px] opacity-80 hidden md:inline ml-1">
                    ({details})
                </span>
            )}
        </div>
    );
}
