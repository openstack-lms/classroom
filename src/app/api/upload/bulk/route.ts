import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { BulkFileUploadRequest, BulkFileUploadResponse, UploadedFile } from "@/interfaces/api/Upload";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function POST(request: Request): Promise<NextResponse<BulkFileUploadResponse>> {
    const body = await request.json();
    const cookieStore = cookies();

    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json<BulkFileUploadResponse>({
            success: false,
            payload: {
                remark: 'Unauthorized',
            },
        }, { status: 401 });
    }

    const userSession = await prisma.session.findUnique({
        where: {
            id: token,
        },
    });

    if (!userSession || !userSession.userId) {
        return NextResponse.json<BulkFileUploadResponse>({
            success: false,
            payload: {
                remark: 'Session does not exist',
            },
        }, { status: 401 });
    }

    const { files } = body as BulkFileUploadRequest;

    if (!files) {
        return NextResponse.json<BulkFileUploadResponse>({
            success: true,
            payload: {
                remark: 'No files provided',
                files: [],
            },
        }, { status: 400 });
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

        return NextResponse.json<BulkFileUploadResponse>({
            success: true,
            payload: {
                files: uploadedFiles
            },
        }, { status: 200 });
    } catch (err) {
        return NextResponse.json<BulkFileUploadResponse>({
            success: false,
            payload: {
                remark: 'Failed to upload files',
            },
        }, { status: 500 });
    }
}

// export default function DELETE(request)