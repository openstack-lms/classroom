export interface FailResponse {
    remark: string;
}
export interface ErrorPayload {
    remark: string;
}

export type DefaultApiResponse = ApiResponse<{
    remark: string;
}>;

export interface ApiResponse<T = any | null> {
    success: boolean;
    payload: T | ErrorPayload;
}  
