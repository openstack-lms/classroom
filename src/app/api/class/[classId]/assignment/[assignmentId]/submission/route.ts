import { SubmissionSelectArgs, Submission, GetSubmissionResponse } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/assignment/[assignmentId]/submission
// SECURITY Level 5: Specific Student

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function generateStaticParams() {
    return [{ 
        classId: 'placeholder',
        assignmentId: 'placeholder'
    }];
}

export async function GET (_: Request, { params }: { params: { assignmentId: string } }): Promise<NextResponse<ApiResponse<GetSubmissionResponse>>> {
    const cookieStore = cookies();
    const assignmentId = params.assignmentId;

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

    const submissionData: Submission[] = await prisma.submission.findMany({
        where: {
            assignment: {
                id: assignmentId,
            },
            student: {
                id: userId,
            },
        },
        select: {
            ...SubmissionSelectArgs
        },
    });

    if (!submissionData.length) {
        const _subnmissionData: Submission = await prisma.submission.create({
            data: {
                assignment: {
                    connect: {
                        id: assignmentId,
                    },
                },
                student: {
                    connect: {
                        id: userId,
                    },
                },
            },
            select: {
                ...SubmissionSelectArgs,
            }
        });

        return NextResponse.json({
            success: true,
            payload: {
                success: true,
                // submissionData: {
                //     attachments: [],
                // }, @COMMENT I have no idea what this does...
                submissionData: _subnmissionData,
            },
        });
    }

    return NextResponse.json({
        success: true,
        payload: {
            submissionData: submissionData[0],
        },
    });
}

// POST /api/assignment/[assignmentId]/submission
// SECURITY Level 5: Specific Student
export async function POST (request: Request, { params }: { params: { assignmentId: string } }) {
    const cookieStore = cookies();
    const assignmentId = params.assignmentId;
    const body = await request.json();

    if (!cookieStore.get('token')) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            },
        });
    }

    const session = await prisma.session.findFirst({
        where: {
            id: cookieStore.get('token')!.value,
        },
    });

    if (!session || !session.userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: "Session doesn't exist",
            },
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    id: session.id
                },
            }
        },
    });

    if (!user) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'User not found',
            },
        });
    }

    const classToChange = await prisma.class.findMany({
        where: {
            assignments: {
                some: {
                    id: assignmentId,
                },
            },
            students: {
                some: {
                    id: user.id,
                },
            }
        }
    });

    if (!classToChange.length) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Class not found',
            },
        });
    }

    const submissionToChange = await prisma.submission.findMany({
        where: {
            student: {
                id: user.id,
            },
            assignment: {
                id: assignmentId,
            }
        },
    });

    if (!submissionToChange.length) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Submission not found',
            },
        });
    }
    
    if (body.submit) {
        const submission = await prisma.submission.findFirst({
            where: {
                id: submissionToChange[0].id,
            },
        });

        await prisma.submission.update({
            where: {
                id: submissionToChange[0].id,
            },
            data: {
                submitted: submission?.submitted ? false : true,
                submittedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            payload: {
                remark: 'Submission submitted',
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
            id: submissionToChange[0].id,
        },
        data: {
            attachments: {
                connect: [
                    ...res.payload.files.map((attachment: { id: string }) => ({id: attachment.id})),
                ],
                delete: [
                    ...body.removedAttachments.map((attachment: { id: string }) => ({id: attachment.id})),
                ]
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Submission updated',
        },
    });
}
