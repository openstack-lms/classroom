import { useState } from 'react';
import { fmtTime, getTimeDifferenceInHours } from "@/lib/time";
import { addAlert, closeModal, openModal, setRefetch } from "@/store/appSlice";
import { HiClock, HiPencil, HiTrash } from "react-icons/hi";
import { useDispatch } from "react-redux";
import Button from "../ui/Button";
import UpdatePersonalEvent from "./forms/UpdatePersonalEvent";
import { AlertLevel } from "@/lib/alertLevel";
import UpdateClassEvent from "./forms/UpdateClassEvent";
import { emitEventDelete } from '@/lib/socket';
import { trpc } from '@/utils/trpc';
import type { TRPCClientErrorLike } from '@trpc/client';

interface EventProps {
    id: string;
    startTime: string | Date;
    endTime: string | Date;
    remarks: string;
    eventName: string;
    location: string;
    spacingPerHour: number;
    personal: boolean;
}

export default function Event({
    id,
    startTime,
    endTime,
    remarks,
    eventName,
    location,
    spacingPerHour,
    personal
}: EventProps) {
    const dispatch = useDispatch();

    const deleteEvent = trpc.event.delete.useMutation({
        onSuccess: () => {
            emitEventDelete(personal ? '' : id, id);
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: 'Event deleted successfully'
            }));
            dispatch(setRefetch(true));
            dispatch(closeModal());
        },
        onError: (error: TRPCClientErrorLike<any>) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Please try again later',
            }));
        }
    });

    return <div style={{
        top: spacingPerHour * (new Date(startTime).getUTCHours() + new Date(startTime).getUTCMinutes() / 60),
        height: getTimeDifferenceInHours(startTime, endTime) * spacingPerHour,
    }}
        className="absolute w-full h-full flex-grow-0 flex-shrink-0 overflow-hidden flex flex-row items-start space-x-3 bg-background-subtle hover:bg-background-active p-2 rounded-md"
        onClick={() => {
            dispatch(openModal({
                body: <div className="w-[30rem]">
                    <div className="flex flex-row justify-between items-center mt-3">
                        <span className="text-foreground-subtle text-xs">{(location) ? location : 'No location provided'}</span>
                        <span className="text-gray-400 text-xs">{fmtTime(new Date(startTime))} - {fmtTime(new Date(endTime))}</span>
                    </div>
                    <div className="flex flex-row justify-between">
                        <p className="text-gray-500 mt-3">{(remarks) ? remarks : 'No description provided'}</p>
                        <div className="flex flex-row items-center">
                            <Button.SM onClick={() => dispatch(openModal({
                                body: personal ? <UpdatePersonalEvent id={id} /> : <UpdateClassEvent id={id} />,
                                header: 'Update event'
                            }))}><HiPencil /></Button.SM>
                            <Button.SM onClick={() => deleteEvent.mutate({ id })} disabled={deleteEvent.isPending}><HiTrash className="hover:text-red-500" /></Button.SM>
                        </div>
                    </div>
                </div>, header: (eventName) ? eventName : 'Untitled event'
            }));
        }}
    >
        <div className="flex flex-col space-y-1">
            <div className="flex flex-row space-x-1 items-center">
                <span className="font-semibold text-sm hover:underline">{fmtTime(new Date(startTime))}</span>
                <div className="size-5 shrink-0 flex justify-center items-center">
                    <HiClock />
                </div>
            </div>
            <span className="text-gray-400 text-xs">{eventName}</span>
        </div>
    </div>
}