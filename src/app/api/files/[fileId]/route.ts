import { NextResponse } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@server/routers/_app';
import { createTRPCContext } from '@server/trpc';

/**
 * GET /api/files/[fileId]
 * Generates a short-lived signed URL for file access
 * 
 * @param request The request object
 * @param params Contains fileId parameter
 * @returns Signed URL with appropriate headers
 * 
 * @security Requires authentication and proper access rights
 */
export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: async () => {
      return createTRPCContext({
        req: request as any,
        res: new Response() as any,
      });
    },
    onError({ error }) {
      console.error('Error getting signed URL:', error);
      return NextResponse.json({
        success: false,
        payload: {
          remark: error.message,
        },
      });
    },
  });
} 