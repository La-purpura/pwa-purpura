import prisma from "@/lib/prisma";

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    data: any = null
) {
    try {
        // optimización: podriamos pasar settings si ya los tenemos, pero fetch es seguro
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { settings: true }
        });

        if (!user) return;

        // @ts-ignore
        const settings = (user.settings as any) || {};
        const pref = settings.notifications || 'all';

        if (pref === 'none') return;
        if (pref === 'critical' && type !== 'error' && type !== 'warning') return;

        // @ts-ignore
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                data: data ? data : undefined // JSON type handles object directly usually? check schema
            }
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}
