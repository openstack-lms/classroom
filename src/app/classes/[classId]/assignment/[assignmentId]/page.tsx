"use client";

import Badge from "@/components/Badge";
import FileDownload from "@/components/class/FileDownload";
import Empty from "@/components/ui/Empty";
import Button from "@/components/ui/Button";
import IconFrame from "@/components/ui/IconFrame";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useRef } from "react";
import { HiDocument, HiDownload, HiTrash, HiDocumentText, HiAnnotation, HiPaperClip } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import ProfilePicture from "@/components/ui/ProfilePicture";
import FileEdit from "@/components/class/FileEdit";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@server/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Assignment = RouterOutput["assignment"]["get"];
type Submission = RouterOutput["assignment"]["getSubmission"];
type Submissions = RouterOutput["assignment"]["getSubmissions"];

interface Attachment {
    id: string;
    name: string;
    type: string;
    thumbnailId?: string | null;
}

export default function AssignmentPage({ params }: { params: { classId: string, assignmentId: string } }) {
    const dispatch = useDispatch();
    const fileInput = useRef<HTMLInputElement | null>(null);
    const appState = useSelector((state: RootState) => state.app);

    // Get assignment data
    const { data: assignmentData } = trpc.assignment.get.useQuery({
        id: params.assignmentId,
        classId: params.classId,
    });

    // Get submissions data (for teachers)
    const { data: submissionsData } = trpc.assignment.getSubmissions.useQuery({
        assignmentId: params.assignmentId,
        classId: params.classId,
    }, {
        enabled: !!appState.user.teacher,
    });

    // Get submission data (for students)
    const { data: submissionData, refetch: refetchSubmission } = trpc.assignment.getSubmission.useQuery({
        assignmentId: params.assignmentId,
        classId: params.classId,
    }, {
        enabled: !!appState.user.student,
    });

    // Update submission mutation
    const updateSubmission = trpc.assignment.updateSubmission.useMutation({
        onSuccess: () => {
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: "Submission updated successfully",
            }));
            refetchSubmission();
        },
        onError: (error: TRPCClientErrorLike<AppRouter>) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        },
    });

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        
        // Join the class room
        joinClass(params.classId);

        // Handle submission updates
        socket.on('submission-updated', (updatedSubmission: Submission, ack) => {
            if (appState.user.teacher) {
                // Update the submissions list for teachers
                refetchSubmission();
            } else {
                // Update the student's submission
                refetchSubmission();
            }
            if (ack) ack();
        });

        // Cleanup on unmount
        return () => {
            leaveClass(params.classId);
            socket.off('submission-updated');
        };
    }, [params.classId, appState.user.teacher]);

    if (!assignmentData) return <></>;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            const file = e.target.files[0];
            
            updateSubmission.mutate({
                assignmentId: params.assignmentId,
                classId: params.classId,
                submissionId: submissionData?.id,
                newAttachments: [{
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                }],
            });

            e.target.files = null;
            e.target.value = '';
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: "Failed to upload file",
            }));
        }
    };

    const handleSubmit = () => {
        updateSubmission.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: submissionData?.id,
            submit: true,
        });
    };

    const handleUnsubmit = () => {
        updateSubmission.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: submissionData?.id,
            submit: false,
        });
    };

    return (
        <div className="mx-auto">
            <div className="flex flex-col space-y-9">
                <div className="rounded-lg flex flex-col space-y-9">
                    <span className="text-4xl font-semibold">{assignmentData.title}</span>
                    <div className="flex flex-col space-y-2">
                        <span className="font-bold text-foreground-subtle">
                            {assignmentData.graded ? 'Graded' : 'Not Graded'}
                        </span>
                        <span className="text-foreground-muted text-nowrap">
                            {assignmentData.dueDate ? assignmentData.dueDate.toString().slice(0, 10) : 'No due date'}
                        </span>
                    </div>

                    <div className="flex flex-row justify-between space-x-5">
                        <span className="flex-shrink">{assignmentData.instructions}</span>
                    </div>

                    {/* Show submissions for teachers */}
                    {appState.user.teacher && (
                        <>
                            <div className="flex flex-col space-y-5 p-6 border border-border dark:border-border-dark rounded-md">
                                <span className="text-lg font-semibold">Submissions</span>
                                {(!submissionsData || submissionsData.length === 0) && (
                                    <Empty 
                                        icon={HiDocumentText}
                                        title="No Submissions"
                                        description="Student has not submitted their work yet."
                                    />
                                )}
                                {submissionsData && submissionsData.length > 0 && submissionsData.map((submission: Submission) => (
                                    <div key={submission.id} className="flex flex-row justify-between rounded-md">
                                        <div className="flex flex-row items-center space-x-3">
                                            <div className="flex flex-col space-y-2">
                                                <span className="font-semibold flex flex-row items-center space-x-4">
                                                    <ProfilePicture username={submission.student.username} size="sm" />
                                                    <span className="flex flex-col space-y-2">
                                                        <div className="flex flex-row space-x-2 items-center">
                                                            <div>{submission.student.username}</div>
                                                            {submission.late && <Badge variant="warning">Late</Badge>}
                                                            {submission.submitted && !submission.returned && <Badge variant="success">Submitted</Badge>}
                                                            {submission.returned && <Badge variant="primary">Returned</Badge>}
                                                            {!submission.submitted && !submission.returned && <Badge variant="error">Missing</Badge>}
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

                    {/* Show attachments */}
                    <div className="flex flex-col space-y-5 p-6 rounded-md border border-border dark:border-border-dark">
                        <div className="text-lg font-semibold">Attachments</div>
                        {assignmentData.attachments.length === 0 && (
                            <Empty 
                                icon={HiPaperClip}
                                title="No Attachments"
                                description="No files have been attached to this assignment."
                            />
                        )}
                        {assignmentData.attachments.map((attachment: Attachment) => (
                            <FileDownload
                                key={attachment.id}
                                src={attachment.id}
                                name={attachment.name}
                                type={attachment.type}
                                thumbnailId={attachment.thumbnailId}
                            />
                        ))}
                    </div>
                </div>
                
                {/* Show teacher feedback if teacher has returned assignment */}
                {appState.user.student && submissionData?.returned && (
                    <>
                        <div className="flex flex-col space-y-3">
                            <span className="text-lg font-semibold">Feedback</span>
                            {assignmentData.graded && (
                                <div className="flex flex-row space-x-3">
                                    <span className="font-bold">Grade received:</span>
                                    <span>{submissionData.gradeReceived} / {assignmentData.maxGrade}</span>
                                </div>
                            )}
                            <div className="flex flex-col space-y-7">
                                {submissionData.annotations.length === 0 && (
                                    <Empty 
                                        icon={HiAnnotation}
                                        title="No Feedback"
                                        description="No feedback has been provided yet."
                                    />
                                )}
                                {submissionData.annotations.map((annotation: Attachment) => (
                                    <FileDownload
                                        key={annotation.id}
                                        src={annotation.id}
                                        name={annotation.name}
                                        type={annotation.type}
                                        thumbnailId={annotation.thumbnailId}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Show submit/unsubmit button to student + file uploads */}
                {appState.user.student && submissionData && (
                    <div className="flex flex-col space-y-3">
                        <span className="text-lg font-semibold">Submission</span>
                        {submissionData.attachments.length === 0 && (
                            <Empty 
                                icon={HiPaperClip}
                                title="No Attachments"
                                description="No files have been attached to this submission."
                            />
                        )}
                        {submissionData.attachments.length > 0 && (
                            <div className="flex flex-col space-y-7">
                                {submissionData.attachments.map((attachment: Attachment) => (
                                    submissionData.submitted ? (
                                        <FileDownload
                                            key={attachment.id}
                                            src={attachment.id}
                                            name={attachment.name}
                                            type={attachment.type}
                                            thumbnailId={attachment.thumbnailId}
                                        />
                                    ) : (
                                        <FileEdit
                                            key={attachment.id}
                                            src={attachment.id}
                                            name={attachment.name}
                                            type={attachment.type}
                                            thumbnailId={attachment.thumbnailId}
                                            onDelete={() => {
                                                updateSubmission.mutate({
                                                    assignmentId: params.assignmentId,
                                                    classId: params.classId,
                                                    submissionId: submissionData?.id,
                                                    removedAttachments: [attachment.id],
                                                });
                                            }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                        <div className="flex flex-row justify-end space-x-2">
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInput} 
                                onChange={handleFileUpload} 
                            />
                            {!submissionData.submitted ? (
                                <>
                                    <Button.Light onClick={() => fileInput?.current?.click()}>
                                        Attach
                                    </Button.Light>
                                    <Button.Primary onClick={handleSubmit}>
                                        Submit
                                    </Button.Primary>
                                </>
                            ) : (
                                <div className="flex flex-row items-center space-x-3">
                                    <Button.Primary onClick={handleUnsubmit}>
                                        Unsubmit
                                    </Button.Primary>
                                    <span className="text-foreground-muted">Submitted</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}