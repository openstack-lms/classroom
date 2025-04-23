import prisma from "./prisma";

export const userIsTeacherInClass = async (userId: string, classId: string) => {
    const _class = await prisma.class.findFirst({
        where: {
            id: classId,
            teachers: {
                some: {
                    id: userId,
                },
            },
        },
    });

    if (!_class) {
        return false;
    }
    if (_class) {
        return true;
    }
}