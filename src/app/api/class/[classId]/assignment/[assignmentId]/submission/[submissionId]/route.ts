import { CreateUpdateAnnotationRequest, FileSelectArgs, GetSubmissionResponse, Submission, SubmissionSelectArgs } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/assignment/[assignmentId]/submission/[submissionId]
// SECURITY Level 4: Class Teacher

/**
 * GET /api/class/[classId]/assignment/[assignmentId]/submission/[submissionId]
 * Retrieves a specific submission with detailed information
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.assignmentId - The ID of the assignment
 * @param {string} params.submissionId - The ID of the submission to retrieve
 * @returns {Promise<NextResponse<ApiResponse<GetSubmissionResponse>>>} Submission data or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "submissionData": {
 *       "id": "submission-id",
 *       "submittedAt": "2024-03-20T00:00:00.000Z",
 *       "late": false,
 *       "assignment": {...},
 *       ...
 *     }
 *   }
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Retrieves detailed submission information including late status
 * - Verifies teacher permissions in the class
 * - Includes associated assignment data
 * - Calculates whether submission is late based on due date
 */
export async function GET(request: Request, { params }: { params: { assignmentId: string, submissionId: string } }): Promise<NextResponse<ApiResponse<GetSubmissionResponse>>> {
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

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const getSubmission: Submission | null = await prisma.submission.findFirst({
        where: {
            id: params.submissionId,
            assignment: {
                class: {
                    teachers: {
                        some: {
                            id: userId,
                        },
                    },
                }
            }
        },
        select: {
            ...SubmissionSelectArgs,
        },
    });

    if (!getSubmission) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "submission",
            },
        });
    }

    return NextResponse.json({
        success: true,
        payload: {
            submissionData: {
                ...getSubmission,
                late: (getSubmission.submittedAt ? new Date(new Date(getSubmission.submittedAt).toISOString().slice(0,10)) : new Date(new Date().toISOString().slice(0,10))) > new Date(getSubmission.assignment.dueDate!.toISOString().slice(0,10)),
            },
        },
    });
}

// PUT /api/assignment/[assignmentId]/submission/[submissionId]
// SECURITY Level 4: Class Teacher
// For attaching files to a student submission

/**
 * PUT /api/class/[classId]/assignment/[assignmentId]/submission/[submissionId]
 * Updates a submission with grades and annotations
 * 
 * @param {Request} request - The incoming request object containing submission updates
 * @param {Object} params - Route parameters
 * @param {string} params.assignmentId - The ID of the assignment
 * @param {string} params.submissionId - The ID of the submission to update
 * @returns {Promise<NextResponse<ApiResponse<DefaultApiResponse>>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "gradeReceived": 85,
 *   "newAttachments": [...],
 *   "removedAttachments": [...],
 *   "return": false
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Updates submission grade and annotations
 * - Handles file attachments (add/remove)
 * - Can mark submission as returned/unreturned
 * - Verifies teacher permissions in the class
 * - Validates submission existence
 */
export async function PUT(request: Request, { params }: { params: { assignmentId: string, submissionId: string } }): Promise<NextResponse<ApiResponse<DefaultApiResponse>>> {
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

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const getSubmission = await prisma.submission.findFirst({
        where: {
            id: params.submissionId,
            assignment: {
                class: {
                    teachers: {
                        some: {
                            id: userId,
                        },
                    },
                }
            }
        },
        include: {
            attachments: true,
            student: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    if (!getSubmission) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "submission",
            },
        });
    }

    const body: CreateUpdateAnnotationRequest = await request.json();

    if (body.return) { // If request is to return submission (done by teacher)
        const submission = await prisma.submission.findUnique({
            where: {
                id: getSubmission.id,
            },
        });

        await prisma.submission.update({
            where: {
                id: getSubmission.id,
            },
            data: {
                returned: submission?.returned ? false : true,
            },
        });

        return NextResponse.json({
            success: true,
            payload: {
                remark: ApiResponseRemark.SUCCESS,
                subject: "submission returned",
            },
        });
    }

    const req = await fetch ('http://localhost:3000/api/upload/bulk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `token=${cookieStore.get('token')!.value}`,
        },
        body: JSON.stringify({
            files: body.newAttachments,
        }),
    });

    const res = await req.json();

    if (!res.success) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
            },
        });
    }

    await prisma.submission.update({
        where: {
            id: getSubmission.id,
        },
        data: {
            gradeReceived: body.gradeReceived,
            annotations: {
                connect: res.payload.files?.map((attachment: any) => {
                    return {
                        id: attachment.id,
                    };
                }),
                deleteMany: body.removedAttachments.map((attachment: any) => {
                    return {
                        id: attachment.id,
                    };
                }),
            }
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "submission updated",
        },
    });
}