import { Assignment, AssignmentSelectArgs, DeleteAssignmentRequest, GetAssignmentResponse, UpdateAssignmentRequest } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/class/[classId]/assignment/[assignmentId]
 * Retrieves detailed information about a specific assignment
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.assignmentId - The ID of the assignment to retrieve
 * @returns {Promise<NextResponse<ApiResponse<GetAssignmentResponse>>>} Assignment data or error response
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "remark": "SUCCESS",
 *     "assignmentData": {
 *       "id": "assignment-id",
 *       "title": "Assignment Title",
 *       "instructions": "Assignment Instructions",
 *       "dueDate": "2024-03-20T00:00:00.000Z",
 *       "sections": [...],
 *       ...
 *     },
 *     "classId": "class-id"
 *   }
 * }
 * 
 * @security Requires authentication. User must be either a teacher or student in the class
 * 
 * @remarks
 * - Retrieves assignment details including sections
 * - Verifies user has access to the class
 * - Returns assignment data with associated class information
 */
export async function GET (request: Request, params: { params: { assignmentId: string }}): Promise<NextResponse<ApiResponse<GetAssignmentResponse>>> {
    const assignmentId = params.params.assignmentId;

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
    
    const requestedAssignment = await prisma.assignment.findUnique({
        where: {
            id: assignmentId,
        },
    });

    const requestedClass = await prisma.class.findFirst({
        where: {
            assignments: {
                some: {
                    id: requestedAssignment?.id,
                }
            }
        },
        select: {
            id: true,
            students: {
                select: {
                    id: true,
                },
            },
            teachers: {
                select: {
                    id: true,
                },
            },
        },
    });
    if (!requestedClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "class",
            },
        })
    }

    if (!requestedClass?.students.filter(student => student.id == userId).length && !requestedClass?.teachers.filter(teacher => teacher.id == userId).length) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            }
        });
    }

    const assignmentProps = await prisma.assignment.findUnique({
        where: {
            id: assignmentId,
        },
        select: {
            ...AssignmentSelectArgs
        }
    });

    const sections = await prisma.section.findMany({
        where: {
            classId: requestedClass.id,
        },
        select: {
            id: true,
            name: true,
        }
    });

    

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            assignmentData: {
                ...assignmentProps,
                sections: sections,
            },
            classId: requestedClass.id,
        }
    });
}


/**
 * PUT /api/class/[classId]/assignment/[assignmentId]
 * Updates an existing assignment
 * 
 * @param {Request} request - The incoming request object containing updated assignment data
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class containing the assignment
 * @param {string} params.assignmentId - The ID of the assignment to update
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "title": "Updated Title",
 *   "instructions": "Updated Instructions",
 *   "dueDate": "2024-03-20T00:00:00.000Z",
 *   "newAttachments": [...],
 *   "removedAttachments": [...],
 *   "section": { "id": "section-id" },
 *   "graded": true,
 *   "maxGrade": 100,
 *   "weight": 1
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Updates assignment details including title, instructions, due date
 * - Handles file attachments (add/remove)
 * - Updates grading settings
 * - Verifies teacher permissions
 */
export async function PUT(
    request: Request,
    { params }: { params: { classId: string, assignmentId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const body: UpdateAssignmentRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!params.classId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
            },
        });
    }

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, params.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const {
        title,
        instructions,
        dueDate,
        newAttachments,
        removedAttachments,
        section,
        graded,
        maxGrade,
        weight,
    }: UpdateAssignmentRequest = body;

    const req = await fetch(`http://localhost:3000/api/upload/bulk`, {
        method: 'POST',
        credentials: "same-origin",
        mode: "cors",
        headers: {
            'Content-type': 'application/json',
            'Cookie': `token=${token}`,
        },
        body: JSON.stringify({
            files: newAttachments,
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

    const assignment = await prisma.assignment.update({
        where: {
            id: params.assignmentId,
        },
        data: {
            title,
            instructions,
            dueDate: new Date(dueDate!.toString()),
            graded,
            maxGrade: graded ? maxGrade : 0,
            weight,
            section: {...((!section || section.id == 'none' || !section.id) ? {
                disconnect: true,
            } : {
                connect: {
                    id: section.id,
                },
            })},
            attachments: {
                connect: [
                    ...res.payload.files.map((file: { id: string }) => ({
                        id: file.id,
                    })),
                ],
                delete: [
                    ...removedAttachments.map((file: { id: string }) => ({
                        id: file.id
                    })),
                ],
            },
        }
    });

    if (!assignment) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
            },
        });
    }  
    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "assignment updated",
        }
    });
}


/**
 * DELETE /api/class/[classId]/assignment/[assignmentId]
 * Deletes an assignment
 * 
 * @param {Request} request - The incoming request object
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class containing the assignment
 * @param {string} params.assignmentId - The ID of the assignment to delete
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Permanently deletes the assignment
 * - Removes all associated submissions
 * - Verifies teacher permissions
 * - Returns success status
 */
export async function DELETE(
    request: Request,
    { params }: { params: { classId: string, assignmentId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const classId = params.classId;

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

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            }
        });
    }

    const classToChange = await prisma.class.findFirst({
        where: {
            id: classId,
            teachers: {
                some: {
                    id: userId,
                }
            }
        },
        select: {
            students: {
                select: {
                    id: true,
                },
            },
            teachers: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!classToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            }
        });
    }

    await prisma.assignment.delete({
        where: {
            id: params.assignmentId,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "assignment deleted",
        }
    });
}