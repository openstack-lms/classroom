import { LoginRequest, LoginResponse, SessionVerificationResponse } from "@/interfaces/api/Auth";
import { ApiResponse } from "@/interfaces/api/Response";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
    request: Request
): Promise<NextResponse<ApiResponse<LoginResponse>>> {
    const body: LoginRequest = await request.json();

    const cookieStore = cookies();

    const username = body.username;
    const password = body.password;

    const user = await prisma.user.findMany({
        where: {
            username: username,
            password: password,
        }
    });

    if (!user[0]) {
        return NextResponse.json({
            success: true,
            payload: {
                authenticated: false,
            },
        });
    }

    const session = await prisma.session.create({
        data: {
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            user: {
                connect: {
                    id: user[0].id,
                }
            }
        }
    });

    const token = session.id;

    cookieStore.set("token", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return NextResponse.json({
        success: true,
        payload: {
            authenticated: true,
        },
    });
}

export async function GET(
    request: Request
): Promise<NextResponse<ApiResponse<SessionVerificationResponse>>> {
    const cookieStore = cookies();

    if (!cookieStore.get("token")) {
        return NextResponse.json({
            success: true,
            payload: {
                authenticated: false,
            },
        });
    }

    const token = cookieStore.get("token")!.value;

    if (!token) {
        return NextResponse.json({
            success: true,
            payload: {
                authenticated: false,
            },
        });
    }

    const session = await prisma.session.findUnique({
        where: {
            id: token,
        },
        include: {
            user: {
                select: {
                    username: true,
                    id: true,
                }
            },
        }
    });

    if (!session) {
        return NextResponse.json({
            success: true,
            payload: {
                authenticated: false,
            },
        });
    }

    if (!session.user) {
        return NextResponse.json({
            success: true,
            payload: {
                authenticated: false,
            },
        });
    }
    
    return NextResponse.json({
        success: true,
        payload: {
            authenticated: true,
            user: session.user,
        },
    });
}
