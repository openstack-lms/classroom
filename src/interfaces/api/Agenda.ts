
export interface Event {
    id: string;
    name: string | null;
    remarks: string | null;
    location: string | null;
    startTime: Date | string;
    endTime: Date | string;
}

export interface ClassEvent extends Event {
    class: {
        teachers: {
            id: string;
        }[];
        name: string;
    } | null
}

export interface PersonalEvent extends Event {
    user: {
        id: string;
    } | null
}

export const EventSelectArgs = {
    id: true,
    name: true,
    remarks: true,
    location: true,
    startTime: true,
    endTime: true
}

export const ClassEventSelectArgs = {
    ...EventSelectArgs,
    class: {
        select: {
            teachers: {
                select: {
                    id: true,
                }
            },
            name: true,
        },
    }
}

export const PersonalEventSelectArgs = {
    ...EventSelectArgs,
    user: {
        select: {
            id: true,
        }
    }
}

export interface GetAgendaResponse {
    events: {
        personal: PersonalEvent[];
        class: ClassEvent[];
    }
}

export interface CreatePersonalEventRequest {
    name: string | null;
    remarks: string | null;
    location: string | null;
    startTime: Date | string;
    endTime: Date | string;
}

export interface CreateClassEventRequest {
    name: string | null;
    remarks: string | null;
    location: string | null;
    startTime: Date | string;
    endTime: Date | string;
    classId: string;
}


export interface UpdatePersonalEventRequest extends CreatePersonalEventRequest {
}

export interface UpdateClassEventRequest extends CreateClassEventRequest {
    
}