import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { BulkFileUploadRequest, BulkFileUploadResponse, UploadedFile } from "@/interfaces/api/Upload";
import { NextResponse } from 'next/server';
import { ApiResponse } from "@/interfaces/api/Response";
import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

type BulkUploadPayload = {
    files: UploadedFile[];
};

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

    const uploadedFiles: UploadedFile[] = [];

    try {
        await Promise.all(files.map(async (file) => {
            const newFile = await prisma.file.create({
                data: {
                    name: file.name,
                    type: file.type,
                    path: '/public',
                },
            });

            const filePath: string = `/public/${newFile.id}.${newFile.type.split('/')[1]}`;

            uploadedFiles.push({
                id: newFile.id,
                path: filePath,
                name: file.name,
                type: file.type,
            });

            try {
                await writeFile(`.${filePath}`, file.base64.split(',')[1], 'base64');

                await prisma.file.update({
                    where: {
                        id: newFile.id,
                    },
                    data: {
                        path: filePath,
                    },
                });
            } catch (err) {
                await prisma.file.delete({
                    where: {
                        id: newFile.id,
                    },
                });
                throw new Error('Failed to write file');
            }
        }));

        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: true,
            payload: {
                files: uploadedFiles,
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
            const file = await prisma.file.findUnique({ where: { id } });
            if (!file) {
                failedFiles.push(id);
                return;
            }
            const filePath = `.${file.path}`;
            try {
                // Remove file from filesystem
                await import('fs/promises').then(fs => fs.unlink(filePath));
            } catch (err) {
                // If file doesn't exist, continue to delete from DB
            }
            await prisma.file.delete({ where: { id } });
            deletedFiles.push({
                id: file.id,
                path: file.path,
                name: file.name,
                type: file.type,
            });
        }));

        return NextResponse.json<ApiResponse<BulkUploadPayload>>({
            success: true,
            payload: {
                files: deletedFiles,
                remark: ApiResponseRemark.INTERNAL_SERVER_ERROR,
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