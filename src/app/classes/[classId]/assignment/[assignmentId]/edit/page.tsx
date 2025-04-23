"use client";

import FileEdit from "@/components/class/FileEdit";
import Empty from "@/components/util/Empty";
import { HiPaperClip } from "react-icons/hi";
import Button from "@/components/util/Button";
import Input from "@/components/util/Input";
import { Assignment, GetAssignmentResponse, UpdateAssignmentRequest } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { handleApiPromise } from "@/lib/handleApiPromise";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";


export default function _Assignment({ params }: { params: { classId: string, assignmentId: string } }) {
    const [assignmentData, setAssignmentData] = useState<UpdateAssignmentRequest & Assignment &  { refetch: boolean; sections: { name: string; id: string; }[] } | null>(null);
    const appState = useSelector((state: RootState) => state.app);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(true);

    const [classId, setClassId] = useState<string | null> (null);
    const dispatch = useDispatch();
    const fileInput = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // if (assignmentData && !assignmentData.refetch) return;

        handleApiPromise<GetAssignmentResponse>(fetch(`/api/class/${params.classId}/assignment/${params.assignmentId}`))
            .then(({ success, payload, level, remark }) => {
                if (success) {
                    setAssignmentData({
                        ...payload.assignmentData,
                        newAttachments: [],
                        removedAttachments: [],
                        refetch: false,
                        maxGrade: payload.assignmentData.maxGrade || 0,
                        sections: payload.assignmentData.sections || [],
                    });
                    setClassId(payload.classId);
                    dispatch(setRefetch(false));
                    setIsSaved(true);
                } else {
                    dispatch(addAlert({ level, remark }));
                }
            });
    }, [appState.refetch]);

    console.log(appState.refetch)

    useEffect(() => {
        if (!assignmentData) return;
        if (!assignmentData.refetch) return;

        saveChanges();
    }, [assignmentData]);

    useEffect(() => {
        setIsSaved(false);
    }, [assignmentData]);

    const saveChanges = () => {
        if (!assignmentData) return;
        
        setIsSaving(true);
        handleApiPromise(fetch(`/api/class/${classId}/assignment/${params.assignmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...assignmentData,
            }),
        }))
        .then(({ success, level, remark }) => {
            if (!success) {
                dispatch(addAlert({ level, remark }));
            }
            dispatch(setRefetch(true));
            setIsSaving(false);
            setIsSaved(true);
        });
    };

    return (
        <div className="mx-auto">
            {assignmentData && (<div className="flex flex-col max-w-[60rem] space-y-5">
                <Input.Text
                    label="Title"
                    type="text"
                    value={assignmentData.title}
                    onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })} />
                <div className="flex flex-row justify-between space-x-5">
                    <Input.Textarea
                    className="w-full"
                        label="Instructions"
                        value={assignmentData.instructions}
                        onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })} />
                    <div className="flex flex-col space-y-3 w-[15rem] shrink-0">
                        <Input.Text
                            type="date"
                            label="Due Date"
                            value={assignmentData.dueDate!.toString().slice(0, 10)}
                            onChange={(e) => setAssignmentData({
                                ...assignmentData,
                                refetch: false,
                                dueDate: new Date(e.target.value),
                            })} />
    
                        <span className="text-sm font-semibold">Section</span>
                        <Input.Select
                        className="bg-gray-100 p-3 rounded-md outline-none"
                        onChange={(e) => {
                            setAssignmentData({
                                ...assignmentData,
                                refetch: true,
                                section: {
                                    name: '',
                                    id: e.target.value,
                                }
                            });
                        }}
                        value={assignmentData?.section?.id ? assignmentData.section.id : 'none'}
                        >
                            {assignmentData.sections.map((section: { id: string, name: string}, index: number) => (
                                <option key={index} value={section.id}>{section.name}</option>
                            ))}
                            <option value='none'>None</option>
                        </Input.Select>
                        <div className="flex flex-col space-y-3">
                        <div className="flex flex-row space-x-2">
                            <label className="text-xs font-bold">Graded</label>
                            <input type="checkbox" checked={assignmentData.graded} onChange={(e) => setAssignmentData({ ...assignmentData, graded: !assignmentData.graded})} />
                        </div>
                        {assignmentData.graded && <div className="flex flex-col space-y-3">
                                <Input.Text label="Max score" onChange={(e) => setAssignmentData({...assignmentData, maxGrade: parseInt(e.currentTarget.value)})} value={assignmentData.maxGrade} type="number" />
                                <Input.Text label="Weight" onChange={(e) => setAssignmentData({...assignmentData, weight: parseInt(e.currentTarget.value)})} value={assignmentData.weight} type="number" />
                            </div>}
                        </div>
                    </div>
                    
                </div>

                <span className="text-sm font-semibold">Attachments</span>
                {assignmentData.attachments.length == 0 && (
                    <Empty 
                        icon={HiPaperClip}
                        title="No Attachments"
                        description="No files have been attached to this assignment."
                    /> 
                )}
                {/* @description: display and attach attachments to assignment */}
                {assignmentData.attachments.map((attachment, index) => (
                        <FileEdit
                            key={index}
                            src={attachment.path.replace('/public', '')}
                            name={attachment.name}
                            type={attachment.type}
                            onDelete={() => {
                                setAssignmentData({
                                    ...assignmentData,
                                    refetch: true,
                                    attachments: [...assignmentData.attachments.filter(_attachment => _attachment.id != attachment.id)],
                                    removedAttachments: [{ id: attachment.id }],
                                })
                            }} />
                    ))}
                <div className="flex flex-row justify-end space-x-2">
                    <Button.Primary className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
                        onClick={() => fileInput?.current?.click()}>Attach</Button.Primary>
                    {!isSaved && <Button.Primary 
                        onClick={saveChanges}
                        disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button.Primary>}
                </div>
                <input type="file" className="hidden" ref={fileInput} onChange={(e) => {
                    if (!e.target.files || !e.target.files[0]) return;

                    fileToBase64(e.target.files[0]).then(base64 => {
                        if (!e.target.files || !e.target.files[0]) return;
                        if (!base64) return;

                        setAssignmentData({
                            ...assignmentData,
                            refetch: true,
                            newAttachments: [
                                {
                                    id: v4(),
                                    name: e.target.files[0].name,
                                    type: e.target.files[0].type,
                                    base64: base64.toString(),
                                },
                            ]
                        });
                        
                        e.target.files = null;
                        e.target.value = '';
                    });
                }} />

            </div>)}
        </div>
    )
}