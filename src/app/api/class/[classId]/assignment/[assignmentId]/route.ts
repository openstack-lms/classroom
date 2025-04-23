import { Assignment, AssignmentSelectArgs, DeleteAssignmentRequest, GetAssignmentResponse, UpdateAssignmentRequest } from "@/interfaces/api/Class";
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

// GET /api/assignment/[assignmentId]
// SECURITY Level 3: Class Teacher or Student
export async function GET (request: Request, params: { params: { assignmentId: string }}): Promise<NextResponse<ApiResponse<GetAssignmentResponse>>> {
    const assignmentId = params.params.assignmentId;

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
                remark: 'Class not found',
            },
        })
    }

    if (!requestedClass?.students.filter(student => student.id == userId).length && !requestedClass?.teachers.filter(teacher => teacher.id == userId).length) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
            remark: 'Get assignment successful',
            assignmentData: {
                ...assignmentProps,
                sections: sections,
            },
            classId: requestedClass.id,
        }
    });
}


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
                remark: 'Invalid class ID',
            },
        });
    }

    const userId = await getUserFromToken(token || null);

    if (!userId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
            },
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, params.classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Failed to upload files',
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
                remark: 'Failed to update assignment',
            },
        });
    }  
    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Assignment updated',
        }
    });
}


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
                remark: 'Unauthorized',
            }
        });
    }

    const teacherInClass = await userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Unauthorized',
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
                remark: 'Unauthorized',
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
            remark: 'Assignment deleted',
        }
    });
}

export async function generateStaticParams() {
    return [{ 
        classId: 'placeholder',
        assignmentId: 'placeholder'
    }];
}
