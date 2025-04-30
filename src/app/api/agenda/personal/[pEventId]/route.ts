import { PersonalEvent, PersonalEventSelectArgs, UpdatePersonalEventRequest } from "@/interfaces/api/Agenda";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET (request: Request, { params }: { params: { pEventId: string }}): Promise<NextResponse<ApiResponse<{event: PersonalEvent}>>> {
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

    const eventToGet = await prisma.event.findUnique({
        where: {
            id: params.pEventId,
            user: {
                id: userId,
            }
        },
        select: {
            ...PersonalEventSelectArgs,
        }
    });

    if (!eventToGet) {
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
            event: eventToGet,
        }
    })
}

export async function PUT (request: Request, { params }: { params: { pEventId: string }}): Promise<NextResponse<DefaultApiResponse>> {
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

    const body: UpdatePersonalEventRequest = await request.json();    

    const eventToEdit = await prisma.event.findUnique({
        where: {
            id: params.pEventId,
            user: {
                id: userId,
            }
        }
    });

    if (!eventToEdit) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "event",
            }
        });
    }

    await prisma.event.update({
        where: {
            id: params.pEventId,
            user: {
                id: userId,
            },
        },
        data: {
            ...body,
        }
    })

    return NextResponse.json({
        success: true,
        payload: {
            remark: ApiResponseRemark.SUCCESS,
            subject: "event edited",
        }
    });
}