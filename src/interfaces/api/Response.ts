import { ApiResponseRemark } from "@/lib/ApiResponseRemark";

export interface FailResponse {
    remark: ApiResponseRemark;
}
export interface ErrorPayload {
    remark: ApiResponseRemark;
}

export type DefaultApiResponse = ApiResponse<{
    remark: ApiResponseRemark;
}>;

export interface ApiResponse<T = any | null> {
    success: boolean;
    payload: T | ErrorPayload;
}  
