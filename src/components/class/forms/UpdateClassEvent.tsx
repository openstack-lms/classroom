import Button from "@/components/util/Button";
import Input from "@/components/util/Input";
import { ClassEvent, CreateClassEventRequest, CreatePersonalEventRequest, PersonalEvent } from "@/interfaces/api/Agenda";
import { ApiResponse, DefaultApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { formatDateForInput } from "@/lib/time";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function UpdateClassEvent({
    id
}: {
    id: string;
}) {
    const dispatch = useDispatch();

    const [eventData, setEventData] = useState<CreateClassEventRequest>({
        name: '',
        location: '',
        remarks: '',
        startTime: '',
        endTime: '',
        classId: id,
    });


    useEffect(() => {
        handleApiPromise<{event: ClassEvent}>(fetch(`/api/agenda/class/${id}`))
            .then(({ success, payload, level, remark }) => {
                if (success) {
                    setEventData({
                        ...eventData,
                        ...payload.event,
                    });
                } else {
                    dispatch(addAlert({ level, remark }));
                }
            });
    }, []);

    useEffect(() => {
        if (!eventData.startTime.toString().length || !eventData.endTime.toString().length) return;
        handleApiPromise(fetch(`/api/agenda/class/${id}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                name: eventData.name,
                remarks: eventData.remarks,
                location: eventData.location,
                startTime: eventData.startTime,
                endTime: eventData.endTime
            })
        }))
        .then(({ success, level, remark }) => {
            if (!success) {
                dispatch(addAlert({ level, remark }));
            } else {
                dispatch(setRefetch(true));
            }
        });
    }, [eventData])

    return (<>
        <div>
            <div className="flex flex-col space-y-3 mt-3">
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
            </div>
        </div>
    </>);
}