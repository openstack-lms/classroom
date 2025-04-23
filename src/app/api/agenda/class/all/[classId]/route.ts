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

export async function generateStaticParams() {
    return [{ classId: 'placeholder' }];
}

export async function GET (request: Request, { params }: { params: { classId: string }}): Promise<NextResponse<ApiResponse<{events: ClassEvent[]}>>> {
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
                remark: 'Event not found',
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