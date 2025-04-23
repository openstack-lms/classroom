"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useState } from "react";
import { HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import Button from "../../util/Button";
import Input from "../../util/Input";
import { CreateSectionRequest } from "@/interfaces/api/Class";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function CreateSection({ classId }: Readonly<{
    classId: string,
}>) {
    const [name, setName] = useState<string>('');
    const dispatch = useDispatch();

    return (<div className="flex flex-col space-y-3">
        <div className="flex flex-row space-x-2">
            <Input.Text
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Section name here..." />
            <Button.Primary onClick={() => {
                handleApiPromise(fetch(`/api/class/${classId}/section`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify({ name: name } as CreateSectionRequest),
                }))
                .then(({ success, level, remark }) => {
                    dispatch(addAlert({ level, remark }));
                    if (success) {
                        dispatch(setRefetch(true));
                    }
                });
            }}>Create</Button.Primary>
        </div>
    </div>);
}