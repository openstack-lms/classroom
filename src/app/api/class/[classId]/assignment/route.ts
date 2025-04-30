import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { CreateAssignmentRequest, UpdateAssignmentRequest, DeleteAssignmentRequest } from "@/interfaces/api/Class";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

// POST /api/class/[classId]/assignment
// SECURITY Level 3: Class Teacher
export async function POST(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const body: CreateAssignmentRequest = await request.json();
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

    const teacherInClass = await userIsTeacherInClass(userId, params.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    if (!params.classId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
            },
        });
    }

    const classToChange = await prisma.class.findFirst({
        where: {
            id: params.classId,
            teachers: {
                some: {
                    id: userId,
                }
            }
        },
        include: {
            students: {
                select: {
                    id: true,
                },
            },
        }
    });

    if (!classToChange) {
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
        files,
        maxGrade,
        graded,
        weight
    } = body;

    if (!title || !instructions || !dueDate || !files) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
            },
        });
    }

    const req = await fetch(`http://localhost:3000/api/upload/bulk`, {
        method: 'POST',
        credentials: "same-origin",
        mode: "cors",
        headers: {
            'Content-type': 'application/json',
            'Cookie': `token=${token}`,
        },
        body: JSON.stringify({
            files,
        }),
    })

    const res = await req.json();

    if (!res.success) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
            },
        });
    }

    const assignment = await prisma.assignment.create({
        data: {
            title,
            instructions,
            dueDate: new Date(dueDate),
            maxGrade,
            graded,
            weight,
            class: {
                connect: {
                    id: params.classId,
                },
            },
            attachments: {
                connect: [
                    ...res.payload.files.map((file: { id: string }) => ({
                        id: file.id,
                    })),
                ]
            },
            ...(() => {
                if (body.sectionId) {
                    return {
                        section: {
                            connect: {
                                id: body.sectionId,
                            },
                        },
                    }
                }
            })(),
            submissions: {
                create: classToChange.students.map((student: { id: string }) => ({
                    student: {
                        connect: {
                            id: student.id,
                        },
                    },
                })),
            },
            teacher: {
                connect: {
                    id: userId,
                },
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
            subject: "assignment created",
        },
    });
}

export async function DELETE(
    request: Request,
    { params }: { params: { classId: string } }
): Promise<NextResponse<DefaultApiResponse>> {
    const classId = params.classId;

    const cookieStore = cookies();
    const body: DeleteAssignmentRequest = await request.json();
    const assignmentId = body.id;

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
            id: assignmentId,
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