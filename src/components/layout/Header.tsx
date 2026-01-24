"use client";

import { useAppStore } from "@/lib/store";
import Link from "next/link";

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
}

export function Header({ title, subtitle, showBack }: HeaderProps) {
    const user = useAppStore((state) => state.user);

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center p-4 justify-between max-w-md mx-auto">
                <div className="flex items-center">
                    {showBack ? (
                        <Link
                            href="/home"
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[#171216] dark:text-white">arrow_back_ios_new</span>
                        </Link>
                    ) : (
                        <div className="text-primary flex size-10 items-center justify-center bg-primary/10 rounded-full">
                            <span className="material-symbols-outlined">map</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 px-3">
                    <h2 className="text-[#171216] dark:text-white text-lg font-bold leading-tight tracking-tight line-clamp-1">
                        {title || "La Púrpura"}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider line-clamp-1">
                        {subtitle || user?.territory || "Territorio Nacional"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/alerts"
                        className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">notifications</span>
                    </Link>
                    <Link
                        href="/settings"
                        className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">person</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
