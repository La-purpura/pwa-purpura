import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "La Púrpura | Gestión Territorial",
    description: "Plataforma de gestión territorial y comunicados oficiales.",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "La Púrpura",
    },
};

import { NetworkStatus } from "@/components/shared/NetworkStatus";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
            </head>
            <body className={manrope.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <NetworkStatus />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
