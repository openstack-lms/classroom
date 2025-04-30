import { PersonalEvent, PersonalEventSelectArgs } from "@/interfaces/api/Agenda";
import { ApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { getUserFromToken } from "@/lib/getUserFromToken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE (request: Request, { params }: { params: { eventId: string } }) {
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
                remark: ApiResponseRemark.DOES_NOT_EXIST,
                subject: "event",
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
            remark: ApiResponseRemark.SUCCESS,
            subject: "event deleted",
        },
    });
}