import { NextResponse } from 'next/server';
import prisma from '@prisma/client';
import { cookies } from 'next/headers';

export async function middleware(request: Request) {
    const cookieStore = cookies();
  // Check if the session exists
  // const params = request.params;
  // If everything is good, continue to the requested route
  return NextResponse.next();
}

export const config = {
    matcher: '/classes/:classId*',
}