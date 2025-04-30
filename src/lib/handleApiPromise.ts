import { ApiResponse, DefaultApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "./alertLevel";
import { getApiRemarkMessage } from "./ApiResponseRemark";

export type ProcessedResponse<T = {remark: string}> = {
    success: boolean;
    payload: T;
    level: AlertLevel;
    remark: string;
}

export async function handleApiPromise<T = {remark: string}>(
    fetchPromise: Promise<Response>,
): Promise<ProcessedResponse<T>> {
    try {
        const res = await fetchPromise;
        const data:  ApiResponse<{ payload: T & { remark: string } }> = await res.json();
        
        return {
            success: data.success,
            payload: data.payload as T,
            level: data.success ? AlertLevel.SUCCESS : AlertLevel.ERROR,
            remark: (data.payload as ErrorPayload).remark ? getApiRemarkMessage((data.payload as ErrorPayload).remark) : ''
        };
    } catch (error) {
        return {
            success: false,
            payload: null as T,
            level: AlertLevel.ERROR,
            remark: "Please try again later"
        };
    }
}