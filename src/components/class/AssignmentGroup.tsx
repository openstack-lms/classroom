import { useDispatch } from "react-redux";
import Button from "../util/Button";
import Shelf from "../util/Shelf";
import { addAlert, setRefetch } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { HiPencil, HiTrash } from "react-icons/hi";
import Assignment from "./Assignment";
import { useState } from "react";
import Input from "../util/Input";
import { Assignment as AssignmentType, DeleteSectionRequest, UpdateSectionRequest } from "@/interfaces/api/Class";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import EditableLabel from "../util/abstractions/EditableLabel";

export default function AssignmentGroup ({
    classId,
    isTeacher,
    section,
    assignments
}: {
    classId: string,
    isTeacher: boolean,
    section: any,
    assignments: AssignmentType[],
}) {
    const dispatch = useDispatch();

    const [editing, setEditing] = useState<boolean> (false);
    const [sectionName, setSectionName] = useState<string> (section.name);
    
    return (<Shelf 
    content={
        <>{isTeacher && (
            <div className="flex flex-row space-x-3 items-center">
                <Button.SM onClick={() => setEditing(!editing)}><HiPencil /></Button.SM>
                <Button.SM className="hover:text-red-400" onClick={() => {
                    fetch(`/api/class/${classId}/section`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            id: section.id
                        } as DeleteSectionRequest),
                    })
                        .then(res => res.json())
                        .then((data: DefaultApiResponse) => {
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
                        });
                }}><HiTrash /></Button.SM>
            </div>)}</>
    }
    label={
        <>
            <EditableLabel
                label={sectionName}
                value={sectionName}
                editing={editing}
                onChange={(e) => {
                        setSectionName(e.target.value);

                        fetch(`/api/class/${classId}/section`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                id: section.id,
                                name: e.target.value,
                            } as UpdateSectionRequest),
                        })
                            .then(res => res.json())
                            .then((data: DefaultApiResponse) => {
                                if (data.success) {
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
                            });
                    }}
            />
            {/* {
                (editing) ? (
                    <Input.Text
                        value={sectionName}
                        onChange={(e) => {
                            setSectionName(e.target.value);

                            fetch(`/api/class/${classId}/section`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    id: section.id,
                                    name: e.target.value,
                                } as UpdateSectionRequest),
                            })
                                .then(res => res.json())
                                .then((data: DefaultApiResponse) => {
                                    if (data.success) {
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
                                });
                        }}
                    />
                ) : (
                    <span>{section.name}</span>
                )
            } */}
        </>
    }>
        {assignments && assignments.filter((assignment: any) => assignment && assignment.section && assignment.section.id == section.id).map((assignment: any, index: number) => (
            <Assignment
                key={index}
                title={assignment.title}
                date={assignment.dueDate}
                isTeacher={isTeacher}
                classId={classId}
                assignmentId={assignment.id}
                late={assignment.late}
                submitted={assignment.submitted}
                returned={assignment.returned}
                 />
        ))}
        </Shelf>)
}