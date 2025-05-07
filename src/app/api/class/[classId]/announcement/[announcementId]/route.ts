import { Announcement, AnnouncementSelectProps, CreateAnnouncementProps } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * PUT /api/class/[classId]/announcement/[announcementId]
 * Updates a specific announcement
 * 
 * @param {Request} request - The incoming request object containing updated announcement data
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class
 * @param {string} params.announcementId - The ID of the announcement to update
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "remarks": "Updated announcement content"
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Updates announcement content
 * - Verifies teacher permissions in the class
 * - Validates announcement existence
 */
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

/**
 * DELETE /api/class/[classId]/announcement/[announcementId]
 * Deletes a specific announcement
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class
 * @param {string} params.announcementId - The ID of the announcement to delete
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Removes an announcement from the class
 * - Verifies teacher permissions in the class
 * - Validates announcement existence
 */
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

/**
 * GET /api/class/[classId]/announcement/[announcementId]
 * Retrieves a specific announcement from a class
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class
 * @param {string} params.announcementId - The ID of the announcement to retrieve
 * @returns {Promise<NextResponse<ApiResponse<{announcement: Announcement}>>>} Announcement data or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "announcement": {
 *       "id": "announcement-id",
 *       "title": "Announcement Title",
 *       "content": "Announcement Content",
 *       "createdAt": "2024-03-20T00:00:00.000Z",
 *       ...
 *     }
 *   }
 * }
 * 
 * @security Requires authentication. User must be either a teacher or student in the class
 * 
 * @remarks
 * - Retrieves detailed information about a specific announcement
 * - Verifies user has access to the class
 * - Returns complete announcement data including all fields
 */
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