export enum ApiResponseRemark {
    UNAUTHORIZED = "UNAUTHORIZED",
    DOES_NOT_EXIST = "DOES_NOT_EXIST",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    BAD_REQUEST = "BAD_REQUEST",
    SUCCESS = "SUCCESS",
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS",
}

export const getApiRemarkMessage = (remark: ApiResponseRemark, subject?: string): string => {
    const baseMessages = {
        [ApiResponseRemark.UNAUTHORIZED]: 'Unauthorized',
        [ApiResponseRemark.DOES_NOT_EXIST]: 'Does not exist',
        [ApiResponseRemark.INTERNAL_SERVER_ERROR]: 'Internal server error',
        [ApiResponseRemark.BAD_REQUEST]: 'Bad request',
        [ApiResponseRemark.SUCCESS]: 'Success',
        [ApiResponseRemark.PARTIAL_SUCCESS]: 'Partial success',
    };

    const baseMessage = baseMessages[remark];
    return subject ? `${subject} ${baseMessage.toLowerCase()}` : baseMessage;
}

export const ApiRemarkToStatus = {
    [ApiResponseRemark.UNAUTHORIZED]: 401,
    [ApiResponseRemark.DOES_NOT_EXIST]: 404,
    [ApiResponseRemark.INTERNAL_SERVER_ERROR]: 500,
    [ApiResponseRemark.BAD_REQUEST]: 400,
    [ApiResponseRemark.SUCCESS]: 200,
    [ApiResponseRemark.PARTIAL_SUCCESS]: 206,
}