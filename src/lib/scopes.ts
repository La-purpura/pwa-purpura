import prisma from "@/lib/prisma";

/**
 * Recupera todos los IDs de territorios descendientes (recursivo).
 * Optimización: Cargar todo el árbol en memoria (si es pequeño) o usar CTEs.
 * Dado que Prisma no soporta CTEs nativos fácilmente sin raw query, y el árbol de territorios raramente cambia,
 * podemos hacer fetch de todos y filtrar en memoria, o hacer consultas recursivas.
 * Para < 1000 territorios, memoria es fine.
 */
export async function getDescendantTerritoryIds(rootIds: string[]): Promise<string[]> {
    if (rootIds.length === 0) return [];

    // Fetch all territories (optimize: cache this)
    const allTerritories = await prisma.territory.findMany({
        select: { id: true, parentId: true }
    });

    const descendants = new Set<string>(rootIds);
    let queue = [...rootIds];

    while (queue.length > 0) {
        const currentId = queue.pop();
        if (!currentId) continue;

        const children = allTerritories
            .filter(t => t.parentId === currentId)
            .map(t => t.id);

        for (const childId of children) {
            if (!descendants.has(childId)) {
                descendants.add(childId);
                queue.push(childId);
            }
        }
    }

    return Array.from(descendants);
}

/**
 * Obtiene el scope efectivo de un usuario:
 * Su territorio base + territorios en UserScope + todos sus descendientes.
 */
export async function getUserEffectiveTerritoryIds(userId: string): Promise<string[]> {
    // @ts-ignore
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            territoryId: true,
            // @ts-ignore
            scopes: { select: { territoryId: true } },
            role: true
        }
    });

    if (!user) return [];

    if (user.role === 'SuperAdminNacional') {
        return [];
    }

    const directIds = new Set<string>();
    if (user.territoryId) directIds.add(user.territoryId);

    // @ts-ignore
    if (user.scopes) {
        // @ts-ignore
        user.scopes.forEach((s: any) => directIds.add(s.territoryId));
    }

    return getDescendantTerritoryIds(Array.from(directIds));
}
