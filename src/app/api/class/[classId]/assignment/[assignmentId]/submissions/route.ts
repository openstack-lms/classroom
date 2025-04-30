import { GetSubmissionsResponse, SubmissionSelectArgs } from "@/interfaces/api/Class";
import { ApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { userIsTeacherInClass } from "@/lib/userIsTeacherInClass";
import { Submission } from "@/interfaces/api/Class";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

// GET /api/assignment/[assignmentId]/submissions
// SECURITY Level 3: Class Teacher

export async function GET (_: Request, { params }: { params: { assignmentId: string } }): Promise<NextResponse<ApiResponse<GetSubmissionsResponse>>> {
    const cookieStore = cookies();
    const assignmentId = params.assignmentId;

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

    if (!assignmentId) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
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
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "assignment",
            },
        });
    }

    const teacherInClass = userIsTeacherInClass(userId, classId);

    if (!teacherInClass) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }
    
    const submissions: Submission[] = await prisma.submission.findMany({
        where: {
            assignmentId,
        },
        select: {               
            ...SubmissionSelectArgs,
        }
    });

    return NextResponse.json({
        success: true,
        payload: {
            submissions,
        },
    });
}