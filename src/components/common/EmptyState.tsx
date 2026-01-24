"use client";

import { ReactNode } from "react";

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="size-24 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-6 shadow-sm">
                <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">{icon}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-xs font-medium leading-relaxed">{description}</p>
            {action && <div className="mt-8">{action}</div>}
        </div>
    );
}
