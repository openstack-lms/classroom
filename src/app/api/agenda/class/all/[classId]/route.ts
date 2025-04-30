import { ClassEvent, ClassEventSelectArgs, PersonalEvent, PersonalEventSelectArgs, UpdateClassEventRequest, UpdatePersonalEventRequest } from "@/interfaces/api/Agenda";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET (request: Request, { params }: { params: { classId: string }}): Promise<NextResponse<ApiResponse<{events: ClassEvent[]}>>> {
    const cookieStore = cookies();

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

    const eventsToGet = await prisma.event.findMany({
        where: {
            class: {
                id: params.classId,
                teachers: {
                    some: {
                        id: userId,
                    }
                }
            }
        },
        select: {
            ...ClassEventSelectArgs,
        }
    });

    if (!eventsToGet) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "event",
            }
        });
    }

    return NextResponse.json({
        success: true,
        payload: {
            events: eventsToGet,
        }
    })
}