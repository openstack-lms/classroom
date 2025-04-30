export enum ApiResponseRemark {
    UNAUTHORIZED = 1000,
    DOES_NOT_EXIST = 1001,
    INTERNAL_SERVER_ERROR = 1002,
    BAD_REQUEST = 1003,
    SUCCESS = 1004,
}

export const getApiRemarkMessage = (remark: ApiResponseRemark, subject?: string): string => {
    const baseMessages = {
        [ApiResponseRemark.UNAUTHORIZED]: 'Unauthorized',
        [ApiResponseRemark.DOES_NOT_EXIST]: 'Does not exist',
        [ApiResponseRemark.INTERNAL_SERVER_ERROR]: 'Internal server error',
        [ApiResponseRemark.BAD_REQUEST]: 'Bad request',
        [ApiResponseRemark.SUCCESS]: 'Success',
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
}