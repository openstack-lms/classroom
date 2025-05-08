"use client";

import Badge from "@/components/Badge";
import FileDownload from "@/components/class/FileDownload";
import Empty from "@/components/util/Empty";
import Button from "@/components/util/Button";
import IconFrame from "@/components/util/IconFrame";
import { Assignment, CreateUpdateAnnotationRequest, GetAssignmentResponse, GetSubmissionsResponse, Submission } from "@/interfaces/api/Class";
// import { AssignmentGetBodyProps, AttachmentGetBodyProps, SubmissionCreateBodyProps, SubmissionGetBodyProps } from "@/interfaces/classes";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useState, useEffect, useRef } from "react";
import { HiDocument, HiDownload, HiTrash, HiDocumentText, HiAnnotation, HiPaperClip } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import ProfilePicture from "@/components/util/ProfilePicture";
import FileEdit from "@/components/class/FileEdit";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";

export default function _Assignment({ params }: { params: { classId: string, assignmentId: string } }) {
    const [assignmentProps, setAssignmentProps] = useState<Assignment | null>(null);

    const [submissionData, setSubmissionData] = useState<Submission & CreateUpdateAnnotationRequest & { refetch: boolean } | null>(null);

    const [submissionsData, setSubmissionsData] = useState<Submission[] | null>(null);

    const dispatch = useDispatch();

    const appState = useSelector((state: RootState) => state.app);

    const fileInput = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}`, {
            method: "GET",
        })
            .then(res => res.json())
            .then((data) => {
                if (data.success) {
                    setAssignmentProps((data.payload as GetAssignmentResponse).assignmentData)
                } else {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: data.remark,
                    }));
                }
            })
            .catch(_ => {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: "Please try again later",
                }));
            });
    }, [appState.user.teacher])


    useEffect(() => {
        if (appState.user.student) return;
        fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submissions`, {
            method: "GET",
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSubmissionsData((data.payload as GetSubmissionsResponse).submissions);
                } else {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: data.payload.remark,
                    }));
                }
            })
            .catch(_ => {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: "Please try again later",
                }));
            });
    }, [appState.user.teacher])

    useEffect(() => {
        if (appState.user.teacher) return;

        fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission`, {
            method: "GET",
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSubmissionData({
                        ...data.payload.submissionData,
                        refetch: false,
                        newAttachments: [],
                        removedAttachments: [],
                    });
                    dispatch(setRefetch(false));
                } else {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: data.payload.remark,
                    }));
                }
            })
            .catch(_ => {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: "Please try again later",
                }));
            });
    }, [appState.user.student, appState.refetch]);

    useEffect(() => {
        if (appState.user.teacher) return;
        if (!submissionData) return;

        fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData),
        })
            .then(res => res.json())
            .then(data => {
                dispatch(setRefetch(submissionData.refetch));
                if (!data.success) {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: data.payload.remark,
                    }));
                }
            })
            .catch(_ => {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: "Please try again later",
                }));
            });

    }, [submissionData])

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        
        // Join the class room
        joinClass(params.classId);

        // Handle submission updates
        socket.on('submission-updated', (updatedSubmission: Submission, ack) => {
            if (appState.user.teacher) {
                // Update the submissions list for teachers
                setSubmissionsData(prevSubmissions => {
                    if (!prevSubmissions) return [updatedSubmission];
                    
                    const index = prevSubmissions.findIndex(s => s.id === updatedSubmission.id);
                    if (index === -1) {
                        return [...prevSubmissions, updatedSubmission];
                    }
                    
                    const newSubmissions = [...prevSubmissions];
                    newSubmissions[index] = updatedSubmission;
                    return newSubmissions;
                });
            } else {
                // Update the student's submission
                setSubmissionData(prevData => {
                    if (!prevData) return { 
                        ...updatedSubmission, 
                        refetch: false, 
                        newAttachments: [], 
                        removedAttachments: [],
                        return: false,
                        gradeReceived: updatedSubmission.gradeReceived || 0,
                    };
                    return { 
                        ...prevData, 
                        ...updatedSubmission,
                        return: prevData.return,
                        gradeReceived: updatedSubmission.gradeReceived || prevData.gradeReceived || 0,
                    };
                });
            }
            if (ack) ack();
        });

        // Cleanup on unmount
        return () => {
            leaveClass(params.classId);
            socket.off('submission-updated');
        };
    }, [params.classId, appState.user.teacher]);

    return (
        <div className="mx-auto">
            {assignmentProps != null  && (
                <div className="flex flex-col space-y-9">
                    <div className="rounded-lg flex flex-col space-y-9">
                        <span className="text-4xl font-semibold">{assignmentProps.title}</span>
                        <div className="flex flex-col space-y-2">
                            <span className="font-bold text-foreground-subtle">
                                {assignmentProps.graded ? 'Graded' : 'Not Graded'}
                            </span>
                            <span className="text-foreground-muted text-nowrap">
                                {assignmentProps.dueDate ? assignmentProps.dueDate.toString().slice(0, 10) : 'No due date'}
                            </span>
                        </div>

                        <div className="flex flex-row justify-between space-x-5">
                            <span className="flex-shrink">{assignmentProps.instructions}</span>
                        </div>

                        {/* @description: show submissions */}
                        
                        {appState.user.teacher && (
                            <>
                                <div className="flex flex-col space-y-5 p-6 border border-border dark:border-border-dark rounded-md">
                                    <span className="text-lg font-semibold">Submissions</span>
                                    {submissionsData && submissionsData.length === 0 && (
                                        <Empty 
                                            icon={HiDocumentText}
                                            title="No Submissions"
                                            description="Student has not submitted their work yet."
                                        />
                                    )}
                                    {submissionsData && submissionsData.length > 0 && submissionsData.length && submissionsData.map((submission, index) => (
                                        <div key={index} className="flex flex-row justify-between rounded-md">
                                            <div className="flex flex-row items-center space-x-3">
                                                <div className="flex flex-col space-y-2">
                                                    <span className="font-semibold flex flex-row items-center space-x-4">
                                                        <ProfilePicture username={submission.student.username} size="sm" />
                                                        <span className="flex flex-col space-y-2">
                                                            <div className="flex flex-row space-x-2 items-center">
                                                                <div>{submission.student.username}</div>
                                                                {submission.late && <Badge color="warning">Late</Badge>}
                                                                {submission.submitted && !submission.returned && <Badge color="success">Submitted</Badge>}
                                                                {submission.returned && <Badge color="primary">Returned</Badge>}
                                                                {!submission.submitted && !submission.returned && <Badge color="error">Missing</Badge>}
                                                            </div>
                                                            <span className="text-foreground-muted text-xs">
                                                                {submission.attachments.length} {submission.attachments.length > 1 ? 'items' : 'item'}
                                                            </span>
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            <a href={`/classes/${params.classId}/assignment/${params.assignmentId}/submission/${submission.id}`} 
                                               className="text-primary-500 hover:text-primary-600 font-medium">
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* @description: show attachments */}
                        {assignmentProps && (<>
                            <div className="flex flex-col space-y-5 p-6 rounded-md border border-border dark:border-border-dark">
                                <div className="text-lg font-semibold">Attachments</div>
                                {
                                    assignmentProps.attachments.length <= 0 && (<Empty 
                                        icon={HiPaperClip}
                                        title="No Attachments"
                                        description="No files have been attached to this assignment."
                                    />)
                                }
                                {
                                    assignmentProps.attachments.map((attachment, index) => (
                                        <FileDownload
                                            key={index}
                                            src={attachment.id}
                                            name={attachment.name}
                                            type={attachment.type}
                                            thumbnailId={attachment.thumbnailId}
                                        />

                                    ))
                                }
                            </div>
                        </>)}
                    </div>
                    
                    {/* @submission: show teacher feedback if teacher has returned assignment */}
                    {
                        appState.user.student && submissionData?.returned && (
                            <>
                                <div className="flex flex-col space-y-3">
                                    <span className="text-lg font-semibold">Feedback</span>
                                    {assignmentProps.graded && <div className="flex flex-row space-x-3">
                                        <span className="font-bold">Grade received:</span>
                                        <span>{submissionData.gradeReceived} / {assignmentProps.maxGrade}</span>
                                        </div>}
                                    <div className="flex flex-col space-y-7">
                                        {submissionData.annotations.length === 0 && (
                                            <Empty 
                                                icon={HiAnnotation}
                                                title="No Feedback"
                                                description="No feedback has been provided yet."
                                            />
                                        )}
                                        {
                                            submissionData.annotations.map((annotation, index) => (
                                                <FileDownload
                                                    key={index}
                                                    src={annotation.id}
                                                    name={annotation.name}
                                                    type={annotation.type}
                                                    thumbnailId={annotation.thumbnailId}

                                                />
                                            ))
                                        }
                                    </div>
                                </div>
                            </>
                        )
                    }
                    {/* @description: show submit/unsubmit button to student + file uploads */}
                    {appState.user.student && submissionData && (
                        <div className="flex flex-col space-y-3">
                            <span className="text-lg font-semibold">Submission</span>
                            {!submissionData.attachments.length && (<Empty 
                                icon={HiPaperClip}
                                title="No Attachments"
                                description="No files have been attached to this submission."
                            />)}
                            {submissionData.attachments.length > 0 && (<div className="flex flex-col space-y-7"
                            >{submissionData.attachments.map((attachment, index) => (
                                <>{
                                    submissionData.submitted ?
                                    <FileDownload
                                        key={index}
                                        src={attachment.id}
                                        name={attachment.name}
                                        type={attachment.type}
                                        thumbnailId={attachment.thumbnailId}
                                    />
                                    :
                                    <FileEdit
                                        key={index}
                                        src={attachment.id}
                                        name={attachment.name}
                                        type={attachment.type}
                                        thumbnailId={attachment.thumbnailId}
                                        onDelete={() => {
                                            setSubmissionData({
                                                ...submissionData,
                                                refetch: false,
                                            });
                                        }}  
                                    />
                                }</>
                            ))}
                            </div>
                            )}
                            <div className="flex flex-row justify-end space-x-2">
                                <input type="file" className="hidden" ref={fileInput} onChange={(e) => {
                                    if (!e.target.files || !e.target.files[0]) return;
                                    fileToBase64(e.target.files[0])
                                        .then((base64: string) => {
                                            if (!e.target.files || !e.target.files[0]) return;

                                            setSubmissionData({
                                                ...submissionData,
                                                refetch: true,
                                                newAttachments: [{
                                                    name: e.target.files[0].name,
                                                    type: e.target.files[0].type,
                                                    base64: base64,
                                                    id: v4(),
                                                }],
                                            })
                                        })
                                        .catch(_ => {
                                            dispatch(addAlert({
                                                level: AlertLevel.ERROR,
                                                remark: "Please try again later",
                                            }));
                                        });
                                }} />
                                {!submissionData.submitted ? (<>
                                    <Button.Light onClick={() => fileInput?.current?.click()}>
                                        Attach
                                    </Button.Light>
                                    <Button.Primary
                                        onClick={() => {
                                            fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    submit: true,
                                                }),
                                            })
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (data.success) {
                                                        dispatch(addAlert({
                                                            level: AlertLevel.SUCCESS,
                                                            remark: data.payload.remark,
                                                        }));
                                                        dispatch(setRefetch(true));
                                                    } else {
                                                        dispatch(addAlert({
                                                            level: AlertLevel.ERROR,
                                                            remark: data.payload.remark,
                                                        }));
                                                    }
                                                })
                                                .catch(_ => {
                                                    dispatch(addAlert({
                                                        level: AlertLevel.ERROR,
                                                        remark: "Please try again later",
                                                    }));
                                                }
                                                )
                                        }}
                                    >
                                        Submit
                                    </Button.Primary>
                                </>) : (<div className="flex flex-row items-center space-x-3">
                                    <Button.Primary
                                        onClick={() => {
                                            fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission`, {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    submit: true,
                                                }),
                                            })
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (data.success) {
                                                        dispatch(addAlert({
                                                            level: AlertLevel.SUCCESS,
                                                            remark: data.payload.remark,
                                                        }));
                                                        dispatch(setRefetch(true));
                                                    } else {
                                                        dispatch(addAlert({
                                                            level: AlertLevel.ERROR,
                                                            remark: data.payload.remark,
                                                        }));
                                                    }
                                                })
                                                .catch(_ => {
                                                    dispatch(addAlert({
                                                        level: AlertLevel.ERROR,
                                                        remark: "Please try again later",
                                                    }));
                                                }
                                                )
                                        }}
                                    >
                                        Unsubmit
                                    </Button.Primary>
                                    <span className="text-foreground-muted">Submitted</span>
                                </div>)}
                            </div>
                        </div>)}

                </div>)}
        </div>
    )
}