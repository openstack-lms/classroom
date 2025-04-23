"use client";

import { ClassEvent } from "@/interfaces/api/Agenda";
import { ApiResponse, ErrorPayload } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, openModal, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleApiPromise } from "@/lib/handleApiPromise";
import Button from "@/components/util/Button";
import UpdateClassEvent from "@/components/class/forms/UpdateClassEvent";
import ManageAttendance from "@/components/class/forms/ManageAttendance";
import Loading from "@/components/Loading";
import Empty from "@/components/util/Empty";
import { HiCalendar, HiLocationMarker, HiClock, HiClipboardCheck, HiPencil, HiInformationCircle } from "react-icons/hi";

export default function AttendancePage({ params }: { params: { classId: string } }) {
    const [events, setEvents] = useState<ClassEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true);
        handleApiPromise(fetch(`/api/agenda/class/all/${params.classId}`, {
            method: 'GET',
        }))
            .then((data: ApiResponse<{ events: ClassEvent[] }>) => {
                if (data.success) {
                    setEvents([...(data.payload as { events: ClassEvent[] }).events])
                }
                else {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: (data.payload as ErrorPayload).remark,
                    }));
                }
                setLoading(false);
            });
    }, [appState.refetch]);

    if (loading) {
        return <div className="w-full h-full flex items-center justify-center">
            <Loading />
        </div>;
    }

    if (events.length === 0) {
        return <Empty 
            icon={HiCalendar}
            title="No events found"
            description="There are no events scheduled for this class"
        />;
    }

    return (
        <div className="flex flex-col space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center space-x-3">
                <h1 className="font-semibold text-3xl text-foreground-primary">Class Events & Attendance</h1>
            </div>

            <div className="grid gap-6">
                {events.map((event, index) => (
                    <div key={index} className="w-full border border-border rounded-xl shadow-sm bg-background dark:bg-background-subtle hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                            <div className="flex justify-between items-start gap-6">
                                <div className="space-y-4 flex-grow">
                                    <div>
                                        <h3 className="text-xl font-medium text-foreground-primary">
                                            {event.name || 'Untitled Event'}
                                        </h3>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm text-foreground-muted">
                                            <HiClock className="h-5 w-5 mr-2 flex-shrink-0" />
                                            <span>{new Date(event.startTime).toLocaleDateString()} {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}</span>
                                        </div>
                                        
                                        {event.location && (
                                            <div className="flex items-center text-sm text-foreground-muted">
                                                <HiLocationMarker className="h-5 w-5 mr-2 flex-shrink-0" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        {event.remarks && (
                                            <div className="flex items-start space-x-2 text-sm text-foreground-muted">
                                                <HiInformationCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                <p>{event.remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-3">
                                    <Button.Primary 
                                        onClick={() => dispatch(openModal({
                                            body: <ManageAttendance classId={params.classId} eventId={event.id} />,
                                            header: 'Manage Attendance'
                                        }))}
                                        className="flex items-center justify-center w-36"
                                    >
                                        <HiClipboardCheck className="h-5 w-5 mr-2" />
                                        Attendance
                                    </Button.Primary>
                                    
                                    <Button.Light 
                                        onClick={() => dispatch(openModal({
                                            body: <UpdateClassEvent id={event.id} />,
                                            header: 'Edit Event'
                                        }))}
                                        className="flex items-center justify-center w-36"
                                    >
                                        <HiPencil className="h-5 w-5 mr-2" />
                                        Edit
                                    </Button.Light>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
