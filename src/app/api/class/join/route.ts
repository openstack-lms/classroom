import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { JoinClassRequest } from "@/interfaces/api/Class";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function POST(request: Request): Promise<NextResponse<DefaultApiResponse>> {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const body: JoinClassRequest = await request.json();

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Unauthorized",
            },
        });
    }

    if (!body.code) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "No class code provided",
            },
        });
    }

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
                remark: "Class not found",
            },
        });
    }

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
            success: false,
            payload: {
                remark: "Already in class",
            },
        });
    }

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
            remark: "Joined class",
        },
    });
}