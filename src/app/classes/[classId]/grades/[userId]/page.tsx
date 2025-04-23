"use client";

import { Grade } from "@/interfaces/api/Class";
import { ApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Input from "@/components/util/Input";
import { handleApiPromise } from "@/lib/handleApiPromise";
import Empty from "@/components/util/Empty";
import { MdGrade } from "react-icons/md";
import Loading from "@/components/Loading";
import Button from "@/components/util/Button";

export default function AllGradesPage({ params }: { params: { classId: string, userId: string } }) {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();
    const [grades, setGrades] = useState<(Grade & { edited?: boolean })[]>([]);
    const [average, setAverage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGrades();
    }, [appState.refetch]);

    const fetchGrades = async () => {
        setIsLoading(true);
        const { success, payload, level, remark } = await handleApiPromise<{ grades: Grade[] }>(
            fetch(`/api/class/${params.classId}/grades/user/${params.userId}`)
        );

        if (success) {
            setGrades(payload.grades.map(grade => ({...grade, edited: false})));
        } else {
            dispatch(addAlert({ level, remark }));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (grades.length === 0) {
            setAverage(0);
            return;
        }

        let totalWeightedGrade = 0;
        let totalWeight = 0;

        grades.forEach(grade => {
            if (grade.gradeReceived != null) {
                totalWeightedGrade += (grade.gradeReceived * grade.assignment.weight) / grade.assignment.maxGrade!;
                totalWeight += grade.assignment.weight;
            }
        });

        setAverage(totalWeight > 0 ? totalWeightedGrade / totalWeight : 0);
    }, [grades]);

    const handleGradeChange = (index: number, value: string) => {
        const newGrades = [...grades];
        newGrades[index] = {
            ...newGrades[index],
            gradeReceived: value === '' ? null : Number(value),
            edited: true
        };
        setGrades(newGrades);
    };

    const saveChanges = async () => {
        const editedGrades = grades.filter(grade => grade.edited);
        
        const updatePromises = editedGrades.map(grade => 
            handleApiPromise(
                fetch(`/api/class/${params.classId}/assignment/${grade.assignment.id}/submission/${grade.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        gradeReceived: grade.gradeReceived,
                        newAttachments: [],
                        removedAttachments: []
                    }),
                })
            )
        );

        try {
            const results = await Promise.all(updatePromises);
            const success = results.every(result => result.success);
            
            if (success) {
                dispatch(addAlert({
                    level: AlertLevel.SUCCESS,
                    remark: 'Grades updated successfully'
                }));
                dispatch(setRefetch(true));
            }
        } catch (error) {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: 'Failed to update grades'
            }));
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-4xl text-foreground-primary">Grades</h1>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Loading />
                </div>
            ) : grades.length > 0 ? (
                <>
                    <div className="border border-border dark:border-border-dark rounded-lg p-4 shadow-md overflow-x-auto">
                    <div className="min-w-[50rem]">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 mb-3 font-medium px-4 text-foreground-secondary">
                            <span>Assignment</span>
                            <span>Grade</span>
                            <span>Total</span>
                            <span>%</span>
                            <span>Weight</span>
                        </div>
                        <div className="space-y-2">
                            {grades.map((grade, i) => (
                                <div 
                                    key={i} 
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center rounded-md hover:bg-gray-50 dark:hover:bg-background-subtle transition-colors"
                                >
                                    <span className="font-medium text-foreground-primary overflow-hidden text-ellipsis whitespace-nowrap max-w-[10rem]">{grade.assignment.title}</span>
                                    <span>
                                        {appState.user.teacher ? (
                                            <Input.Small
                                                type="number"
                                                value={grade.gradeReceived || ''}
                                                onChange={(e) => handleGradeChange(i, e.currentTarget.value)}
                                                className="w-full !py-1.5 !px-3"
                                                max={grade.assignment.maxGrade}
                                                min={0}
                                            />
                                        ) : (
                                            <span className="text-foreground-primary">
                                                {grade.gradeReceived ?? 'N/A'}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-foreground-secondary">{grade.assignment.maxGrade}</span>
                                    <span className="text-foreground-secondary">
                                        {grade.gradeReceived != null 
                                            ? `${((grade.gradeReceived / grade.assignment.maxGrade!) * 100).toFixed(1)}%` 
                                            : 'N/A'
                                        }
                                    </span>
                                    <span className="text-foreground-secondary">{grade.assignment.weight}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    </div>

                    {appState.user.teacher && grades.some(grade => grade.edited) && (
                        <div className="flex justify-end">
                            <Button.Primary
                                onClick={saveChanges}
                            >
                                Save Changes
                            </Button.Primary>
                        </div>
                    )}

                    <div className="grid grid-cols-[2fr_1fr] gap-4 p-4 border border-border dark:border-border-dark rounded-lg shadow-md">
                        <span className="font-medium text-foreground-primary">Average Grade</span>
                        <span className="text-foreground-primary font-medium">
                            {(average * 100).toFixed(1)}%
                        </span>
                    </div>
                </>
            ) : (
                <Empty
                    icon={MdGrade}
                    title="No Grades"
                    description="There are no grades available for this student yet. Grades will appear here once assignments are graded."
                />
            )}
        </div>
    );
}
