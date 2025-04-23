// TBF: This file is not in use, it is just a placeholder for future development

import { ClassEventSelectArgs, CreatePersonalEventRequest, GetAgendaResponse, PersonalEventSelectArgs } from "@/interfaces/api/Agenda";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function POST(request: Request): Promise<NextResponse<ApiResponse<DefaultApiResponse>>> {
    const cookieStore = cookies();
    const body: CreatePersonalEventRequest = await request.json();

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

    await prisma.event.create({
        data: {
            userId: user.id,
            ...body,
            startTime: new Date(new Date(body.startTime).toUTCString()),
            endTime: new Date(new Date(body.endTime).toUTCString()),
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Event created successfully'
        },
    });
}
