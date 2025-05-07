import { PersonalEvent, PersonalEventSelectArgs, UpdatePersonalEventRequest } from "@/interfaces/api/Agenda";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/agenda/personal/[pEventId]
 * Retrieves a specific personal event
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.pEventId - The ID of the personal event to retrieve
 * @returns {Promise<NextResponse<ApiResponse<{event: PersonalEvent}>>>} Event data or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "event": {
 *       "id": "event-id",
 *       "title": "Event Title",
 *       "startTime": "2024-03-20T00:00:00.000Z",
 *       "endTime": "2024-03-20T01:00:00.000Z",
 *       ...
 *     }
 *   }
 * }
 * 
 * @security Requires authentication. User must own the event
 * 
 * @remarks
 * - Retrieves detailed information about a personal event
 * - Verifies user ownership of the event
 * - Returns complete event data including all fields
 */
export async function GET (request: Request, { params }: { params: { pEventId: string }}): Promise<NextResponse<ApiResponse<{event: PersonalEvent}>>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            }
        });
    }

    const eventToGet = await prisma.event.findUnique({
        where: {
            id: params.pEventId,
            user: {
                id: userId,
            }
        },
        select: {
            ...PersonalEventSelectArgs,
        }
    });

    if (!eventToGet) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "event",
            }
        });
    }

    return NextResponse.json({
        success: true,
        payload: {
            event: eventToGet,
        }
    })
}

/**
 * PUT /api/agenda/personal/[pEventId]
 * Updates a specific personal event
 * 
 * @param {Request} request - The incoming request object containing updated event data
 * @param {Object} params - Route parameters
 * @param {string} params.pEventId - The ID of the personal event to update
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "title": "Updated Event Title",
 *   "startTime": "2024-03-20T00:00:00.000Z",
 *   "endTime": "2024-03-20T01:00:00.000Z",
 *   ...
 * }
 * 
 * @security Requires authentication. User must own the event
 * 
 * @remarks
 * - Updates event details including title, times, and other properties
 * - Verifies user ownership of the event
 * - Validates event existence
 */
export async function PUT (request: Request, { params }: { params: { pEventId: string }}): Promise<NextResponse<DefaultApiResponse>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            }
        });
    }

    const body: UpdatePersonalEventRequest = await request.json();    

    const eventToEdit = await prisma.event.findUnique({
        where: {
            id: params.pEventId,
            user: {
                id: userId,
            }
        }
    });

    if (!eventToEdit) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "event",
            }
        });
    }

    await prisma.event.update({
        where: {
            id: params.pEventId,
            user: {
                id: userId,
            },
        },
        data: {
            ...body,
        }
    })

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "event edited",
        }
    });
}