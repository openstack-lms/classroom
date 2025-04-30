import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { CreateSectionRequest, UpdateSectionRequest, DeleteSectionRequest } from "@/interfaces/api/Class";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

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
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, params.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
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
            remark: ApiResponseRemark.SUCCESS,
            subject: "section created",
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
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, body.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
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
            remark: ApiResponseRemark.SUCCESS,
            subject: "section edited",
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
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, body.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
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
            remark: ApiResponseRemark.SUCCESS,
            subject: "section deleted",
        },
    });
}