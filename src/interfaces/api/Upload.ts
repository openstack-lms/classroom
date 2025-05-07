export interface FileUploadRequest {
    name: string;
    type: string;
    base64: string;
}

export interface FileUploadResponse {
    success: boolean;
    payload: {
        remark?: string;
        file?: {
            name: string;
            type: string;
            path: string;
        };
    };
}

export interface BulkFileUploadRequest {
    files: FileUploadRequest[];
}

export interface BulkFileUploadResponse {
    success: boolean;
    payload: {
        remark?: string;
        files?: UploadedFile[];
    };
}

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    path: string;
    thumbnailId: string | null | undefined;
} 