import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { BulkFileUploadRequest, BulkFileUploadResponse, UploadedFile } from "@/interfaces/api/Upload";
import { NextResponse } from 'next/server';
import { ApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";
import { uploadFile, deleteFile } from "@/lib/googleCloudStorage";
import { generateThumbnail, storeThumbnail } from "@/lib/thumbnailGenerator";

type BulkUploadPayload = {
    files: UploadedFile[];
};

// Maximum concurrent uploads
const MAX_CONCURRENT_UPLOADS = 3;

/**
 * Uploads files in batches to avoid overwhelming the server
 * @param files Array of files to upload
 * @param userId User ID for file ownership
 * @returns Array of uploaded file information
 */
async function uploadFilesInBatches(files: any[], userId: string) {
    const uploadedFiles: UploadedFile[] = [];
    
    // Process files in batches
    for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
        const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);
        const uploadPromises = batch.map(async (file) => {
            try {
                // Upload to Google Cloud Storage
                const storedFileName = await uploadFile(file.base64, file.name, file.type);

                // Create initial file entry
                const newFile = await prisma.file.create({
                    data: {
                        name: file.name,
                        type: file.type,
                        path: storedFileName,
                        userId: userId,
                    },
                });

                // Generate thumbnail if possible
                const thumbnailBuffer = await generateThumbnail(storedFileName, file.type);
                if (thumbnailBuffer) {
                    const thumbnailId = await storeThumbnail(thumbnailBuffer, storedFileName, userId);
                    // Update file with thumbnail relation
                    await prisma.file.update({
                        where: { id: newFile.id },
                        data: {
                            thumbnailId: thumbnailId
                        }
                    });
                }

                // Get the complete file with thumbnail
                const completeFile = await prisma.file.findUnique({
                    where: { id: newFile.id },
                    include: { thumbnail: true }
                });

                return {
                    id: completeFile!.id,
                    path: completeFile!.id,
                    name: completeFile!.name,
                    type: completeFile!.type,
                    thumbnailId: completeFile!.thumbnailId
                };
            } catch (error) {
                console.error('Failed to upload file:', error);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        // @ts-expect-error
        uploadedFiles.push(...results.filter((result): result is UploadedFile => result !== null));
    }

    return uploadedFiles;
}

/**
 * POST /api/upload/bulk
 * Uploads multiple files to Google Cloud Storage
 * 
 * @param {Request} request - The incoming request object containing file data
 * @returns {Promise<NextResponse<ApiResponse<BulkUploadPayload>>>} Upload result with file information
 * 
 * @example
 * // Request body
 * {
 *   "files": [
 *     {
 *       "name": "example.pdf",
 *       "type": "application/pdf",
 *       "base64": "data:application/pdf;base64,..."
 *     }
 *   ]
 * }
 * 
 * @security Requires authentication
 * 
 * @remarks
 * - Uploads files to Google Cloud Storage
 * - Creates database entries for uploaded files
 * - Returns public URLs for uploaded files
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<BulkUploadPayload>>> {
    const body = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const userSession = await prisma.session.findUnique({
        where: { id: token },
    });

    if (!userSession || !userSession.userId) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const { files } = body as BulkFileUploadRequest;

    if (!files) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                files: [],
            },
        });
    }

    try {
        const uploadedFiles = await uploadFilesInBatches(files, userSession.userId);

        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: true,
            payload: {
                files: uploadedFiles,
            },
        });
    } catch (err) {
        console.error('Bulk upload failed:', err);
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
            },
        });
    }
}

/**
 * DELETE /api/upload/bulk
 * Deletes multiple files from Google Cloud Storage
 * 
 * @param {Request} request - The incoming request object containing file IDs
 * @returns {Promise<NextResponse<ApiResponse<BulkUploadPayload>>>} Deletion result
 * 
 * @example
 * // Request body
 * {
 *   "fileIds": ["file-id-1", "file-id-2"]
 * }
 * 
 * @security Requires authentication
 * 
 * @remarks
 * - Deletes files from Google Cloud Storage
 * - Removes database entries for deleted files
 * - Handles partial failures gracefully
 */
export async function DELETE(request: Request): Promise<NextResponse<ApiResponse<BulkUploadPayload>>> {
    const body = await request.json();
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const userSession = await prisma.session.findUnique({
        where: {
            id: token,
        },
    });

    if (!userSession || !userSession.userId) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.UNAUTHORIZED,
            },
        });
    }

    const { fileIds } = body as { fileIds: string[] };

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.BAD_REQUEST,
                files: [],
            },
        });
    }

    const deletedFiles: UploadedFile[] = [];
    const failedFiles: string[] = [];

    try {
        await Promise.all(fileIds.map(async (id) => {
            const file = await prisma.file.findUnique({ 
                where: { 
                    id,
                    userId: userSession.userId // Ensure user owns the file
                },
                include: {
                    thumbnail: true // Include thumbnail relation
                }
            });
            
            if (!file) {
                failedFiles.push(id);
                return;
            }

            try {
                // Delete the original file from storage
                const fileName = file.path.split('/').pop();
                if (fileName) {
                    await deleteFile(fileName);
                }

                // Delete the thumbnail if it exists
                if (file.thumbnail) {
                    const thumbnailFileName = file.thumbnail.path.split('/').pop();
                    if (thumbnailFileName) {
                        await deleteFile(thumbnailFileName);
                    }
                    // The thumbnail File record will be automatically deleted due to the CASCADE delete
                }
                
                // Delete the main file record (this will cascade delete the thumbnail due to the relation)
                await prisma.file.delete({ where: { id } });
                
                // @note: temporary
                // @ts-expect-error
                deletedFiles.push({
                    id: file.id,
                    path: file.path,
                    name: file.name,
                    type: file.type,
                });
            } catch (err) {
                console.error('Error deleting file:', err);
                failedFiles.push(id);
            }
        }));

        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: true,
            payload: {
                files: deletedFiles,
                remark: failedFiles.length > 0 ? ApiResponseRemark.PARTIAL_SUCCESS : undefined,
            },
        });
    } catch (err) {
        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: false,
            payload: {
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
            },
        });
    }
}