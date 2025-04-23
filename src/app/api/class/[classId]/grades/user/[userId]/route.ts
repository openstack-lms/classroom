import { Grade } from "@/interfaces/api/Class";
import { ApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function generateStaticParams() {
    return [{ 
        classId: 'placeholder',
        userId: 'placeholder'
    }];
}

export async function GET (request: Request, { params }: { params: { classId: string; userId: string }}): Promise<NextResponse<ApiResponse<{ grades: Grade[] }>>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Grades not found',
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