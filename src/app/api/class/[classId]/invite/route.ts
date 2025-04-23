import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { generateInviteCode } from "@/lib/generateInviteCode";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { ApiResponse } from "@/interfaces/api/Response";
import { ClassInviteResponse } from "@/interfaces/api/Class";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

// POST /api/class/[classId]/invite
// SECURITY Level 3: Class Teacher
export async function POST(
    _: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<ApiResponse<ClassInviteResponse>>> {
    const classId = params.classId;
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
    
    const session = await prisma.session.create({
        data: {
            id: generateInviteCode(),
            class: {
                connect: {
                    id: classId,
                }
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            session,
        }
    });
}

// GET /api/class/[classId]/invite
export async function GET(
    _: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<ApiResponse<ClassInviteResponse>>> {
    const classId = params.classId;
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

    const classToChange = await prisma.class.findFirst({
        where: {
            id: classId,
        },
        select: {
            sessions: {
                select: {
                    id: true,
                }
            }
        }
    });

    if (!classToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            }
        });
    }

    if (!classToChange.sessions.length) {
        const session = await prisma.session.create({
            data: {
                id: generateInviteCode(),
                class: {
                    connect: {
                        id: classId,
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            payload: {
                session,
            }
        });
    }

    return NextResponse.json({
        success: true,
        payload: {
            session: classToChange.sessions[classToChange.sessions.length - 1],
        }
    });
}

export async function generateStaticParams() {
    return [{ classId: 'placeholder' }];
}