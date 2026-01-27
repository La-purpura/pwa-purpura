"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function Home() {
    const router = useRouter();
    const { user } = useAppStore();

    useEffect(() => {
        if (user) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    if (user) return null;

    return (
        <main className="min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-[3rem] p-10 shadow-2xl border border-gray-100 dark:border-gray-800 text-center">
                <div className="flex flex-col items-center mb-10">
                    <div className="size-24 bg-[#851c74] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6 group hover:rotate-6 transition-transform">
                        <span className="material-symbols-outlined text-white text-6xl">token</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">La Púrpura</h1>
                    <p className="text-[#851c74] font-black text-[10px] uppercase tracking-[0.3em]">Gestión Territorial v2.1</p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-3 w-full bg-[#851c74] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#6a165d] shadow-lg shadow-purple-900/10 transition-all active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined text-xl">login</span>
                        Acceder al Sistema
                    </Link>

                    <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                            Uso exclusivo para<br />agentes autorizados
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-full shadow-sm">
                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nodos operativos en línea</p>
                </div>
            </div>
        </main>
    );
}
