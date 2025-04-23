"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal } from "@/store/appSlice";
import { useEffect, useState } from "react";
import { HiClipboard, HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import Button from "../../util/Button";
import { ClassInviteResponse } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function InviteCode({ classId }: { classId: string }) {
    const dispatch = useDispatch();

    const [inviteCode, setInviteCode] = useState<string>('');

    useEffect(() => {
        handleApiPromise<ClassInviteResponse>(fetch(`/api/class/${classId}/invite`))
            .then(({ success, payload, level, remark }) => {
                if (success) {
                    setInviteCode(payload.session.id);
                } else {
                    dispatch(addAlert({ level, remark }));
                }
            });
    }, []);

    return <>
        <div className="flex flex-col w-[30rem]">
            <div className="flex flex-col space-y-5">
                <span className="text-foreground-muted text-sm">Class code</span>
                <span 
                onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    dispatch(addAlert({
                        level: AlertLevel.INFO,
                        remark: 'Copied to clipboard',
                    }));
                }}
                className="text-foreground cursor-pointer hover:text-foreground-muted text-4xl font-semibold flex flex-row items-center space-x-2">
                    <span>{inviteCode.toString()}</span>
                    <HiClipboard className="size-5" />
                </span>
                <div>
                    <Button.Primary 
                    onClick={() => {
                        handleApiPromise<ClassInviteResponse>(fetch(`/api/class/${classId}/invite`, {
                            method: 'POST',
                        }))
                        .then(({ success, payload, level, remark }) => {
                            if (success) {
                                setInviteCode(payload.session.id);
                            } else {
                                dispatch(addAlert({ level, remark }));
                            }
                        });
                    }}
                    >
                        Regenerate
                    </Button.Primary>
                </div>
            </div>
        </div>
    </>
}