"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import Button from "../../ui/Button";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { HiClipboard } from "react-icons/hi";
import type { RouterOutput } from "@server/routers/_app";
import type { TRPCClientError } from "@trpc/client";

type InviteCodeResponse = RouterOutput['class']['getInviteCode'];

export default function InviteCode({ classId }: { classId: string }) {
    const [inviteCode, setInviteCode] = useState<string>('');
    const dispatch = useDispatch();

    const createInviteCode = trpc.class.createInviteCode.useMutation({
        onSuccess: (data) => {
            setInviteCode(data.code);
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create invite code',
            }));
        }
    });

    const { data: inviteCodeData } = trpc.class.getInviteCode.useQuery({ classId });

    useEffect(() => {
        if (inviteCodeData?.code) {
            setInviteCode(inviteCodeData.code);
        }
    }, [inviteCodeData]);

    return (
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
                    className="text-foreground cursor-pointer hover:text-foreground-muted text-4xl font-semibold flex flex-row items-center space-x-2"
                >
                    <span>{inviteCode}</span>
                    <HiClipboard className="size-5" />
                </span>
                <div>
                    <Button.Primary 
                        onClick={() => createInviteCode.mutate({ classId })}
                        disabled={createInviteCode.isPending}
                    >
                        {createInviteCode.isPending ? 'Regenerating...' : 'Regenerate'}
                    </Button.Primary>
                </div>
            </div>
        </div>
    );
}