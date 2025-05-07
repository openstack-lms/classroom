import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Storage } from '@google-cloud/storage';
import { ApiResponseRemark } from '@/lib/ApiResponseRemark';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || '');

// Short expiration time for signed URLs (5 minutes)
const SIGNED_URL_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

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
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  const userSession = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });

  if (!userSession?.userId) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  // Get file metadata from database
  const file = await prisma.file.findUnique({
    where: { id: params.fileId },
    include: {
      assignment: {
        include: {
          class: {
            include: {
              students: true,
              teachers: true
            }
          }
        }
      },
      submission: {
        include: {
          student: true,
          assignment: {
            include: {
              class: {
                include: {
                  teachers: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!file) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.DOES_NOT_EXIST,
      },
    });
  }

  // Check if user has access to the file
  const hasAccess = 
    // File owner
    file.userId === userSession.userId ||
    // Assignment file - student in class or teacher
    (file.assignment && (
      file.assignment.class.students.some(s => s.id === userSession.userId) ||
      file.assignment.class.teachers.some(t => t.id === userSession.userId)
    )) ||
    // Submission file - student who submitted or teacher of class
    (file.submission && (
      file.submission.student.id === userSession.userId ||
      file.submission.assignment.class.teachers.some(t => t.id === userSession.userId)
    ));

  if (!hasAccess) {
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.UNAUTHORIZED,
      },
    });
  }

  try {
    // Get the file from Google Cloud Storage
    const fileName = file.path.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid file path');
    }

    const gcsFile = bucket.file(fileName);
    const [exists] = await gcsFile.exists();

    if (!exists) {
      return NextResponse.json({
        success: false,
        payload: {
          remark: ApiResponseRemark.DOES_NOT_EXIST,
        },
      });
    }

    // Generate a signed URL with short expiration
    const [signedUrl] = await gcsFile.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + SIGNED_URL_EXPIRATION,
      // Add response content type and disposition
      responseType: file.type,
      responseDisposition: `inline; filename="${file.name}"`,
    });

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({
      success: false,
      payload: {
        remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
      },
    });
  }
} 