"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setTeacher } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ClassSidebar from "@/components/class/ClassSidebar";
import { GetClassResponse } from "@/interfaces/api/Class";
import { User } from "@/interfaces/api/Auth";
import Loading from "@/components/Loading";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function ClassWrappper({ children, params }: {
    children: React.ReactNode;
    params: {
        classId: string;
    };
}) {
    const classId = params.classId;

    const dispatch = useDispatch();

    // @todo fix
    
    const [teachers, setTeachers] = useState<User[] | null>(null);
    const [loaded, setLoaded] = useState(false);

    const appState = useSelector((state: RootState) => state.app);

    useEffect(() => {
        if (!teachers)  return;

        const teacher = teachers.find((teacher: any) => teacher.username === appState.user?.username);

        if (teacher) {
            dispatch(setTeacher(true));
            setLoaded(true);

        }
        else {
            dispatch(setTeacher(false));
            setLoaded(true);
        }
    }, [teachers]);


    useEffect(() => {
        handleApiPromise<GetClassResponse>(fetch(`/api/class/${classId}`))
            .then(({ success, payload, level, remark }) => {
                if (success) {
                    setTeachers([...payload.classData.teachers]);
                } else {
                    dispatch(addAlert({ level, remark }));
                }
            });
    }, [appState.refetch]);


if (!loaded) {
    return <Loading />;
}
    return (
        
        <div className="flex flex-row mx-5 space-x-7 h-full">
            <ClassSidebar teacher={appState.user.teacher} classId={classId} />
            <div className="h-full pt-7 overflow-y-scroll flex-grow pe-7 ps-1">
                <div className="mx-0 md:mx-4 lg:mx-8">
                    {children}
                </div>      
            </div>  
        </div>
    );
}