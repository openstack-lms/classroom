"use client";

import Loading from "@/components/Loading";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect } from "react";
import { HiClipboardCheck, HiDocumentReport, HiTrash } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { AlertLevel } from "@/lib/alertLevel";
import { HiPhoto } from "react-icons/hi2";
import { trpc } from "@/utils/trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import { RouterOutputs } from "@server/routers/_app";

type Class = RouterOutputs['class']['getAll']['teacherInClass'];

export default function Classes() {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);

    const { data: classes, isLoading, refetch } = trpc.class.getAll.useQuery();

    const { mutate: deleteClass } = trpc.class.delete.useMutation();

    useEffect(() => {
        if (appState.refetch) {
            refetch();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch, refetch, dispatch]);

    if (isLoading || !classes) {
        return <div className="w-full h-full flex items-center justify-center">
            <Loading />
        </div>
    }

    return (
        <div className="flex flex-col space-y-4 w-full h-full px-40 pt-5">
            <div className="flex flex-row items-center justify-between w-full">
                <h1 className="text-4xl font-semibold">Classes</h1>
            </div>

            <div className="flex flex-wrap">
                {classes.teacherInClass.map((cls: Class, index: number) => (
                <div key={index} className="pe-2 py-3">
                    <div className="rounded-md w-[15rem] flex flex-col space-x-2 p-2">
                        <a href={`/classes/${cls.id}`} className="flex flex-col hover:underline text-foreground px-4 py-5 bg-background-subtle rounded-md w-full overflow-hidden relative">
                            <div className="text-lg font-semibold text-foreground z-10">{cls.name}</div>
                            <div className="text-sm text-foreground text-nowrap z-10">Section {cls.section}, {cls.subject}</div>
                        </a>
                        <div className="flex flex-col space-y-2 px-2 py-3">
                            <span className="text-sm text-foreground-muted font-semibold">Due today</span>
                            <div className="flex flex-col space-y-1 h-[5rem] overflow-y-auto">
                                {
                                    cls.dueToday?.map((assignment: { id: string; title: string }, index: number) => (   
                                        <a key={index} href={`/classes/${cls.id}/assignment/${assignment.id}`} className="text-foreground-muted hover:underline">{assignment.title}</a>
                                    ))
                                }
                                {
                                    (!cls.dueToday || cls.dueToday.length === 0) && (
                                        <span className="text-foreground-muted">No assignments due today</span>
                                    )
                                }
                            </div>
                        </div>
                        <div className="flex flex-row space-x-2 px-2 py-3 border-border border-t">
                            <a href={`/classes/${cls.id}/assignments`}>
                                <HiClipboardCheck className="size-5 text-foreground-muted dark:hover:text-foreground hover:text-foreground" />
                            </a>
                            <a href={`/classes/${cls.id}/grades`}>
                                <HiDocumentReport className="size-5 text-foreground-muted dark:hover:text-foreground hover:text-foreground" />
                            </a>
                            <a onClick={() => {
                                deleteClass({ id: cls.id, classId: cls.id }, {
                                    onSuccess: () => {
                                    },
                                    onError: (error: TRPCClientErrorLike<any>) => {
                                        dispatch(addAlert({ 
                                            level: AlertLevel.ERROR, 
                                            remark: error.message 
                                        }));
                                    }
                                });
                            }}>
                                <HiTrash className="size-5 text-foreground-muted dark:hover:text-foreground hover:text-foreground" />                                
                            </a>
                        </div>
                    </div>
                </div>
                ))}
                
                {classes.studentInClass.map((cls: Class, index: number) => (
                <div key={index} className="pe-2 py-3">
                    <div className="rounded-md w-[15rem] flex flex-col space-x-2 p-2">
                        <a href={`/classes/${cls.id}`} className="flex flex-col hover:underline text-foreground px-4 py-5 bg-background-subtle rounded-md w-full overflow-hidden relative">
                            <div className="text-lg font-semibold text-foreground z-10">{cls.name}</div>
                            <div className="text-sm text-foreground text-nowrap z-10">Section {cls.section}, {cls.subject}</div>
                        </a>
                        <div className="flex flex-col space-y-2 px-2 py-3">
                            <span className="text-sm text-foreground-muted font-semibold">Due today</span>
                            <div className="flex flex-col space-y-1 flex-shrink-0 h-[5rem] overflow-y-auto">
                                {
                                    cls.dueToday?.map((assignment: { id: string; title: string }, index: number) => (   
                                        <a key={index} href={`/classes/${cls.id}/assignment/${assignment.id}`} className="text-foreground-muted hover:underline">{assignment.title}</a>
                                    ))
                                }
                                {
                                    (!cls.dueToday || cls.dueToday.length === 0) && (
                                        <span className="text-foreground-muted">No assignments due today</span>
                                    )
                                }
                            </div>
                        </div>
                        <div className="flex flex-row space-x-2 px-2 py-3 border-border border-t">
                            <a href={`/classes/${cls.id}/assignments`}>
                                <HiClipboardCheck className="size-5 text-foreground-muted dark:hover:text-foreground hover:text-foreground" />
                            </a>
                            <a href={`/classes/${cls.id}/grades/${appState.user.id}`}>
                                <HiDocumentReport className="size-5 text-foreground-muted dark:hover:text-foreground hover:text-foreground" />
                            </a>
                        </div>
                    </div>
                </div>
                ))}

                {classes.studentInClass.length === 0 && classes.teacherInClass.length === 0 && (
                    <div className="flex flex-col space-y-3 pt-12 pb-12 items-center justify-center w-full h-full">
                        <HiPhoto className="size-12 text-foreground-muted" />
                        <span className="text-foreground-muted">You are not attending any classes</span>
                    </div>
                )}
            </div>
        </div>
    );
}
