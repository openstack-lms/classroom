import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { CreateSectionRequest, UpdateSectionRequest, DeleteSectionRequest } from "@/interfaces/api/Class";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function POST(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const body: CreateSectionRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, params.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    await prisma.section.create({
        data: {
            name: body.name,
            class: {
                connect: {
                    id: params.classId,
                }
            }
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Section creation successful',
        },
    });
}

export async function PUT(
    request: Request
): Promise<NextResponse<DefaultApiResponse>> {
    const body: UpdateSectionRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, body.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    await prisma.section.update({
        where: {
            id: body.id,
        },
        data: {
            name: body.name,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Section edited successfully',
        },
    });
}

export async function DELETE(
    request: Request
): Promise<NextResponse<DefaultApiResponse>> {
    const body: DeleteSectionRequest = await request.json();
    const cookieStore = cookies();  
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, body.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    await prisma.section.delete({
        where: {
            id: body.id,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Section deleted successfully',
        },
    });
}

export async function generateStaticParams() {
    return [{ classId: 'placeholder' }];
}