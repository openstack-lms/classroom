import { ClassEventSelectArgs, GetAgendaResponse, PersonalEventSelectArgs } from "@/interfaces/api/Agenda";
import { ApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getWeekStartAndEnd(weekStart: string) {
    try {
        const startDate = new Date(weekStart);
        if (isNaN(startDate.getTime())) {
            return null;
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        
        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        };
    } catch {
        return null;
    }
}

/**
 * GET /api/agenda/[weekStart]
 * Retrieves all events (personal and class) for a specific week
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.weekStart - The start date of the week in ISO format
 * @returns {Promise<NextResponse<ApiResponse<GetAgendaResponse>>>} List of events or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "events": {
 *       "personal": [...],
 *       "class": [...]
 *     }
 *   }
 * }
 * 
 * @security Requires authentication
 * 
 * @remarks
 * - Retrieves both personal and class events for the specified week
 * - Includes events from all classes where user is teacher or student
 * - Validates week start date format
 * - Returns events grouped by type (personal/class)
 */
export async function GET(request: Request, { params }: { params: { weekStart: string }}): Promise<NextResponse<ApiResponse<GetAgendaResponse>>> {
    const dateRange = getWeekStartAndEnd(params.weekStart);
    if (!dateRange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
            },
        });
    }

    const cookieStore = cookies();

    if (!cookieStore.get('token')) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const session = await prisma.session.findFirst({
        where: {
            id: cookieStore.get('token')!.value,
        },
    });

    if (!session || !session.userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "session",
            },
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    id: session.id
                },
            }
        },
    });

    if (!user) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "user",
            },
        });
    }

    const personalEvents = await prisma.event.findMany({
        where: {
            userId: user.id,
            startTime: {
                gte: dateRange.start,
                lte: dateRange.end
            },
        },
        select: PersonalEventSelectArgs
    });

    const userClasses = await prisma.class.findMany({
        where: {
            OR: [
                {
                    students: {
                        some: {
                            id: user.id
                        }
                    },
                },
                {
                    teachers: {
                        some: {
                            id: user.id,
                        }
                    }
                }
            ]   
        },
    });

    const classEvents = await prisma.event.findMany({
        where: {
            classId: {
                in: userClasses.map((c) => c.id)
            },
            startTime: {
                gte: dateRange.start,
                lte: dateRange.end
            },
        },
        select: ClassEventSelectArgs,
    });

    return NextResponse.json({
        success: true,
        payload: {
            events: {
                personal: personalEvents,
                class: classEvents
            },
        },
    });
}

