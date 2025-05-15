"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addAlert, openModal, setRefetch } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import Button from "@/components/ui/Button";
import UpdateClassEvent from "@/components/class/forms/UpdateClassEvent";
import ManageAttendance from "@/components/class/forms/ManageAttendance";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import { HiCalendar, HiLocationMarker, HiClock, HiClipboardCheck, HiPencil, HiInformationCircle, HiCheck, HiX, HiClock as HiClockIcon } from "react-icons/hi";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@server/routers/_app";

interface AttendanceStatus {
    eventId: string;
    status: 'present' | 'late' | 'absent' | 'not_taken';
}

type RouterOutput = inferRouterOutputs<AppRouter>;
type AttendanceRecord = RouterOutput["attendance"]["get"]["attendance"][number];
type AttendanceQueryResult = RouterOutput["attendance"]["get"];

export default function AttendancePage({ params }: { params: { classId: string } }) {
    const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    // Fetch all attendance records for the class
    const { data: attendanceDataRaw, isLoading: attendanceLoading, refetch: refetchAttendance } = trpc.attendance.get.useQuery({ classId: params.classId });
    const attendanceData = attendanceDataRaw;

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        joinClass(params.classId);
        socket.on('attendance-updated', () => {
            refetchAttendance();
        });
        return () => {
            leaveClass(params.classId);
            socket.off('attendance-updated');
        };
    }, [params.classId, refetchAttendance]);

    const attendanceArray = (attendanceDataRaw as any)?.["attendance"] || [];
    const events = attendanceArray
        .map((record: AttendanceRecord) => record.event)
        .filter((event: AttendanceRecord["event"]): event is NonNullable<AttendanceRecord["event"]> => !!event);

    // Map attendance status for each event for the current user
    useEffect(() => {
        if (!attendanceData || !attendanceData.attendance) return;
        const statusMap: Record<string, AttendanceStatus> = {};
        for (const record of attendanceData.attendance) {
            if (!record.event) continue;
            const studentId = appState.user.id;
            let status: 'present' | 'late' | 'absent' | 'not_taken' = 'not_taken';
            if (record.present.some((s: { id: string }) => s.id === studentId)) {
                status = 'present';
            } else if (record.late.some((s: { id: string }) => s.id === studentId)) {
                status = 'late';
            } else if (record.absent.some((s: { id: string }) => s.id === studentId)) {
                status = 'absent';
            }
            statusMap[record.event.id] = { eventId: record.event.id, status };
        }
        setAttendanceStatuses(statusMap);
    }, [attendanceData, appState.user.id]);

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

    if (attendanceLoading) {
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
                        {events.map((event: AttendanceRecord["event"]) => (
                            <tr 
                                key={event.id} 
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
                                                    body: <UpdateClassEvent id={event.id} onUpdate={refetchAttendance} />,
                                                    header: 'Edit Event'
                                                }))}
                                                className="flex items-center text-foreground hover:text-primary-500"
                                            >
                                                <HiPencil className="h-5 w-5" />
                                            </Button.SM>
                                        </div>
                                    </td>
                                ) :
                                    <td className="py-4 px-4">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(attendanceStatuses[event.id]?.status || 'not_taken')}
                                            <span className="text-sm font-medium">
                                                {getStatusText(attendanceStatuses[event.id]?.status || 'not_taken')}
                                            </span>
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
