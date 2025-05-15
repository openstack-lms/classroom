"use client";

import { useEffect, useState } from "react";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import Loading from "@/components/Loading";
import Input from "@/components/ui/Input";
import { UpdateClassRequest } from "@/interfaces/api/Class";
import { SUBJECT_OPTIONS, SECTION_OPTIONS } from "@/components/ui/commonData";
import { trpc } from "@/utils/trpc";

export default function Assignments({ params }: { params: { classId: string } }) {
    const classId = params.classId;
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();
    
    const [classProps, setClassProps] = useState<UpdateClassRequest | null>(null);

    // Get class data
    const { data: classData, isLoading } = trpc.class.get.useQuery({ classId });

    // Update class mutation
    const updateClass = trpc.class.update.useMutation({
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        }
    });

    useEffect(() => {
        if (classData?.class) {
            setClassProps({
                id: classData.class.id,
                name: classData.class.name,
                section: classData.class.section.toString(),
                subject: classData.class.subject,
            });
        }
    }, [classData]);

    useEffect(() => {
        if (!classProps) return;

        updateClass.mutate({
            classId,
            name: classProps.name,
            section: classProps.section,
            subject: classProps.subject,
        });
    }, [classProps]);

    if (isLoading || !classProps) {
        return <div className="flex justify-center items-center h-screen w-full">
            <Loading />
        </div>;
    }

    return (<div className="flex flex-col space-y-5 w-[40rem]">
        <Input.Text
            label="Class Name"
            type="text"
            value={classProps.name}
            onChange={(e) => setClassProps({ ...classProps, name: e.target.value })} />
        <Input.SearchableSelect
            label="Class Section"
            value={classProps.section}
            searchList={SECTION_OPTIONS}
            onChange={(e) => setClassProps({ ...classProps, section: e.target.value })} />
        <Input.SearchableSelect
            label="Class Subject"
            value={classProps.subject}
            searchList={SUBJECT_OPTIONS}
            onChange={(e) => setClassProps({ ...classProps, subject: e.target.value })} />
    </div>);
}