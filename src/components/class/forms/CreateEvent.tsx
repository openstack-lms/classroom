import Button from "@/components/util/Button";
import Input from "@/components/util/Input";
import { CreateClassEventRequest, CreatePersonalEventRequest } from "@/interfaces/api/Agenda";
import { Class, GetClassesResponse } from "@/interfaces/api/Class";
import { ApiResponse, DefaultApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { formatDateForInput } from "@/lib/time";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function CreateEvent({
    selectedDay
}: {
    selectedDay: Date;
}) {
    const dispatch = useDispatch();

    const [eventData, setEventData] = useState<CreatePersonalEventRequest | CreateClassEventRequest>({
        name: '',
        location: '',
        remarks: '',
        startTime: selectedDay.toISOString(),
        endTime: selectedDay.toISOString(),
        classId: '',
    });

    const [teacherInClass, setTeacherInClass] = useState<{
        id: string;
        name: string;
        section: number;
        subject: string;
        dueToday: Array<{
            id: string;
            title: string;
            dueDate: Date;
        }>;
    }[]>([]);

    const [personal, setPersonal] = useState(true);

    useEffect(() => {
        handleApiPromise<GetClassesResponse>(fetch('/api/class'))
            .then(({ success, payload, level, remark }) => {
                if (success) {
                    setTeacherInClass([...payload.teacherInClass]);
                } else {
                    dispatch(addAlert({ level, remark }));
                }
            });
    }, []);

    return (<>
        <div>
            <div className="flex flex-col space-y-3 mt-3">
                {personal && <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">Event name:</label>
                    <Input.Text type="text" placeholder="Event Name"
                        value={eventData.name!.toString()}
                        onChange={(e) => setEventData({
                            ...eventData,
                            name: e.target.value,
                        })} />
                </div>}
                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">Location:</label>
                    <Input.Text placeholder="Location here"
                        value={eventData.location!.toString()}
                        onChange={(e) => setEventData({
                            ...eventData,
                            location: e.target.value,
                        })}
                    />
                </div>
                <div className="flex flex-col space-y-1">
                    <label className="text-xs font-semibold">Remarks:</label>
                    <Input.Textarea placeholder="Remarks here..."
                        value={eventData.remarks!.toString()}
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
                            value={formatDateForInput(eventData.startTime!.toString())}
                            onChange={(e) => setEventData({
                                ...eventData,
                                startTime: new Date(e.target.value + "Z").toISOString(),
                            })}
                            datetime-utc="true" />
                    </div>
                    <div className="flex flex-col space-y-1 w-full">
                        <label className="text-xs font-semibold">End time:</label>
                        <Input.Text type="datetime-local"
                            value={formatDateForInput(eventData.endTime!.toString())}
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
                        classId: e.target.value
                    })} value={(eventData as CreateClassEventRequest).classId.length ? (eventData as CreateClassEventRequest).classId : 'none'}>
                            {teacherInClass.map((e, i) => (
                                <option key={i} value={e.id}>{e.name}</option>
                            ))}
                            <option value='none'>None</option>
                    </Input.Select>}

                </div>
                <Button.Primary
                    onClick={() => {
                        // @ts-ignore ts-operand does not have to be optional
                        personal && delete eventData.classId;

                        handleApiPromise(fetch(`/api/agenda/${personal ? 'personal' : 'class'}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...eventData,
                                startTime: new Date(eventData.startTime).toUTCString(),
                                endTime: new Date(eventData.endTime).toUTCString(),
                            }),
                        }))
                        .then(({ success, level, remark }) => {
                            dispatch(addAlert({ level, remark }));
                            if (success) {
                                dispatch(setRefetch(true));
                                dispatch(closeModal());
                            }
                        });
                    }}>
                    Add Event
                </Button.Primary>
            </div>
        </div>
    </>);
}