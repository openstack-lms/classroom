import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { FileUploadRequest, FileUploadResponse } from "@/interfaces/api/Upload";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';
export const dynamicParams = true;

export async function POST(request: Request): Promise<NextResponse<FileUploadResponse>> {
    const body = await request.json();
    const { name, type, base64 } = body as FileUploadRequest;

    if (!name || !type || !base64) {
        return NextResponse.json<FileUploadResponse>({
            success: false,
            payload: {
                remark: 'Invalid file data',
            },
        });
    }

    try {
        const file = await prisma.file.create({
            data: {
                name,
                type,
                path: '/temp',
            }
        });

        if (!file) {
            return NextResponse.json<FileUploadResponse>({
                success: false,
                payload: {
                    remark: 'Failed to create file',
                },
            });
        }

        const filePath: string = `/public/${file.id}.${file.type.split('/')[1]}`;

        try {
            await writeFile(`.${filePath}`, base64, 'base64');
            
            await prisma.file.update({
                where: {
                    id: file.id,
                },
                data: {
                    path: filePath,
                }
            });

            return NextResponse.json<FileUploadResponse>({
                success: true,
                payload: {
                    file: {
                        name,
                        type,
                        path: filePath,
                    },
                },
            });
        } catch (err) {
            await prisma.file.delete({
                where: {
                    id: file.id,
                },
            });

            return NextResponse.json<FileUploadResponse>({
                success: false,
                payload: {
                    remark: 'Failed to write file',
                },
            });
        }
    } catch (err) {
        return NextResponse.json<FileUploadResponse>({
            success: false,
            payload: {
                remark: 'Failed to process file',
            },
        });
    }
}