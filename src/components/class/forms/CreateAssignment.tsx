"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { fileToBase64 } from "@/lib/fileToBase64";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useRef, useState } from "react";
import { HiTrash, HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import FileEdit from "../FileEdit";
import { emitAssignmentCreate, emitSectionCreate } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { RouterInputs } from "@server/routers/_app";

type FileData = {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
};

type CreateAssignmentInput = Omit<RouterInputs['assignment']['create'], 'files'> & {
    files: FileData[];
};

interface AssignmentData {
    title: string;
    instructions: string;
    dueDate: string;
    sectionId?: string;
    graded: boolean;
    maxGrade: number;
    weight: number;
    type: 'HOMEWORK' | 'QUIZ' | 'TEST' | 'PROJECT' | 'ESSAY' | 'DISCUSSION' | 'PRESENTATION' | 'LAB' | 'OTHER';
    rubric?: {
        criteria: Array<{
            name: string;
            description: string;
            maxPoints: number;
        }>;
    };
    files: Array<{
        id: string;
        type: string;
        name: string;
        data: string;
        size: number;
    }>;
    classId: string;
}

export default function CreateAssignment({ classId, sections }: { classId: string, sections: { id: string; name: string; }[] }) {
    const dispatch = useDispatch();
    const fileInput = useRef<HTMLInputElement>(null);
    const [showNewSection, setShowNewSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [assignmentData, setAssignmentData] = useState<AssignmentData>({
        title: '',
        instructions: '',
        dueDate: new Date().toISOString().split('T')[0],
        sectionId: undefined,
        graded: false,
        maxGrade: 100,
        weight: 1,
        type: 'HOMEWORK',
        rubric: {
            criteria: [
                { name: 'Criteria 1', description: 'Description 1', maxPoints: 25 },
                { name: 'Criteria 2', description: 'Description 2', maxPoints: 25 },
                { name: 'Criteria 3', description: 'Description 3', maxPoints: 25 },
                { name: 'Criteria 4', description: 'Description 4', maxPoints: 25 }
            ]
        },
        files: [],
        classId
    });

    const createAssignment = trpc.assignment.create.useMutation({
        onSuccess: (data) => {
            // Emit socket event for real-time update
            emitAssignmentCreate(classId, data.assignment);
        dispatch(addAlert({
            level: AlertLevel.SUCCESS,
                remark: 'Assignment created successfully',
            }));
            dispatch(closeModal());
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create assignment',
            }));
        }
    });

    const createSection = trpc.section.create.useMutation({
        onSuccess: (data) => {
            // Emit socket event for real-time update
            emitSectionCreate(classId, data.section);
                setAssignmentData({
                ...assignmentData,
                sectionId: data.section.id
            });
            setShowNewSection(false);
            setNewSectionName('');
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: 'Section created successfully',
            }));
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create section',
            }));
        }
    });

    const handleCreateAssignment = async () => {
        createAssignment.mutate(assignmentData);
    };

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
                        onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: new Date(e.target.value).toISOString() })}
                        value={new Date(assignmentData.dueDate).toISOString().split('T')[0]}
                        type="date" />
                </div>
                <div className="flex flex-col space-y-3">
                    <label className="text-xs font-bold">Section</label>
                    {showNewSection ? (
                        <div className="flex flex-col space-y-2">
                            <Input.Text
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                placeholder="Enter section name..."
                            />
                            <div className="flex flex-row space-x-2">
                                <Button.Light
                                    onClick={() => {
                                        createSection.mutate({
                                            classId,
                                            name: newSectionName
                                        });
                                    }}
                                >
                                    Add
                                </Button.Light>
                                <Button.Light
                                    onClick={() => {
                                        setShowNewSection(false);
                                        setNewSectionName('');
                                    }}
                                >
                                    Cancel
                                </Button.Light>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                    <Input.Select
                        className="rounded-md bg-gray-100 px-2 py-3 text-sm"
                                onChange={(e) => setAssignmentData({ ...assignmentData, sectionId: e.target.value === 'none' ? undefined : e.target.value })}
                        value={assignmentData.sectionId || 'none'}
                        >
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>{section.name}</option>
                                ))}
                        <option value="none">No section</option>
                    </Input.Select>
                            <Button.Light
                                onClick={() => setShowNewSection(true)}
                            >
                                + New Section
                            </Button.Light>
                        </div>
                    )}
                </div>
                <div className="flex flex-col space-y-3">
                    <Input.Select
                        label="Assignment Type"
                        value={assignmentData.type}
                        onChange={(e) => setAssignmentData({ ...assignmentData, type: e.target.value as AssignmentData['type'] })}
                    >
                        <option value="HOMEWORK">Homework</option>
                        <option value="QUIZ">Quiz</option>
                        <option value="TEST">Test</option>
                        <option value="PROJECT">Project</option>
                        <option value="ESSAY">Essay</option>
                        <option value="DISCUSSION">Discussion</option>
                        <option value="PRESENTATION">Presentation</option>
                        <option value="LAB">Lab</option>
                        <option value="OTHER">Other</option>
                    </Input.Select>

                    <div className="flex flex-col space-y-2">
                        <div className="flex flex-row space-x-2">
                            <label className="text-xs font-bold">Graded</label>
                            <input type="checkbox" checked={assignmentData.graded} onChange={(e) => setAssignmentData({ ...assignmentData, graded: !assignmentData.graded})} />
                        </div>
                        {assignmentData.graded && (
                            <div className="flex flex-col space-y-3">
                                <Input.Text 
                                    label="Max score" 
                                    onChange={(e) => setAssignmentData({...assignmentData, maxGrade: parseInt(e.currentTarget.value)})} 
                                    value={assignmentData.maxGrade} 
                                    type="number" 
                                />
                                <Input.Text 
                                    type="number" 
                                    label="Weight" 
                                    onChange={(e) => setAssignmentData({...assignmentData, weight: parseInt(e.currentTarget.value)})} 
                                    value={assignmentData.weight} 
                                />
                                
                                {/* Rubric Section */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-semibold mb-2">Rubric</h3>
                                    {assignmentData.rubric?.criteria.map((criterion, index) => (
                                        <div key={index} className="flex flex-col space-y-2 mb-3 p-3 border border-border rounded-md">
                                            <Input.Text
                                                label="Criterion Name"
                                                value={criterion.name}
                                                onChange={(e) => {
                                                    const newCriteria = [...assignmentData.rubric!.criteria];
                                                    newCriteria[index].name = e.target.value;
                                                    setAssignmentData({
                                                        ...assignmentData,
                                                        rubric: { ...assignmentData.rubric!, criteria: newCriteria }
                                                    });
                                                }}
                                            />
                                            <Input.Text
                                                label="Description"
                                                value={criterion.description}
                                                onChange={(e) => {
                                                    const newCriteria = [...assignmentData.rubric!.criteria];
                                                    newCriteria[index].description = e.target.value;
                                                    setAssignmentData({
                                                        ...assignmentData,
                                                        rubric: { ...assignmentData.rubric!, criteria: newCriteria }
                                                    });
                                                }}
                                            />
                                            <Input.Text
                                                label="Max Points"
                                                type="number"
                                                value={criterion.maxPoints}
                                                onChange={(e) => {
                                                    const newCriteria = [...assignmentData.rubric!.criteria];
                                                    newCriteria[index].maxPoints = parseInt(e.target.value);
                                                    setAssignmentData({
                                                        ...assignmentData,
                                                        rubric: { ...assignmentData.rubric!, criteria: newCriteria }
                                                    });
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <Button.Light
                                        onClick={() => {
                                            const newCriteria = [...assignmentData.rubric!.criteria];
                                            newCriteria.push({ name: '', description: '', maxPoints: 0 });
                                            setAssignmentData({
                                                ...assignmentData,
                                                rubric: { ...assignmentData.rubric!, criteria: newCriteria }
                                            });
                                        }}
                                    >
                                        Add Criterion
                                    </Button.Light>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col space-y-3">
            <label className="text-sm font-bold">files</label>
            {assignmentData.files.map((attachment) => (
                <FileEdit 
                    key={attachment.id}
                    name={attachment.name}
                    type={attachment.type}
                    src={attachment.data}
                    onDelete={() => setAssignmentData({ ...assignmentData, files: assignmentData.files.filter((f) => f.id !== attachment.id) })}
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
                                    size: e.target.files[0].size,
                                    data: base64,
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
                    onClick={handleCreateAssignment}
                    disabled={createAssignment.isPending}
                    >{createAssignment.isPending ? 'Creating...' : 'Create'}</Button.Primary>
                </div>
        </div>
    </div>);
}