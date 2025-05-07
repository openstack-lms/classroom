import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { JoinClassRequest } from "@/interfaces/api/Class";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

/**
 * POST /api/class/join
 * Allows a user to join a class using a class code
 * 
 * @param {Request} request - The incoming request object containing the class code
 * @returns {Promise<NextResponse<DefaultApiResponse>>} Success or error response
 * 
 * @example
 * // Request body
 * {
 *   "code": "class-session-id"
 * }
 * 
 * @security Requires authentication
 * 
 * @remarks
 * - Validates the class code exists
 * - Checks if user is already in the class
 * - Adds user as a student to the class
 * - Creates submission entries for all existing assignments
 */
export async function POST(request: Request): Promise<NextResponse<DefaultApiResponse>> {
    // Get and validate user authentication
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const body: JoinClassRequest = await request.json();

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    // Validate request body
    if (!body.code) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                subject: "class code",
            },
        });
    }

    // Find class by session code
    const classToJoin = await prisma.class.findFirst({
        where: {
            sessions: {
                some: {
                    id: body.code
                }
            }
        }
    });

    if (!classToJoin) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "class",
            },
        });
    }

    // Check if user is already in the class
    const userInClass = await prisma.class.findFirst({
        where: {
            id: classToJoin.id,
            OR: [
                { teachers: { some: { id: userId } } },
                { students: { some: { id: userId } } }
            ]
        }
    });

    if (userInClass) {
        return NextResponse.json({
            success: true,
            payload: {
                remark: ApiResponseRemark.SUCCESS,
            },
        });
    }

    // Add user to class
    await prisma.class.update({
        where: { id: classToJoin.id },
        data: {
            students: {
                connect: { id: userId }
            }
        }
    });

    // @todo: fix this mess... deleting member doesn't delete their assignments.
    // const assignments = await prisma.assignment.findMany({
    //     where: { classId: classToJoin.id }
    // });
    
    // for (const assignment of assignments) {
    //     await prisma.submission.create({
    //         data: {
    //             assignmentId: assignment.id,
    //             studentId: userId,
    //         },
    //     });
    // }

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "joined class",
        },
    });
}