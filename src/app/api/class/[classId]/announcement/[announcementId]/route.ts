import { Announcement, AnnouncementSelectProps, CreateAnnouncementProps } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { classId: string, announcementId: string } }): Promise<NextResponse<DefaultApiResponse>> {
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


    const announcementToChange = await prisma.announcement.findUnique({
        where: {
            id: params.announcementId,
            teacher: {
                id: userId,
            }
        },
    });

    if (!announcementToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "announcement",
            },
        });
    }


    const body: CreateAnnouncementProps = await request.json();

    await prisma.announcement.update({
        where: {
            id: params.announcementId,
        },
        data: {
            remarks: body.remarks,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "announcement updated",
        }
    });
}

export async function DELETE(request: Request, { params }: { params: { classId: string, announcementId: string } }): Promise<NextResponse<DefaultApiResponse>> {
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


    const announcementToChange = await prisma.announcement.findUnique({
        where: {
            id: params.announcementId,
            teacher: {
                id: userId,
            }
        },
    });

    if (!announcementToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "announcement",
            },
        });
    }

    await prisma.announcement.delete({
        where: {
            id: params.announcementId,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "announcement deleted",
        }
    });
}


export async function GET(request: Request, { params }: { params: { classId: string, announcementId: string } }): Promise<NextResponse<ApiResponse<{announcement: Announcement}>>> {
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


    const announcementToGet = await prisma.announcement.findUnique({
        where: {
            id: params.announcementId,
            teacher: {
                id: userId,
            }
        },
        select: {
            ...AnnouncementSelectProps,
        },
    });

    if (!announcementToGet) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "announcement",
            },
        });
    }


    return NextResponse.json({
        success: true,
        payload: {
            announcement: announcementToGet,
        }
    });
}