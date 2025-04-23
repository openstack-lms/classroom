import { ClassEventSelectArgs, GetAgendaResponse, PersonalEventSelectArgs } from "@/interfaces/api/Agenda";
import { ApiResponse } from "@/interfaces/api/Response";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';

export const dynamicParams = true;

// Add this to help Next.js understand the route during build
export async function generateStaticParams() {
    return [{ id: 'placeholder' }];
}

function getWeekStartAndEnd(weekStart: string) {
    try {
        const startDate = new Date(weekStart);
        if (isNaN(startDate.getTime())) {
            return null;
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        
        return {
            start: startDate.toISOString(),
            end: endDate.toISOString()
        };
    } catch {
        return null;
    }
}

export async function GET(request: Request, { params }: { params: { weekStart: string }}): Promise<NextResponse<ApiResponse<GetAgendaResponse>>> {
    const dateRange = getWeekStartAndEnd(params.weekStart);
    if (!dateRange) {
        return NextResponse.json({
            success: false,
            payload: {
                remark: 'Invalid date format',
            },
        });
    }

    const cookieStore = cookies();

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

    const personalEvents = await prisma.event.findMany({
        where: {
            userId: user.id,
            startTime: {
                gte: dateRange.start,
                lte: dateRange.end
            },
        },
        select: PersonalEventSelectArgs
    });

    const userClasses = await prisma.class.findMany({
        where: {
            OR: [
                {
                    students: {
                        some: {
                            id: user.id
                        }
                    },
                },
                {
                    teachers: {
                        some: {
                            id: user.id,
                        }
                    }
                }
            ]   
        },
    });

    const classEvents = await prisma.event.findMany({
        where: {
            classId: {
                in: userClasses.map((c) => c.id)
            },
            startTime: {
                gte: dateRange.start,
                lte: dateRange.end
            },
        },
        select: ClassEventSelectArgs,
    });

    return NextResponse.json({
        success: true,
        payload: {
            events: {
                personal: personalEvents,
                class: classEvents
            },
        },
    });
}

