import prisma from "@/lib/prisma";

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    data: any = null
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                data: data ? JSON.stringify(data) : undefined
            }
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}
