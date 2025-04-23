import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { MemberRequest } from "@/interfaces/api/Class";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

// POST /api/class/[classId]/member
// SECURITY Level 3: Class Teacher

export async function POST(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const { classId } = params;
    const body: MemberRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!body || !body.id || !body.type) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Invalid request',
            }
        });
    }

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: body.id }
    });

    if (!user) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'User not found',
            }
        });
    }

    const parsedType = body.type === 'teacher' ? 'teachers' : 'students';

    await prisma.class.update({
        where: { id: classId },
        data: {
            [parsedType]: {
                connect: { id: user.id }
            }
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Member added',
        }
    });
}

// DELETE /api/class/[classId]/member
// SECURITY Level 3: Class Teacher

export async function DELETE(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const { classId } = params;
    const body: MemberRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    const type = body.type === 'teacher' ? "teachers" : "students";

    const classToChange = await prisma.class.findUnique({
        where: { id: classId },
        select: {
            students: { select: { id: true } },
            teachers: { select: { id: true } },
        },
    });

    if (!classToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Class not found',
            }
        });
    }

    await prisma.class.update({
        where: { id: classId },
        data: {
            [type]: {
                disconnect: { id: body.id }
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Member removed',
        },
    });
}

// PUT /api/class/[classId]/member
// SECURITY Level 3: Class Teacher

export async function PUT(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const { classId } = params;
    const body: MemberRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!body || !body.id || !body.type) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Invalid request',
            }
        });
    }

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    const user = await prisma.user.findUnique({
        where: { id: body.id }
    });

    if (!user) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'User not found',
            }
        });
    }

    const newRole = body.type === 'teacher' ? 'teachers' : 'students';
    const oldRole = body.type === 'teacher' ? 'students' : 'teachers';

    await prisma.class.update({
        where: { id: classId },
        data: {
            [newRole]: { connect: { id: body.id } },
            [oldRole]: { disconnect: { id: body.id } }
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Member role changed',
        }
    });
}

export async function generateStaticParams() {
    return [{ classId: 'placeholder' }];
}