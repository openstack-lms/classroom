import { ClassEvent, ClassEventSelectArgs, PersonalEvent, PersonalEventSelectArgs, UpdateClassEventRequest, UpdatePersonalEventRequest } from "@/interfaces/api/Agenda";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function GET (request: Request, { params }: { params: { cEventId: string }}): Promise<NextResponse<ApiResponse<{event: ClassEvent}>>> {
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

    const eventToGet = await prisma.event.findUnique({
        where: {
            id: params.cEventId,
            class: {
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

    if (!eventToGet) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Event not found',
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

export async function PUT (request: Request, { params }: { params: { cEventId: string }}): Promise<NextResponse<DefaultApiResponse>> {
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

    const body: UpdateClassEventRequest = await request.json();    

    const eventToEdit = await prisma.event.findUnique({
        where: {
            id: params.cEventId,
            class: {
                id: body.classId,
                teachers: {
                    some: {
                        id: userId,
                    }
                }
            },
        }
    });

    if (!eventToEdit) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Event not found',
            }
        });
    }

    await prisma.event.update({
        where: {
            id: params.cEventId,
            class: {
                id: body.classId,
                teachers: {
                    some: {
                        id: userId,
                    }
                }
            },
        },
        data: {
            ...body,
        }
    })

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Event edited successfully',
        }
    });
}

export async function generateStaticParams() {
    return [{ cEventId: 'placeholder' }];
}