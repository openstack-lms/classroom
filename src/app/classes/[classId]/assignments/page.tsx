"use client";

import { useEffect, useState } from "react";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addAlert, openModal, setRefetch } from "@/store/appSlice";
import Loading from "@/components/Loading";
import CreateAssignment from "@/components/class/forms/CreateAssignment";
import Empty from "@/components/util/Empty";
import CreateSection from "@/components/class/forms/CreateSection";
import { HiClipboardList } from "react-icons/hi";

import Button from "@/components/util/Button";
import Assignment from "@/components/class/Assignment";
import AssignmentGroup from "@/components/class/AssignmentGroup";
import { ApiResponse } from "@/interfaces/api/Response";
import { Assignment as AssignmentType, GetClassResponse } from "@/interfaces/api/Class";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function AssignmentListPage({ params }: { params: { classId: string } }) {
    const classId = params.classId;

    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    const [assignments, setAssignments] = useState<AssignmentType[] | null>(null);
    const [sections, setSections] = useState<any>(null);

    useEffect(() => {
        handleApiPromise<GetClassResponse>(fetch(`/api/class/${classId}`, {}))
            .then(({ payload, level, success, remark }) => {
                if (success) {
                    setAssignments([...payload.classData.assignments])
                    setSections([...payload.classData.sections])
                    dispatch(setRefetch(false));
                } else {
                    dispatch(addAlert({
                        level: level,
                        remark: remark,
                    }))
                }
            })
    }, [appState.refetch])

    if (!assignments) {
        return <div className="flex justify-center items-center h-full w-full">
            <Loading />
        </div>
    }

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex flex-row justify-between items-center mb-5">
                <div className="font-semibold text-4xl">Assignments</div>
                {
                    appState.user.teacher && (
                        <div className="flex flex-row space-x-2">
                            <Button.Light
                                onClick={() => dispatch(openModal({body: <CreateSection classId={classId} />, header: 'Create Section'}))}
                                >Add section</Button.Light>
                            <Button.Primary
                                onClick={() => dispatch(openModal({body: <CreateAssignment classId={classId} sections={sections} />, header: 'Create Assignment'}))}
                                >Add assignment</Button.Primary>
                        </div>
                    )
                }
            </div>
            {
                assignments && !assignments.length && sections && !sections.length && (
                    <Empty 
                        icon={HiClipboardList}
                        title="No Assignments"
                        description="There are no assignments in this class yet."
                    />
                )
            }
            {
                sections && sections.map((section: any, index: number) => (
                    <AssignmentGroup
                        section={section}
                        assignments={assignments.filter((assignment: any) => assignment && assignment.section && assignment.section.id == section.id)}
                        key={index}
                        classId={classId}
                        isTeacher={appState.user.teacher}
                    />
                ))
            }
            {
                assignments && assignments.filter(assignment => assignment && !assignment.section).map((assignment: AssignmentType, index: number) => (
                    <Assignment
                        key={index}
                        title={assignment.title}
                        date={assignment.dueDate!}
                        isTeacher={appState.user.teacher}
                        classId={classId}
                        assignmentId={assignment.id}
                        late={assignment.late}
                        submitted={assignment.submitted}
                        returned={assignment.returned}
                    />
                ))
            }
        </div>
    )
}