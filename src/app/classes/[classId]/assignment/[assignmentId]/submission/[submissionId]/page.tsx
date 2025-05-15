"use client";

import Badge from "@/components/Badge";
import FileDownload from "@/components/class/FileDownload";
import FileEdit from "@/components/class/FileEdit";
import Empty from "@/components/ui/Empty";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiPaperClip, HiAnnotation } from "react-icons/hi";
import { trpc } from "@/utils/trpc";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@server/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

interface Attachment {
    id: string;
    name: string;
    type: string;
    thumbnailId?: string | null;
}

type RouterOutput = inferRouterOutputs<AppRouter>;
type Submission = RouterOutput["assignment"]["getSubmissionById"];

export default function SubmissionPage({ params }: { params: { classId: string, assignmentId: string, submissionId: string } }) {
    const dispatch = useDispatch();
    const fileInput = useRef<HTMLInputElement>(null);
    const appState = useSelector((state: RootState) => state.app);

    // Get submission data
    const { data: submissionData, refetch: refetchSubmission } = trpc.assignment.getSubmissionById.useQuery({
        submissionId: params.submissionId,
        classId: params.classId,
    });

    // Update submission mutation
    const updateSubmission = trpc.assignment.updateSubmissionAsTeacher.useMutation({
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

    // Update submission as teacher mutation
    const updateSubmissionAsTeacher = trpc.assignment.updateSubmissionAsTeacher.useMutation({
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

    useEffect(() => {
        if (appState.refetch) {
            refetchSubmission();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch]);

    if (!submissionData) return <></>;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        try {
            const base64 = await fileToBase64(e.target.files[0]);
            const file = e.target.files[0];
            
            if (submissionData.returned) {
                // Teacher adding annotations
                updateSubmissionAsTeacher.mutate({
                    assignmentId: params.assignmentId,
                    classId: params.classId,
                    submissionId: params.submissionId,
                    newAttachments: [{
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64,
                    }],
                });
            } else {
                // Student adding attachments
                updateSubmission.mutate({
                    assignmentId: params.assignmentId,
                    classId: params.classId,
                    submissionId: params.submissionId,
                    newAttachments: [{
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64,
                    }],
                });
            }

            e.target.files = null;
            e.target.value = '';
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: "Failed to upload file",
            }));
        }
    };

    const handleReturnToggle = () => {
        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            return: !submissionData.returned,
        });
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newGrade = !e.currentTarget.value || parseInt(e.currentTarget.value) < submissionData.assignment.maxGrade 
            ? parseInt(e.currentTarget.value) 
            : submissionData.assignment.maxGrade;

        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            gradeReceived: newGrade,
        });
    };

    const handleAnnotationDelete = (annotationId: string) => {
        updateSubmissionAsTeacher.mutate({
            assignmentId: params.assignmentId,
            classId: params.classId,
            submissionId: params.submissionId,
            removedAttachments: [annotationId],
        });
    };

    return (<>
        <h1 className="font-semibold text-3xl">Submission from: {submissionData.student.username}</h1>
        <div className="flex flex-row space-x-3 items-center">
            {submissionData.late && <Badge variant="error">Late</Badge>}
            {submissionData.submitted && !submissionData.returned && <Badge variant="success">Submitted</Badge>}
            {submissionData.returned && <Badge variant="primary">Returned</Badge>}
        </div>
        <h2 className="text-lg font-semibold my-3">Attachments</h2>
        {submissionData.attachments.length === 0 && (
            <Empty 
                icon={HiPaperClip}
                title="No Attachments"
                description="No files have been attached to this submission."
            />
        )}
        {submissionData.attachments.length > 0 && (
            <div className="flex flex-col w-full space-y-7">
                {submissionData.attachments.map((attachment: Attachment) => (
                    <FileDownload
                        key={attachment.id}
                        src={attachment.id}
                        name={attachment.name}
                        type={attachment.type}
                        thumbnailId={attachment.thumbnailId}
                    />
                ))}
            </div>
        )}

        <h2 className="text-lg font-semibold mb-3 my-9">Annotations</h2>
        {submissionData.annotations.length === 0 && (
            <Empty 
                icon={HiAnnotation}
                title="No Annotations"
                description="No annotations have been added to this submission."
            />
        )}
        {submissionData.annotations.length > 0 && (
            <div className="flex flex-col w-full space-y-7">
                {submissionData.annotations.map((annotation: Attachment) => (
                    <FileEdit
                        key={annotation.id}
                        src={annotation.id}
                        name={annotation.name}
                        type={annotation.type}
                        thumbnailId={annotation.thumbnailId}
                        onDelete={() => handleAnnotationDelete(annotation.id)}
                    />
                ))}
            </div>
        )}

        <div className="flex flex-row justify-end mt-3">
            <Input.Text 
                className="rounded-tr-none rounded-br-none" 
                type="number" 
                max={submissionData.assignment.maxGrade} 
                value={submissionData.gradeReceived || 0} 
                onChange={handleGradeChange}
                disabled={submissionData.returned && submissionData.assignment.graded}
            />
            <div className="bg-primary-100 border border-primary-200 dark:bg-primary-800 dark:border-primary-600 px-4 py-3 rounded-tr-md rounded-br-md">
                <span>/{submissionData.assignment.maxGrade}</span>
            </div>
        </div>

        <div className="flex flex-row justify-end space-x-2">
            <input 
                type="file" 
                className="hidden" 
                ref={fileInput} 
                onChange={handleFileUpload} 
            />

            <div className="flex flex-row space-x-3 items-center mt-4">
                {!submissionData.returned && (
                    <>
                        <Button.Light onClick={() => fileInput?.current?.click()}>
                            Attach
                        </Button.Light>
                        <Button.Primary onClick={handleReturnToggle}>
                            Return
                        </Button.Primary>
                    </>
                )}
                {submissionData.returned && (
                    <Button.Primary onClick={handleReturnToggle}>
                        Unreturn
                    </Button.Primary>
                )}
            </div>
        </div>
    </>);
}
