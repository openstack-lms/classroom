"use client"; // redundant

import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useRef, useState } from "react";
import { HiTrash, HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import Button from "../../util/Button";
import Input from "../../util/Input";
import FileEdit from "../FileEdit";
import { CreateAssignmentRequest } from "@/interfaces/api/Class";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function CreateAssignment({ classId, sections }: { classId: string, sections: any }) {
    const dispatch = useDispatch();

    const fileInput = useRef<HTMLInputElement>(null);

    const [assignmentData, setAssignmentData] = useState<CreateAssignmentRequest>({
        files: [],
        dueDate: new Date(),
        instructions: '',
        title: '',
        graded: false,
        maxGrade: 0,
        weight: 1,
    });

    return (<div
        className="w-[50rem] flex flex-col space-y-5">
        <Input.Text 
            label="Title"
            type="text"
            value={assignmentData.title}
            onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
            required />
        <div className="flex flex-row space-x-5">
            <div className="flex flex-col space-y-4 w-2/3">
                <Input.Textarea
                    label="Instructions"
                    value={assignmentData.instructions}
                    onChange={(e) => setAssignmentData({ ...assignmentData, instructions: e.target.value })}
                    required />
            </div>
            <div className="flex flex-col space-y-4 w-1/3 shrink-0">
                <div className="flex flex-col space-y-3">
                    <Input.Text
                        label="Due Date"
                        onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: new Date(e.target.value) })}
                        value={assignmentData.dueDate.toISOString().split('T')[0]}
                        type="date" />
                </div>
                <div className="flex flex-col space-y-3">
                    <label className="text-xs font-bold">Section</label>
                    <Input.Select
                        className="rounded-md bg-gray-100 px-2 py-3 text-sm"
                        onChange={(e) => setAssignmentData({ ...assignmentData, sectionId: e.target.value == 'none' ? undefined : e.target.value })}
                        value={assignmentData.sectionId || 'none'}
                        >
                        {
                            sections.map((section: any, index: number) => (
                                <option key={index} value={section.id}>{section.name}</option>
                            ))
                        }
                        <option value="none">No section</option>

                    </Input.Select>
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-row space-x-2">
                        <label className="text-xs font-bold">Graded</label>
                        <input type="checkbox" checked={assignmentData.graded} onChange={(e) => setAssignmentData({ ...assignmentData, graded: !assignmentData.graded})} />
                    </div>
                    {assignmentData.graded && <div className="flex flex-col space-y-3">
                        <Input.Text label="Max score" onChange={(e) => setAssignmentData({...assignmentData, maxGrade: parseInt(e.currentTarget.value)})} value={assignmentData.maxGrade} type="number" />
                        <Input.Text type="number" label="Weight" onChange={(e) => setAssignmentData({...assignmentData, weight: parseInt(e.currentTarget.value)})} value={assignmentData.weight} />
                    </div>}
                </div>
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <label className="text-sm font-bold">files</label>
            {assignmentData.files.map((attachment: any, index) => (
                <FileEdit 
                    key={index}
                    name={attachment.name}
                    type={attachment.type}
                    src={attachment.base64}
                    onDelete={() => setAssignmentData({ ...assignmentData, files: assignmentData.files.filter((f: any) => f.id !== attachment.id) })}
                />
            ))}
            {!assignmentData.files.length && (
                <div className="p-3 text-sm">No files attached</div>
            )}
            <input
                onChange={(e) => {
                    if (!e.target.files || !e.target.files[0]) return;
                    fileToBase64(e.target.files[0])
                        .then(base64 => {
                            if (!e.target.files || !e.target.files[0]) return;

                            setAssignmentData({
                                ...assignmentData,
                                files: [...assignmentData.files, {
                                    id: v4(),
                                    name: e.target.files[0].name,
                                    type: e.target.files[0].type,
                                    base64: base64,
                                }],
                            });

                            e.target.files = null;
                            e.target.value = '';
                        })
                        .catch(_ => {
                            dispatch(addAlert({
                                level: AlertLevel.ERROR,
                                remark: 'Failed to attach file',
                            }));
                        });
                }}
                type="file" ref={fileInput} className="hidden" />
                
                <div className="flex flex-row items-center justify-end space-x-3 text-sm">
                    <Button.Light
                    onClick={() => fileInput.current?.click()}
                    >Add File</Button.Light>
                   
                    <Button.Primary type="submit"
                    className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-md"
                    onClick={() => {
                        dispatch(addAlert({
                            level: AlertLevel.SUCCESS,
                            remark: 'Creating assignment',
                        }));

                        handleApiPromise(fetch(`/api/class/${classId}/assignment`, {
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...assignmentData,
                                files: assignmentData.files,
                            } as CreateAssignmentRequest),
                        }))
                        .then(({ success, payload, level, remark }) => {
                            dispatch(addAlert({ level, remark }));
                            if (success) {
                                dispatch(setRefetch(true));
                                dispatch(closeModal());
                                setAssignmentData({
                                    files: [],
                                    dueDate: new Date(),
                                    instructions: '',
                                    title: '',
                                    graded: false,
                                    maxGrade: 0,
                                    weight: 1,
                                });
                            }
                        });
                    }}
                    >Create</Button.Primary>
                </div>
        </div>
    </div>);
}