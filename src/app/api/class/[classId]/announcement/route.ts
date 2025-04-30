import { Announcement, AnnouncementSelectProps, CreateAnnouncementProps } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { classId: string } }): Promise<NextResponse<DefaultApiResponse>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
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
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "class",
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
            remark: ApiResponseRemark.SUCCESS,
            subject: "announcement created",
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
                remark: ApiResponseRemark.UNAUTHORIZED,
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
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "class",
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