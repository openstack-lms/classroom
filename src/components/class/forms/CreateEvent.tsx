import { useState } from "react";
import { addAlert, closeModal } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import { AlertLevel } from "@/lib/alertLevel";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { formatDateForInput } from "@/lib/time";
import { emitEventCreate } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { RouterInput } from "@server/routers/_app";
import type { TRPCClientErrorLike } from "@trpc/client";

type CreateEventInput = RouterInput['event']['create'];

interface Class {
    id: string;
    name: string;
    section: number;
    subject: string;
    dueToday: Array<{
        id: string;
        title: string;
        dueDate: Date;
    }>;
}

export default function CreateEvent({
    selectedDay
}: {
    selectedDay: Date;
}) {
    const dispatch = useDispatch();
    const [personal, setPersonal] = useState(true);
    const [eventData, setEventData] = useState<CreateEventInput>({
        name: '',
        location: '',
        remarks: '',
        startTime: selectedDay.toISOString(),
        endTime: new Date(selectedDay.getTime() + 60 * 60 * 1000).toISOString(),
        classId: '',
    });

    const { data: classes } = trpc.class.getAll.useQuery();

    const createEvent = trpc.event.create.useMutation({
        onSuccess: (data) => {
            // Emit socket event for real-time update
            emitEventCreate(data.event);
            dispatch(addAlert({
                level: AlertLevel.SUCCESS,
                remark: 'Event created successfully',
            }));
            dispatch(closeModal());
        },
        onError: (error: TRPCClientErrorLike<any>) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create event',
            }));
        }
    });

    const handleCreateEvent = async () => {
        createEvent.mutate(eventData);
    };

    return (
        <div className="w-[30rem]">
            <div className="flex flex-col space-y-3 mt-3">
                {personal && <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">Event name:</label>
                    <Input.Text type="text" placeholder="Event Name"
                        value={eventData.name}
                        onChange={(e) => setEventData({
                            ...eventData,
                            name: e.target.value,
                        })} />
                </div>}
                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">Location:</label>
                    <Input.Text placeholder="Location here"
                        value={eventData.location}
                        onChange={(e) => setEventData({
                            ...eventData,
                            location: e.target.value,
                        })}
                    />
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">Remarks:</label>
                    <Input.Textarea placeholder="Remarks here..."
                        value={eventData.remarks}
                        onChange={(e) => setEventData({
                            ...eventData,
                            remarks: e.target.value,
                        })}
                    />
                </div>
                <div className="flex flex-row justify-between space-x-2 w-full flex-grow-0 shrink-0">
                    <div className="flex flex-col space-y-1 w-full">
                        <label className="text-xs font-semibold">Start time:</label>
                        <Input.Text type="datetime-local"
                            value={formatDateForInput(eventData.startTime)}
                            onChange={(e) => setEventData({
                                ...eventData,
                                startTime: new Date(e.target.value + "Z").toISOString(),
                            })}
                            datetime-utc="true" />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                        <label className="text-xs font-semibold">End time:</label>
                        <Input.Text type="datetime-local"
                            value={formatDateForInput(eventData.endTime)}
                            onChange={(e) => setEventData({
                                ...eventData,
                                endTime: new Date(e.target.value + "Z").toISOString(),
                            })}
                            datetime-utc="true" />
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <div className="flex flex-row space-x-3">
                        <span className="font-bold text-xs">Personal</span>
                        <input type="checkbox" checked={personal} onChange={() => setPersonal(!personal)} />
                    </div>
                    {!personal && <Input.Select label={'Select Class'} onChange={(e) => setEventData({
                        ...eventData,
                        classId: e.target.value === 'none' ? undefined : e.target.value
                    })} value={eventData.classId || 'none'}>
                        {classes?.teacherInClass.map((cls: Class) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                        <option value='none'>None</option>
                    </Input.Select>}
                </div>
                <Button.Primary
                    onClick={handleCreateEvent}
                    disabled={createEvent.isPending}
                >
                    {createEvent.isPending ? 'Creating...' : 'Add Event'}
                </Button.Primary>
            </div>
        </div>
    );
}