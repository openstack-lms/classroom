"use client";

import Badge from "@/components/Badge";
import FileDownload from "@/components/class/FileDownload";
import FileEdit from "@/components/class/FileEdit";
import Empty from "@/components/util/Empty";
import Button from "@/components/util/Button";
import Input from "@/components/util/Input";
import { CreateUpdateAnnotationRequest, GetSubmissionResponse, Submission } from "@/interfaces/api/Class";
import { ApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import { HiPaperClip, HiAnnotation } from "react-icons/hi";

// @todo: seperate poster and getter states

export default function SubmissionPage({ params }: { params: { classId: string, assignmentId: string, submissionId: string } }) {
    const dispatch = useDispatch();

    const [submissionData, setSubmissionData] = useState<Submission & CreateUpdateAnnotationRequest & { refetch: boolean; } | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    const appState = useSelector((state: RootState) => state.app);

    useEffect(() => {
        fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission/${params.submissionId}`, {
            method: "GET",
        })
            .then(res => res.json())
            .then((data: ApiResponse<GetSubmissionResponse>) => {
                if (data.success) {
                    setSubmissionData({
                        ...(data.payload as GetSubmissionResponse).submissionData,
                        refetch: false,
                        newAttachments: [],
                        removedAttachments: [],
                        gradeReceived: (data.payload as GetSubmissionResponse).submissionData.gradeReceived ? (data.payload as GetSubmissionResponse).submissionData.gradeReceived! : 0,
                        return: false,
                    });
                    dispatch(setRefetch(false));
                } else {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: (data.payload as ErrorPayload).remark,
                    }));
                }
            })
            .catch(_ => {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: "Please try again later",
                }));
            });
    }, [appState.refetch]);


    useEffect(() => {
        if (!submissionData) return;
        fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission/${params.submissionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (submissionData.refetch) {
                        dispatch(setRefetch(true));
                    }
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
    }, [submissionData]);

    if (!submissionData) return <></>;

    return (<>
        <h1 className="font-semibold text-3xl">Submission from: {submissionData.student.username}</h1>
        <div className="flex flex-row space-x-3 items-center">
            {submissionData.late && <Badge color="error">Late</Badge>}
            {submissionData.submitted && !submissionData.returned &&<Badge color="success">Submitted</Badge>}
            {submissionData.returned && <Badge color="primary">Returned</Badge>}
        </div>
        <h2 className="text-lg font-semibold my-3">Attachments</h2>
        {/* @description: student submissions */}
        {submissionData && submissionData.attachments.length === 0 && (
            <Empty 
                icon={HiPaperClip}
                title="No Attachments"
                description="No files have been attached to this submission."
            />
        )}
        {submissionData && submissionData.attachments.length > 0 && (
            <>
                <div className="flex flex-col w-full space-y-7">
                    {submissionData.attachments.map((attachment, index) => (
                        <FileDownload
                            key={index}
                            src={attachment.id}
                            name={attachment.name}
                            type={attachment.type}
                            thumbnailId={attachment.thumbnailId}
                        />
                    ))}
                </div>
            </>
        )}

        <h2 className="text-lg font-semibold mb-3 my-9">Annotations</h2>
        {/* @description: teacher annotations */}
        {submissionData && submissionData.annotations.length === 0 && (
            <Empty 
                icon={HiAnnotation}
                title="No Annotations"
                description="No annotations have been added to this submission."
            />
        )}
        {submissionData && submissionData.annotations.length > 0 && (
            <div className="flex flex-col w-full space-y-7">
                {submissionData.annotations.map((attachment, index) => (

                    /// FIXME: don't allow remove / add when returned !!
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
                                annotations: submissionData.annotations.filter(a => a.id !== attachment.id),
                                removedAttachments: (attachment.id) ? [{ id: attachment.id }] : [],
                            });
                        }}
                    />
                ))}
            </div>
        )}

        <div className="flex flex-row justify-end mt-3">
            {
                submissionData.returned && submissionData.assignment.graded && submissionData.assignment.maxGrade?
                <Input.Text className="rounded-tr-none rounded-br-none" type="number" max={submissionData.assignment.maxGrade} value={submissionData.gradeReceived} onChange={(e) => setSubmissionData({
                    ...submissionData,
                    gradeReceived: (!e.currentTarget.value || parseInt(e.currentTarget.value) < submissionData.assignment.maxGrade!) ? parseInt(e.currentTarget.value) : submissionData.assignment.maxGrade!,
                })} disabled/>
                :
                <Input.Text className="rounded-tr-none rounded-br-none" type="number" max={submissionData.assignment.maxGrade} value={submissionData.gradeReceived} onChange={(e) => setSubmissionData({
                    ...submissionData,
                    gradeReceived: (!e.currentTarget.value || parseInt(e.currentTarget.value) < submissionData.assignment.maxGrade!) ? parseInt(e.currentTarget.value) : submissionData.assignment.maxGrade!,
                })}/>
            }

            <div className="bg-primary-100 border border-primary-200 dark:bg-primary-800 dark:border-primary-600 px-4 py-3 rounded-tr-md rounded-br-md">

            <span>/{submissionData.assignment.maxGrade}</span>
            </div>
        </div>

        <div className="flex flex-row justify-end space-x-2">
            {/* @description: file upload (annotations) */}
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
                        });

                        e.target.files = null;
                        e.target.value = '';
                    })
                    .catch(_ => {
                        dispatch(addAlert({
                            level: AlertLevel.ERROR,
                            remark: "Please try again later",
                        }));
                    });
            }} />

            {/* button for attaching annotations, returning / unreturning assignments */}
            <div className="flex flex-row space-x-3 items-center mt-4">
                {
                    !submissionData.returned ?
                        (<>
                            <Button.Light onClick={() => fileInput?.current?.click()}>
                                Attach
                            </Button.Light>
                            <Button.Primary
                                onClick={() => {
                                    fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission/${params.submissionId}`, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            return: true,
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
                                Return
                            </Button.Primary>

                        </>) :
                        (<>
                            <span className="text-gray-500">Marked as returned</span>
                            <Button.Primary
                                onClick={() => {
                                    fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}/submission/${params.submissionId}`, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            return: true,
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
                                Unreturn
                            </Button.Primary>
                        </>)
                }
            </div>
        </div>
    </>);
}
