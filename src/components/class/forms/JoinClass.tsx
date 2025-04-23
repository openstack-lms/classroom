"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import Input from "../../util/Input";
import Button from "../../util/Button";
import { ApiResponse, DefaultApiResponse } from "@/interfaces/api/Response";
import { JoinClassRequest } from "@/interfaces/api/Class";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function JoinClass() {
    const [classCode, setClassCode] = useState<string>('');
    const dispatch = useDispatch();

    return (<div className="flex flex-col space-y-3">
        <div className="flex flex-row space-x-2 text-sm">
            <Input.Text
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                placeholder="Class code here..." />
            <Button.Primary onClick={() => {
                handleApiPromise(fetch('/api/class/join', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({ code: classCode } as JoinClassRequest),
                }))
                .then(({ success, level, remark }) => {
                    dispatch(addAlert({ level, remark }));
                    if (success) {
                        dispatch(setRefetch(true));
                        dispatch(closeModal());
                    }
                });
            }}>Join</Button.Primary>
        </div>
    </div>);
}