import { LoginRequest, LoginResponse, SessionVerificationResponse } from "@/interfaces/api/Auth";
import { ApiResponse } from "@/interfaces/api/Response";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/auth
 * Authenticates a user and creates a new session
 * 
 * @param {Request} request - The incoming request object containing login credentials
 * @returns {Promise<NextResponse<ApiResponse<LoginResponse>>>} Authentication result with session token
 * 
 * @example
 * // Request body
 * {
 *   "username": "user123",
 *   "password": "password123"
 * }
 * 
 * @security Public endpoint
 * 
 * @remarks
 * - Validates username and password
 * - Creates a new session with 7-day expiration
 * - Sets session token in cookies
 * - Returns authentication status
 */
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

/**
 * GET /api/auth
 * Verifies the current session and returns user information if valid
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse<ApiResponse<SessionVerificationResponse>>>} Session verification result with user info
 * 
 * @example
 * // Response body
 * {
 *   "success": true,
 *   "payload": {
 *     "authenticated": true,
 *     "user": {
 *       "username": "user123",
 *       "id": "user-id"
 *     }
 *   }
 * }
 * 
 * @security Requires valid session token in cookies
 * 
 * @remarks
 * - Checks for session token in cookies
 * - Validates session existence and expiration
 * - Returns user information if session is valid
 * - Returns authentication status
 */
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
