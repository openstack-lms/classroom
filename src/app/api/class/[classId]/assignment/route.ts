import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { CreateAssignmentRequest, UpdateAssignmentRequest, DeleteAssignmentRequest } from "@/interfaces/api/Class";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import prisma from "@/lib/prisma";

/**
 * POST /api/class/[classId]/assignment
 * Creates a new assignment in the specified class
 * 
 * @param {Request} request - The incoming request object containing assignment data
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class to create the assignment in
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @security Requires authentication. User must be a teacher in the class
 */
export async function POST(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    // Validate request parameters
    if (!params.classId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                subject: "classId is required",
            },
        });
    }

    // Get and validate user authentication
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

    // Verify teacher permissions
    const teacherInClass = await userIsTeacherInClass(userId, params.classId);
    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
                subject: "User must be a teacher in the class",
            },
        });
    }

    // Parse and validate request body
    const body: CreateAssignmentRequest = await request.json();
    const { title, instructions, dueDate, files, maxGrade, graded, weight, sectionId } = body;

    if (!title || !instructions || !dueDate || !files) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                subject: "Missing required fields",
            },
        });
    }

    // Get class data for creating submissions
    const classToChange = await prisma.class.findFirst({
        where: {
            id: params.classId,
            teachers: {
                some: { id: userId }
            }
        },
        include: {
            students: {
                select: { id: true }
            }
        }
    });

    if (!classToChange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
                subject: "Class not found or user is not a teacher",
            },
        });
    }

    // Upload files
    const uploadResponse = await fetch(`http://localhost:3000/api/upload/bulk`, {
        method: 'POST',
        credentials: "same-origin",
        mode: "cors",
        headers: {
            'Content-type': 'application/json',
            'Cookie': `token=${token}`,
        },
        body: JSON.stringify({ files }),
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
                subject: "Failed to upload files",
            },
        });
    }

    // Create assignment with all related data
    try {
        const assignment = await prisma.assignment.create({
            data: {
                title,
                instructions,
                dueDate: new Date(dueDate),
                maxGrade,
                graded,
                weight,
                class: {
                    connect: { id: params.classId }
                },
                attachments: {
                    connect: uploadResult.payload.files.map((file: { id: string }) => ({
                        id: file.id
                    }))
                },
                ...(sectionId && {
                    section: {
                        connect: { id: sectionId }
                    }
                }),
                submissions: {
                    create: classToChange.students.map((student: { id: string }) => ({
                        student: {
                            connect: { id: student.id }
                        }
                    }))
                },
                teacher: {
                    connect: { id: userId }
                }
            },
            include: {
                submissions: true,
                attachments: true,
                section: true,
                teacher: true,
                class: true
            }
        });

        return NextResponse.json({
            success: true,
            payload: {
                remark: ApiResponseRemark.SUCCESS,
                subject: "Assignment created successfully",
                assignmentId: assignment.id,
                assignment: assignment
            }
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
                subject: "Failed to create assignment"
            }
        });
    }
}

/**
 * DELETE /api/class/[classId]/assignment
 * Deletes an assignment from the specified class
 * 
 * @param {Request} request - The incoming request object containing assignment ID
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class containing the assignment
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @security Requires authentication. User must be a teacher in the class
 */
export async function DELETE(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    // Validate request parameters
    if (!params.classId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                subject: "classId is required",
            },
        });
    }

    // Get and validate user authentication
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

    // Parse and validate request body
    const body: DeleteAssignmentRequest = await request.json();
    const { id: assignmentId } = body;

    if (!assignmentId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                subject: "Assignment ID is required",
            },
        });
    }

    // Verify teacher permissions
    const teacherInClass = await userIsTeacherInClass(userId, params.classId);
    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
                subject: "User must be a teacher in the class",
            },
        });
    }

    // Delete the assignment
    try {
        await prisma.assignment.delete({
            where: { id: assignmentId }
        });

        return NextResponse.json({
            success: true,
            payload: {
                remark: ApiResponseRemark.SUCCESS,
                subject: "Assignment deleted successfully"
            }
        });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
                subject: "Failed to delete assignment"
            }
        });
    }
}