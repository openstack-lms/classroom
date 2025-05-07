import { User } from "./Auth";

export type File = {
    id: string;
    name: string;
    type: string;
    path: string;
    thumbnailId: string | null;
}

export type NewFile = {
    name: string,
    type: string,
    base64: string,
    id: string,
}

export type RemovedFile = {
    id: string;
}

export const FileSelectArgs = {
    select: {
        id: true,
        name: true,
        path: true,
        type: true,
        thumbnailId: true,
    }
}

export type Assignment = {
    id: string;
    title: string;
    instructions: string;
    createdAt: Date | null;
    dueDate: Date | null;
    attachments: File[];
    teacher: { id: string; username: string };
    section: { id: string; name: string } | null;

    graded: boolean;
    maxGrade: number | null;
    weight: number,
    // @note: temporary
    submitted?: boolean | null;
    late?: boolean | null;
    returned?: boolean | null;
}   

export type Class = {
    id: string;
    name: string;
    subject: string;
    section: string;
    teachers: { id: string; username: string }[];
    students: { id: string; username: string }[];
    // assignments: {
    //     id: string;
    //     title: string;
    //     instructions: string;
    //     createdAt: Date | null;
    //     dueDate: Date | null;
    //     attachments: File[];
    //     teacher: { id: string; username: string };
    //     section: { id: string; name: string } | null;
    // }[];
    assignments: Assignment[];
    sections: { id: string; name: string }[];
};

export type Submission = {
    id: string;
    submitted: boolean | null;
    submittedAt: Date | null;
    returned: boolean | null;
    late?: boolean | null; // @todo: fix - hindsight i forgot what
    attachments: File[];
    gradeReceived: number | null;
    assignment: {
        dueDate: Date | null;
        id: string;
        title: string;
        maxGrade: number | null;
        graded: boolean;
    };
    annotations: File[];
    student: {
        id: string;
        username: string;
    };
};

export type Announcement = {
    id: string;
    teacher: User;
    remarks: string;

    createdAt: Date | string;
}

export const AnnouncementSelectProps = {
    id: true,
    teacher: {
        select: {
            id: true,
            username: true,
        },
    },
    remarks: true,

    createdAt: true,
};

export type CreateAnnouncementProps = {
    remarks: string;
}


export type GetAssignmentResponse = {
    assignmentData: Assignment & {
        sections: { id: string; name: string }[];
    };
    classId: string;
};

export type GetSubmissionsResponse = {
    submissions: Submission[];
}

export type CreateUpdateAnnotationRequest = {
    removedAttachments: RemovedFile[];
    newAttachments: NewFile[];
    gradeReceived: number;
    return: boolean
}

export type UpdateAssignmentRequest = {
    title: string;
    instructions: string;
    dueDate: Date | null;
    newAttachments: NewFile[];
    removedAttachments: RemovedFile[];
    section?: { id: string } | null;
    maxGrade: number;
    graded: boolean
    weight: number;
};

export type DeleteAssignmentRequest = {
    id: string;
};

export const AssignmentSelectArgs = {
    id: true,
    title: true,
    dueDate: true,
    createdAt: true,
    instructions: true,
    attachments: {
        ...FileSelectArgs,
    },
    graded: true,
    maxGrade: true,
    weight: true,
    section: {
        select: {
            id: true,
            name: true,
        },
    },
    teacher: {
        select: {
            id: true,
            username: true,
        }
    },
}

export const SubmissionSelectArgs = {
    id: true,
    submitted: true,
    submittedAt: true,
    returned: true,
    gradeReceived: true,
    annotations: {
        ...FileSelectArgs,
    },
    attachments: {
        ...FileSelectArgs,
    },
    assignment: {
        select: {
            dueDate: true,
            id: true,
            title: true,
            graded: true,
            maxGrade: true,
        }
    },
    student: {
        select: {
            id: true,
            username: true,
        },
    }
}

export type GetClassesResponse = {
    teacherInClass: Array<{
        id: string;
        name: string;
        section: string;
        subject: string;
        dueToday: Array<{
            id: string;
            title: string;
            dueDate: Date;
        }>;
    }>;
    studentInClass: Array<{
        id: string;
        name: string;
        section: string;
        subject: string;
        dueToday: Array<{
            id: string;
            title: string;
            dueDate: Date;
        }>;
    }>;

};

export type CreateClassRequest = {
    name: string;
    section: string;
    subject: string;
};

export type CreateClassResponse = {
    newClass: {
        id: string;
        name: string;
        section: string;
        subject: string;
    };
};

export type UpdateClassRequest = {
    id: string;
    name: string;
    section: string;
    subject: string;
};

export type UpdateClassResponse = {
    updatedClass: {
        id: string;
        name: string;
        section: string;
        subject: string;
    };
};


export type JoinClassRequest = {
    code: string;
};


export type GetClassResponse = { 
    classData: Class & {
        announcements: Announcement[];
    }; 
}

export type CreateSectionRequest = {
    name: string;
};

export type UpdateSectionRequest = {
    id: string;
    name: string;
    classId: string;
};

export type DeleteSectionRequest = {
    id: string;
    classId: string;
};

export type ClassInviteResponse = {
    session: {
        id: string;
    }
}

export type MemberRequest = {
    id: string;
    type: 'teacher' | 'student';
};

export type CreateAssignmentRequest = {
    title: string;
    instructions: string;
    dueDate: Date;
    graded: boolean,
    files: NewFile[];
    sectionId?: string;
    maxGrade: number;
    weight: number;
};

export type GetSubmissionResponse =  {
    submissionData: Submission;
}

export type Grade = {
    id: string;
    gradeReceived: number | null;
    assignment: {
        id: string;
        maxGrade: number | null;    
        title: string;    
        weight: number;
    }
}