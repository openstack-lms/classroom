import { Announcement, AnnouncementSelectProps, CreateAnnouncementProps } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function POST(request: Request, { params }: { params: { classId: string } }): Promise<NextResponse<DefaultApiResponse>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            },
        });
    }

    const classToChange = await prisma.class.findUnique({
        where: {
            id: params.classId,
            teachers: {
                some: {
                    id: userId,
                }
            }
        }
    });

    if (!classToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Class not found',
            },
        });
    }

    const body: CreateAnnouncementProps = await request.json();

    await prisma.announcement.create({
        data: {
            remarks: body.remarks,
            teacher: {
                connect: {
                    id: userId,
                },
            },
            class: {
                connect: {
                    id: params.classId,
                },
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Creation success',
        }
    });
}


export async function GET(request: Request, { params }: { params: { classId: string, announcementId: string } }): Promise<NextResponse<ApiResponse<{announcements: Announcement[]}>>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            },
        });
    }

    const classToChange = await prisma.class.findUnique({
        where: {
            id: params.classId,
            OR: [
                {
                    teachers: {
                        some: {
                            id: userId,
                        },
                    },
                },
                {
                    students: {
                        some: {
                            id: userId,
                        },
                    },
                },
            ],
        },
    });

    if (!classToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Class not found',
            },
        });
    }


    const announcementsToGet = await prisma.announcement.findMany({
        where: {
            class: {
                id: params.classId,
            }
        },
        select: {
            ...AnnouncementSelectProps,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            announcements: announcementsToGet,
        }
    });
}

export async function generateStaticParams() {
    return [{ classId: 'placeholder' }];
}