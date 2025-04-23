import { PersonalEvent, PersonalEventSelectArgs } from "@/interfaces/api/Agenda";
import { ApiResponse } from "@/interfaces/api/Response";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function DELETE (request: Request, { params }: { params: { eventId: string } }) {
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

    const eventToDelete = await prisma.event.findUnique({
        where: {
            id: params.eventId,
            user: {
                id: userId,
            }
        }
    });

    if (!eventToDelete) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Event not found',
            }
        })
    }

    await prisma.event.delete({
        where: {
            id: params.eventId,
            user: {
                id: userId,
            },
        },
    });

    return NextResponse.json({
        success: true,
        payload: {
            remark: 'Event deleted successfully',
        },
    });
}

export async function generateStaticParams() {
    return [{ eventId: 'placeholder' }];
}