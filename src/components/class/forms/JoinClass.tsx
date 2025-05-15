"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { trpc } from "@/utils/trpc";
export default function JoinClass() {
    const [classCode, setClassCode] = useState<string>('');
    const dispatch = useDispatch();

    const joinClass = trpc.class.join.useMutation({
        onSuccess: (data) => {
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: 'Joined class successfully' }));
            dispatch(setRefetch(true));
            dispatch(closeModal());
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        },
    });

    return (<div className="flex flex-col space-y-3">
        <div className="flex flex-row space-x-2 text-sm">
            <Input.Text
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Class code here..." />
            <Button.Primary onClick={() => joinClass.mutate({ classCode })}>Join</Button.Primary>
        </div>
    </div>);
}