import { Grade } from "@/interfaces/api/Class";
import { ApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/class/[classId]/grades/user/[userId]
 * Retrieves grades for a specific user in a class
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class
 * @param {string} params.userId - The ID of the user whose grades to retrieve
 * @returns {Promise<NextResponse<ApiResponse<{ grades: Grade[] }>>>} List of grades or error response
 * 
 * @security Requires authentication. User must be either the student or a teacher in the class
 * 
 * @remarks
 * - Retrieves all graded submissions for the specified user
 * - Includes assignment details with each grade
 * - Verifies user has permission to view grades
 */
export async function GET (request: Request, { params }: { params: { classId: string; userId: string }}): Promise<NextResponse<ApiResponse<{ grades: Grade[] }>>> {
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
    // check if grades belong to user / requester is teacher of user

    const gradesToGet = await prisma.submission.findMany({
        where: {
            OR: [
                {
                    student: {
                        id: userId,
                    }
                },
                {
                    assignment: {
                        class: {
                            teachers: {
                                some: {
                                    id: userId,
                                }
                            }
                        }
                    }
                }
            ],
            student: {
                id: params.userId,
            },
            assignment: {
                class: {
                    id: params.classId,
                },
                graded: true,
            },
        },
        select: {
            id: true,
            gradeReceived: true,
            assignment: {
                select: {
                    id: true,
                    maxGrade: true,
                    title: true,
                    weight: true,
                }
            }
        }
    })

    if (!gradesToGet) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "grades",
            }
        });
    }      

    return NextResponse.json({
        success: true,
        payload: {
            grades: gradesToGet,
        }
    })
}