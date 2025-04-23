import prisma from '@/lib/prisma';

export const getUserFromToken = async (token: string | null) => {
    if (!token) {
        return null;
    }
    
    const session = await prisma.session.findFirst({
        where: {
            id: token,
        },
    });

    if (!session || !session.userId) {
        return null;
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
        return null;
    }

    return session.userId;
}