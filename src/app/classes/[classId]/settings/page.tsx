"use client";

import { useEffect, useState } from "react";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import Loading from "@/components/Loading";
import Input from "@/components/util/Input";
import { GetClassResponse, UpdateClassRequest } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";

export default function Assignments ({ params }: { params: { classId: string }}) {
    const classId = params.classId;

    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();
    
    const [classProps, setClassProps] = useState<UpdateClassRequest | null>(null);

    useEffect(() => {
        fetch(`/api/class/${classId}`, {
            method: 'GET',
        })
        .then(res => res.json())
        .then((data: ApiResponse<GetClassResponse>) => {
            if (data.success) {
                setClassProps({
                    id: (data.payload as GetClassResponse).classData.id,
                    name: (data.payload as GetClassResponse).classData.name,
                    section: (data.payload as GetClassResponse).classData.section.toString(), // @todo fix
                    subject: (data.payload as GetClassResponse).classData.subject,
                })
            }
        })
    }, [appState.refetch])

    useEffect(() => {
        if (!classProps) return;

        fetch(`/api/class/${classId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(classProps as UpdateClassRequest),
        })
        .then(res => res.json())
        .then((data: DefaultApiResponse) => {
            if (!data.success) {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: data.payload.remark,
                }))
            }
        })

    }, [classProps])

    if (!classProps) {
        return <div className="flex justify-center items-center h-screen w-full">
            <Loading />
        </div>
    }

    return (<div className="flex flex-col space-y-5 w-[40rem]">
            <Input.Text
                label="Class Name"
                type="text"
                value={classProps.name}
                onChange={(e) => setClassProps({ ...classProps, name: e.target.value })} />
            <Input.Text
                label="Class Section"
                type="number"
                min="1"
                value={Number(classProps.section)}
                onChange={(e) => setClassProps({ ...classProps, section: Number(e.target.value).toString() })} />
            <Input.Text
                label="Class Subject"
                type="text"
                value={classProps.subject}
                onChange={(e) => setClassProps({ ...classProps, subject: e.target.value })} />
    </div>);
}