"use client";

import { useState } from "react";
import { addAlert, closeModal } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import { AlertLevel } from "@/lib/alertLevel";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SUBJECT_OPTIONS, SECTION_OPTIONS } from "@/lib/commonData";
import { trpc } from "@/utils/trpc";
import { TRPCClientErrorLike } from "@trpc/client";
import { emitClassCreate } from "@/lib/socket";

export default function CreateClass() {
    const dispatch = useDispatch();

    const [classData, setClassData] = useState({
        name: '',
        subject: '',
        section: '',
    });

    const { mutate: createClass, isPending } = trpc.class.create.useMutation({
        onSuccess: (data) => {
            // Emit socket event for real-time update
            emitClassCreate(data.class);
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: 'Class created successfully' }));
            dispatch(closeModal());
        },
        onError: (error: TRPCClientErrorLike<any>) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        },
    });

    const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setClassData({ name: '', subject: '', section: '' });

        createClass({
            ...classData,
        });
    }

    return (<div className="w-[30rem]">
        <form onSubmit={handleCreateClass}>
            <div className="w-full flex flex-col space-y-3 mt-4">
                <Input.Text
                    label="Name" 
                    type="text"
                    value={classData.name} 
                    onChange={(e) => setClassData({ ...classData, name: e.target.value })} />
                <Input.SearchableSelect
                    label="Subject"
                    value={classData.subject}
                    searchList={SUBJECT_OPTIONS}
                    onChange={(e) => setClassData({ ...classData, subject: e.target.value })} />
                <Input.SearchableSelect
                    label="Section"
                    value={classData.section}
                    searchList={SECTION_OPTIONS}
                    onChange={(e) => setClassData({ ...classData, section: e.target.value })} />
            </div>
            <Button.Primary className="mt-5" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create'}
            </Button.Primary>
        </form>
    </div>)
}