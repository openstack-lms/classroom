import { useDispatch } from "react-redux";
import Button from "../ui/Button";
import Shelf from "../ui/Shelf";
import { addAlert } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { HiPencil, HiTrash } from "react-icons/hi";
import Assignment from "./Assignment";
import { useState } from "react";
import EditableLabel from "../ui/abstractions/EditableLabel";
import { trpc } from "@/utils/trpc";
import { RouterOutputs } from "@server/routers/_app";

export default function Section({
    classId,
    isTeacher,
    section,
    assignments
}: {
    classId: string,
    isTeacher: boolean,
    section: { id: string; name: string },
    assignments: RouterOutputs['assignment']['get'][],
}) {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState<boolean>(false);
    const [sectionName, setSectionName] = useState<string>(section.name);

    const updateSection = trpc.section.update.useMutation({
        onSuccess: () => {
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Section updated successfully" }));
            setEditing(false);
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
            setSectionName(section.name);
        }
    });

    const deleteSection = trpc.section.delete.useMutation({
        onSuccess: () => {
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Section deleted successfully" }));
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        }
    });

    return (
        <Shelf
    label={
                isTeacher ? (
            <EditableLabel
                label={sectionName}
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        onBlur={() => {
                            updateSection.mutate({
                                    id: section.id,
                                classId,
                                name: sectionName
                                });
                        }}
                        editing={editing}
                    />
                ) : (
                    <div className="font-semibold text-lg">{section.name}</div>
                )
            }
            content={
                <div className="flex flex-row justify-end space-x-2">
                    {isTeacher && (
                        <>
                            <Button.Light
                                onClick={() => setEditing(true)}
                                disabled={editing}
                            >
                                <HiPencil />
                            </Button.Light>
                            <Button.Light
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this section?")) {
                                        deleteSection.mutate({
                                            id: section.id,
                                            classId
                                        });
                                    }
                                }}
                                disabled={editing}
                            >
                                <HiTrash />
                            </Button.Light>
                        </>
                    )}
                </div>
            }
        >
            <div className="flex flex-col space-y-3">
                {assignments.map((assignment) => (
            <Assignment
                key={assignment.id}
                title={assignment.title}
                date={assignment.dueDate || new Date()}
                isTeacher={isTeacher}
                classId={classId}
                assignmentId={assignment.id}
                late={assignment.late}
                submitted={assignment.submitted}
                returned={assignment.returned}
            />
        ))}
            </div>
        </Shelf>
    );
}