"use client";

import { useAppStore } from "@/lib/store";

export function GlobalBanner() {
    const { globalAnnouncement, setGlobalAnnouncement } = useAppStore();

    if (!globalAnnouncement || !globalAnnouncement.isActive) return null;

    const bgColors = {
        info: "bg-blue-600",
        warning: "bg-orange-500",
        alert: "bg-red-600",
        success: "bg-green-600"
    };

    const icons = {
        info: "info",
        warning: "warning",
        alert: "campaign",
        success: "check_circle"
    };

    return (
        <div className={`${bgColors[globalAnnouncement.type]} text-white px-4 py-3 shadow-md animate-in slide-in-from-top-full duration-300 relative z-50`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined filled animate-pulse">{icons[globalAnnouncement.type]}</span>
                    <p className="font-bold text-sm md:text-base leading-tight">
                        {globalAnnouncement.message}
                    </p>
                </div>
                <button
                    onClick={() => setGlobalAnnouncement(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    );
}
