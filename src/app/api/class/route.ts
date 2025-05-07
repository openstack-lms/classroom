import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/interfaces/api/Response";
import { GetClassesResponse, CreateClassRequest, CreateClassResponse, UpdateClassRequest, UpdateClassResponse } from "@/interfaces/api/Class";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

/**
 * GET /api/class
 * Retrieves all classes where the user is either a teacher or student
 * 
 * @returns {Promise<NextResponse<ApiResponse<GetClassesResponse>>>} List of classes with assignments due today
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "teacherInClass": [
 *       {
 *         "id": "class-id",
 *         "name": "Class Name",
 *         "subject": "Subject",
 *         "section": 1,
 *         "assignments": [...],
 *         "dueToday": [...]
 *       }
 *     ],
 *     "studentInClass": [...]
 *   }
 * }
 * 
 * @security Requires authentication
 * 
 * @remarks
 * - Returns separate lists for classes where user is teacher or student
 * - Includes assignments due today for each class
 * - Filters assignments based on current date
 */
export async function GET(): Promise<NextResponse<ApiResponse<GetClassesResponse>>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) return NextResponse.json({
        success: false,
        payload: {
            remark: ApiResponseRemark.UNAUTHORIZED,
        },
    });

    const teacherInClass = await prisma.class.findMany({
        where: {
            teachers: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            assignments: true,
        }
    });

    const studentInClass = await prisma.class.findMany({
        where: {
            students: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            assignments: true,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            teacherInClass: teacherInClass.map((cls) => ({
                ...cls,
                dueToday: cls.assignments.filter(
                    (assignment) => assignment.dueDate?.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
                )
            })),
            studentInClass: studentInClass.map((cls) => ({
                ...cls,
                dueToday: cls.assignments.filter(
                    (assignment) => assignment.dueDate?.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
                )
            })),
        },
    });    
}

/**
 * POST /api/class
 * Creates a new class with the current user as teacher
 * 
 * @param {Request} request - The incoming request object containing class details
 * @returns {Promise<NextResponse<ApiResponse<CreateClassResponse>>>} Created class information
 * 
 * @example
 * // Request body
 * {
 *   "name": "Class Name",
 *   "section": 1,
 *   "subject": "Subject"
 * }
 * 
 * @security Requires authentication
 * 
 * @remarks
 * - Creates a new class with provided details
 * - Automatically adds the current user as a teacher
 * - Returns the created class information
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<CreateClassResponse>>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const body: CreateClassRequest = await request.json();

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const newClass = await prisma.class.create({
        data: {
            name: body.name,
            section: body.section,
            subject: body.subject,
            teachers: {
                connect: {
                    id: userId,
                },
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            newClass,
        },
    });
}

/**
 * PUT /api/class
 * Updates an existing class's details
 * 
 * @param {Request} request - The incoming request object containing updated class details
 * @returns {Promise<NextResponse<ApiResponse<UpdateClassResponse>>>} Updated class information
 * 
 * @example
 * // Request body
 * {
 *   "id": "class-id",
 *   "name": "Updated Class Name",
 *   "section": 2,
 *   "subject": "Updated Subject"
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Verifies user is a teacher in the class
 * - Updates class name, section, and subject
 * - Returns the updated class information
 */
export async function PUT(request: Request): Promise<NextResponse<ApiResponse<UpdateClassResponse>>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const body: UpdateClassRequest = await request.json();

    const userId = await getUserFromToken(token || null);

    console.log(body)

    if (!userId)
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });

    const classToUpdate = await prisma.class.findUnique({
        where: {
            id: body.id,
            teachers: {
                some: {
                    id: userId,
                },
            },
        },
    });

    if (!classToUpdate) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const updatedClass = await prisma.class.update({
        where: {
            id: body.id,
        },
        data: {
            name: body.name,
            section: body.section || 'no',
            subject: body.subject,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            updatedClass,
        },
    });
}