import { GetSubmissionsResponse, SubmissionSelectArgs } from "@/interfaces/api/Class";
import { ApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { Submission } from "@/interfaces/api/Class";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

/**
 * GET /api/class/[classId]/assignment/[assignmentId]/submissions
 * Retrieves all submissions for a specific assignment
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.assignmentId - The ID of the assignment
 * @returns {Promise<NextResponse<ApiResponse<GetSubmissionsResponse>>>} List of submissions or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "submissions": [
 *       {
 *         "id": "submission-id",
 *         "submittedAt": "2024-03-20T00:00:00.000Z",
 *         "assignment": {...},
 *         ...
 *       }
 *     ]
 *   }
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Retrieves all submissions for the specified assignment
 * - Verifies teacher permissions in the class
 * - Includes complete submission data with assignment details
 * - Returns submissions in chronological order
 */
export async function GET (_: Request, { params }: { params: { assignmentId: string } }): Promise<NextResponse<ApiResponse<GetSubmissionsResponse>>> {
    const cookieStore = cookies();
    const assignmentId = params.assignmentId;

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

    if (!assignmentId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
            },
        });
    }

    const classId = (await prisma.assignment.findFirst({
        where: {
            id: params.assignmentId,
        },
        select: {
            classId: true,
        },
    }))?.classId;

    if (!classId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "assignment",
            },
        });
    }

    const teacherInClass = userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }
    
    const submissions: Submission[] = await prisma.submission.findMany({
        where: {
            assignmentId,
        },
        select: {               
            ...SubmissionSelectArgs,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            submissions,
        },
    });
}