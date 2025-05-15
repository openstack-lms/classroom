"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setTeacher } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "@/components/class/Sidebar";
import Loading from "@/components/Loading";
import { trpc } from '@/utils/trpc';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';

export default function ClassWrappper({ children, params }: {
    children: React.ReactNode;
    params: {
        classId: string;
    };
}) {
    const router = useRouter();
    const classId = params.classId;
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);
    
    useEffect(() => {
        if (!appState.user.loggedIn) {
            router.push('/login');
            return;
        }
    }, [appState.user.loggedIn, router]);

    const { data: classData, isLoading } = trpc.class.get.useQuery(
        { classId },
        { enabled: appState.user.loggedIn }
    );

    useEffect(() => {
        if (!classData?.class) return;

        const teacher = classData.class.teachers.find((teacher: User) => teacher.username === appState.user?.username);
        dispatch(setTeacher(!!teacher));
    }, [classData, appState.user?.username, dispatch]);

    if (!appState.user.loggedIn) {
        return null;
    }

    if (isLoading) {
        return <Loading />;
    }

    if (!classData?.class) {
        return null;
    }

    return (
        <div className="flex flex-row mx-5 space-x-7 h-full">
            <Sidebar teacher={appState.user.teacher} classId={classId} />
            <div className="h-full pt-7 overflow-y-scroll flex-grow pe-7 ps-1">
                <div className="mx-0 md:mx-4 lg:mx-8">
                    {children}
                </div>      
            </div>  
        </div>
    );
}