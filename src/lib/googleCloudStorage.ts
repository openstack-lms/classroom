import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME || '');

/**
 * Uploads a file to Google Cloud Storage
 * @param base64Data Base64 encoded file data
 * @param fileName Name of the file
 * @param fileType MIME type of the file
 * @returns The stored filename
 */
export async function uploadFile(base64Data: string, fileName: string, fileType: string): Promise<string> {
  // Generate a unique filename to prevent collisions
  const uniqueFileName = generateUniqueFileName(fileName, fileType);
  const file = bucket.file(uniqueFileName);
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
  
  await file.save(buffer, {
    metadata: {
      contentType: fileType,
    },
  });

  return uniqueFileName;
}

/**
 * Deletes a file from Google Cloud Storage
 * @param fileName Name of the file to delete
 */
export async function deleteFile(fileName: string): Promise<void> {
  const file = bucket.file(fileName);
  await file.delete();
}

/**
 * Generates a unique file name
 * @param originalName Original file name
 * @param fileType File type/extension
 * @returns Unique file name
 */
export function generateUniqueFileName(originalName: string, fileType: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const extension = fileType.split('/')[1];
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Generates a signed URL for temporary file access
 * @param fileName Name of the file in the bucket
 * @param expiresInMinutes Number of minutes until the URL expires (default: 60)
 * @returns Signed URL that provides temporary access to the file
 */
export async function getSignedUrl(fileName: string, expiresInMinutes: number = 60): Promise<string> {
  const file = bucket.file(fileName);
  
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000, // Convert minutes to milliseconds
  });

  return url;
} 