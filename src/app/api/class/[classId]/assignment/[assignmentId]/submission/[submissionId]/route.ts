import { CreateUpdateAnnotationRequest, FileSelectArgs, GetSubmissionResponse, Submission, SubmissionSelectArgs } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

// GET /api/assignment/[assignmentId]/submission/[submissionId]
// SECURITY Level 4: Class Teacher

export async function GET(request: Request, { params }: { params: { assignmentId: string, submissionId: string } }): Promise<NextResponse<ApiResponse<GetSubmissionResponse>>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Assignment not found',
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Submission not found',
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

export async function PUT(request: Request, { params }: { params: { assignmentId: string, submissionId: string } }): Promise<NextResponse<ApiResponse<DefaultApiResponse>>> {
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Assignment not found',
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Submission not found',
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
                remark: 'Submission returned',
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
                remark: 'Failed to upload files',
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
            remark: 'Submission updated',
        },
    });
}

export async function generateStaticParams() {
    return [{ 
        classId: 'placeholder',
        assignmentId: 'placeholder',
        submissionId: 'placeholder'
    }];
}