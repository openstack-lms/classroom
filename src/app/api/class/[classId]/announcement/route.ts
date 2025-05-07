import { Announcement, AnnouncementSelectProps, CreateAnnouncementProps } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/class/[classId]/announcement
 * Creates a new announcement in the class
 * 
 * @param {Request} request - The incoming request object containing announcement data
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class to create the announcement in
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "remarks": "New announcement content"
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Creates a new announcement with the specified content
 * - Associates the announcement with the class and teacher
 * - Verifies teacher permissions in the class
 */
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

/**
 * GET /api/class/[classId]/announcement
 * Retrieves all announcements for a specific class
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class
 * @returns {Promise<NextResponse<ApiResponse<{announcements: Announcement[]}>>>} List of announcements or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "announcements": [
 *       {
 *         "id": "announcement-id",
 *         "title": "Announcement Title",
 *         "content": "Announcement Content",
 *         "createdAt": "2024-03-20T00:00:00.000Z",
 *         ...
 *       }
 *     ]
 *   }
 * }
 * 
 * @security Requires authentication. User must be either a teacher or student in the class
 * 
 * @remarks
 * - Retrieves all announcements for the specified class
 * - Verifies user has access to the class
 * - Returns announcements in chronological order
 * - Includes complete announcement data for each entry
 */
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