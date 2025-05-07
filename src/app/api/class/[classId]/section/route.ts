import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { CreateSectionRequest, UpdateSectionRequest, DeleteSectionRequest } from "@/interfaces/api/Class";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

/**
 * POST /api/class/[classId]/section
 * Creates a new section in the specified class
 * 
 * @param {Request} request - The incoming request object containing section data
 * @param {Object} params - Route parameters
 * @param {string} params.classId - The ID of the class to create the section in
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "name": "Section Name"
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Creates a new section with the specified name
 * - Associates the section with the class
 * - Verifies teacher permissions
 */
export async function POST(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const body: CreateSectionRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
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

    await prisma.section.create({
        data: {
            name: body.name,
            class: {
                connect: {
                    id: params.classId,
                }
            }
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "section created",
        },
    });
}

/**
 * PUT /api/class/[classId]/section
 * Updates an existing section in the class
 * 
 * @param {Request} request - The incoming request object containing section data
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "id": "section-id",
 *   "name": "Updated Section Name",
 *   "classId": "class-id"
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Updates the name of an existing section
 * - Verifies teacher permissions in the class
 * - Validates section existence
 */
export async function PUT(
    request: Request
): Promise<NextResponse<DefaultApiResponse>> {
    const body: UpdateSectionRequest = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, body.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    await prisma.section.update({
        where: {
            id: body.id,
        },
        data: {
            name: body.name,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "section edited",
        },
    });
}

/**
 * DELETE /api/class/[classId]/section
 * Deletes a section from the class
 * 
 * @param {Request} request - The incoming request object containing section data
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "id": "section-id",
 *   "classId": "class-id"
 * }
 * 
 * @security Requires authentication. User must be a teacher in the class
 * 
 * @remarks
 * - Removes a section from the class
 * - Verifies teacher permissions in the class
 * - Validates section existence
 */
export async function DELETE(
    request: Request
): Promise<NextResponse<DefaultApiResponse>> {
    const body: DeleteSectionRequest = await request.json();
    const cookieStore = cookies();  
    const token = cookieStore.get("token")?.value;
    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, body.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    await prisma.section.delete({
        where: {
            id: body.id,
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "section deleted",
        },
    });
}