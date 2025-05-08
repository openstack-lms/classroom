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
import { HiCalendar, HiLocationMarker, HiClock, HiClipboardCheck, HiPencil, HiInformationCircle, HiCheck, HiX, HiClock as HiClockIcon } from "react-icons/hi";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";

interface AttendanceStatus {
    eventId: string;
    status: 'present' | 'late' | 'absent' | 'not_taken';
}

interface GetAttendanceResponse {
    attendance: {
        id: string;
        date: Date;
        event?: {
            id: string;
            name: string | null;
            startTime: Date;
            endTime: Date;
            location: string | null;
        } | null;
        present: { id: string; username: string }[];
        late: { id: string; username: string }[];
        absent: { id: string; username: string }[];
    }[];
}

export default function AttendancePage({ params }: { params: { classId: string } }) {
    const [events, setEvents] = useState<ClassEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        
        // Join the class room
        joinClass(params.classId);

        // Handle attendance updates
        socket.on('attendance-updated', (updatedAttendance: GetAttendanceResponse['attendance'][0]) => {
            if (updatedAttendance.event) {
                const studentId = appState.user.id;
                let status: 'present' | 'late' | 'absent' | 'not_taken' = 'not_taken';
                
                if (updatedAttendance.present.some(s => s.id === studentId)) {
                    status = 'present';
                } else if (updatedAttendance.late.some(s => s.id === studentId)) {
                    status = 'late';
                } else if (updatedAttendance.absent.some(s => s.id === studentId)) {
                    status = 'absent';
                }
                
                setAttendanceStatuses(prev => ({
                    ...prev,
                    [updatedAttendance.event!.id]: { eventId: updatedAttendance.event!.id, status }
                }));
            }
        });

        // Cleanup on unmount
        return () => {
            leaveClass(params.classId);
            socket.off('attendance-updated');
        };
    }, [params.classId, appState.user.id]);

    useEffect(() => {
        setLoading(true);
        handleApiPromise<{ events: ClassEvent[] }>(fetch(`/api/agenda/class/all/${params.classId}`, {
            method: 'GET',
        }))
            .then((response) => {
                if (response.success) {
                    setEvents([...response.payload.events]);
                    
                    // Fetch attendance status for each event
                    const fetchAttendancePromises = response.payload.events.map(event =>
                        handleApiPromise<GetAttendanceResponse>(
                            fetch(`/api/class/${params.classId}/attendance?eventId=${event.id}`)
                        ).then((attendanceResponse) => {
                            if (attendanceResponse.success && attendanceResponse.payload.attendance?.[0]) {
                                const attendance = attendanceResponse.payload.attendance[0];
                                const studentId = appState.user.id;
                                let status: 'present' | 'late' | 'absent' | 'not_taken' = 'not_taken';
                                
                                if (attendance.present.some(s => s.id === studentId)) {
                                    status = 'present';
                                } else if (attendance.late.some(s => s.id === studentId)) {
                                    status = 'late';
                                } else if (attendance.absent.some(s => s.id === studentId)) {
                                    status = 'absent';
                                }
                                
                                return { eventId: event.id, status };
                            }
                            return { eventId: event.id, status: 'not_taken' as const };
                        })
                    );
                    
                    Promise.all(fetchAttendancePromises).then(statuses => {
                        const statusMap = statuses.reduce((acc, status) => ({
                            ...acc,
                            [status.eventId]: status
                        }), {});
                        setAttendanceStatuses(statusMap);
                    });
                } else {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: response.remark,
                    }));
                }
                setLoading(false);
            });
    }, [appState.refetch]);

    const getStatusIcon = (status: AttendanceStatus['status']) => {
        switch (status) {
            case 'present':
                return <HiCheck className="h-5 w-5 text-green-500" />;
            case 'late':
                return <HiClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'absent':
                return <HiX className="h-5 w-5 text-red-500" />;
            default:
                return <span className="text-sm text-foreground-muted">-</span>;
        }
    };

    const getStatusText = (status: AttendanceStatus['status']) => {
        switch (status) {
            case 'present':
                return 'Present';
            case 'late':
                return 'Late';
            case 'absent':
                return 'Absent';
            default:
                return 'N/A';
        }
    };

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
        <div className="flex flex-col space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
                <h1 className="font-semibold text-3xl text-foreground-primary">Class Events & Attendance</h1>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Event Name</th>
                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Date & Time</th>
                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Location</th>
                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Remarks</th>
                            {appState.user.teacher ? (
                                <th className="text-right py-3 px-4 font-medium text-foreground-muted">Actions</th>
                            ) : (
                                <th className="text-left py-3 px-4 font-medium text-foreground-muted">Status</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event, index) => (
                            <tr 
                                key={index} 
                                className="border-b border-border hover:bg-background-muted/50 transition-colors duration-200"
                            >
                                <td className="py-4 px-4">
                                    <div className="flex items-center">
                                        <div className="w-1 h-8 bg-primary-500 rounded-full mr-3"></div>
                                        <span className="font-medium text-foreground-primary">
                                            {event.name || 'Class Event'}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center text-sm text-foreground-muted">
                                        <HiClock className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>
                                            {new Date(event.startTime).toLocaleDateString()} {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {event.location ? (
                                        <div className="flex items-center text-sm text-foreground-muted">
                                            <HiLocationMarker className="h-4 w-4 mr-2 flex-shrink-0" />
                                            <span>{event.location}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-foreground-muted">-</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    {event.remarks ? (
                                        <div className="flex items-start space-x-2 text-sm text-foreground-muted">
                                            <HiInformationCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <p className="line-clamp-2">{event.remarks}</p>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-foreground-muted">-</span>
                                    )}
                                </td>
                                {appState.user.teacher ? (
                                    <td className="py-4 px-4">
                                        <div className="flex justify-end space-x-2">
                                            <Button.SM 
                                                onClick={() => dispatch(openModal({
                                                    body: <ManageAttendance classId={params.classId} eventId={event.id} />,
                                                    header: 'Manage Attendance'
                                                }))}
                                                className="flex items-center text-foreground hover:text-primary-500"
                                            >
                                                <HiClipboardCheck className="h-5 w-5" />
                                            </Button.SM>
                                            <Button.SM 
                                                onClick={() => dispatch(openModal({
                                                    body: <UpdateClassEvent id={event.id} />,
                                                    header: 'Edit Event'
                                                }))}
                                                className="flex items-center text-foreground hover:text-primary-500"
                                            >
                                                <HiPencil className="h-5 w-5" />
                                            </Button.SM>
                                        </div>
                                    </td>
                                ) : (
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(attendanceStatuses[event.id]?.status || 'not_taken')}
                                            <span className="text-sm font-medium">
                                                {getStatusText(attendanceStatuses[event.id]?.status || 'not_taken')}
                                            </span>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
