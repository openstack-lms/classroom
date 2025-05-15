"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { trpc } from "@/utils/trpc";
import { emitSectionCreate } from "@/lib/socket";
export default function CreateSection({ classId }: Readonly<{
    classId: string,
}>) {
    const [name, setName] = useState<string>('');
    const dispatch = useDispatch();

    const createSection = trpc.section.create.useMutation({
        onSuccess: (res) => {
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Section created successfully" }));
            emitSectionCreate(classId, res.section);
            setName('');
            dispatch(closeModal());
        },
        onError: (error: any) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        }
    });

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex flex-row space-x-2">
                <Input.Text
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Section name here..."
                />
                <Button.Primary onClick={() => {
                    createSection.mutate({
                        classId,
                        name
                    });
                }}>Create</Button.Primary>
            </div>
        </div>
    );
}