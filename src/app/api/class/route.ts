import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/interfaces/api/Response";
import { GetClassesResponse, CreateClassRequest, CreateClassResponse, UpdateClassRequest, UpdateClassResponse } from "@/interfaces/api/Class";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function GET(): Promise<NextResponse<ApiResponse<GetClassesResponse>>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) return NextResponse.json({
        success: false,
        payload: {
            remark: "Unauthorized",
        },
    });

    const teacherInClass = await prisma.class.findMany({
        where: {
            teachers: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            assignments: true,
        }
    });

    const studentInClass = await prisma.class.findMany({
        where: {
            students: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            assignments: true,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            teacherInClass: teacherInClass.map((cls) => ({
                ...cls,
                dueToday: cls.assignments.filter(
                    (assignment) => assignment.dueDate?.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
                )
            })),
            studentInClass: studentInClass.map((cls) => ({
                ...cls,
                dueToday: cls.assignments.filter(
                    (assignment) => assignment.dueDate?.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
                )
            })),
        },
    });    
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<CreateClassResponse>>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const body: CreateClassRequest = await request.json();

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    const newClass = await prisma.class.create({
        data: {
            name: body.name,
            section: Number(body.section),
            subject: body.subject,
            teachers: {
                connect: {
                    id: userId,
                },
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            newClass,
        },
    });
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<UpdateClassResponse>>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const body: UpdateClassRequest = await request.json();

    const userId = await getUserFromToken(token || null);

    if (!userId)
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });

    const classToUpdate = await prisma.class.findUnique({
        where: {
            id: body.id,
            teachers: {
                some: {
                    id: userId,
                },
            },
        },
    });

    if (!classToUpdate) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "No permission",
            },
        });
    }

    const updatedClass = await prisma.class.update({
        where: {
            id: body.id,
        },
        data: {
            name: body.name,
            section: Number(body.section),
            subject: body.subject,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            updatedClass,
        },
    });
}