import { ApiResponse } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal, setRefetch } from "@/store/appSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Button from "@/components/util/Button";
import { handleApiPromise } from "@/lib/handleApiPromise";
import Loading from "@/components/Loading";
import Empty from "@/components/util/Empty";
import { HiDocumentText } from "react-icons/hi";

interface Student {
    id: string;
    username: string;
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

interface CreateAttendanceRequest {
    eventId?: string;
    present: { id: string; username: string }[];
    late: { id: string; username: string }[];
    absent: { id: string; username: string }[];
}

interface ClassResponse {
    classData: {
        students: Student[];
    };
}

interface ManageAttendanceProps {
    classId: string;
    eventId: string;
}

export default function ManageAttendance({ classId, eventId }: ManageAttendanceProps) {
    const dispatch = useDispatch();
    const [attendance, setAttendance] = useState<GetAttendanceResponse['attendance'][0] | null>(null);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        // First fetch the class data to get the list of students
        handleApiPromise<ApiResponse<ClassResponse>>(
            fetch(`/api/class/${classId}`)
        )
            .then(({ success, payload, level, remark }) => {
                if (success && 'classData' in payload && 'students' in (payload as ClassResponse).classData && Array.isArray((payload as ClassResponse).classData.students)) {
                    setStudents((payload as ClassResponse).classData.students);
                    
                    // Then fetch attendance record for this event
                    return handleApiPromise<ApiResponse<GetAttendanceResponse>>(
                        fetch(`/api/class/${classId}/attendance?eventId=${eventId}`)
                    );
                } else {
                    dispatch(addAlert({ level, remark }));
                    setLoading(false);
                }
            })
            .then((response) => {
                if (!response) return;
                
                const { success, payload, level, remark } = response;
                
                if (success && 'attendance' in payload && Array.isArray(payload.attendance)) {
                    if (payload.attendance.length > 0) {
                        setAttendance(payload.attendance[0]);
                    } else {
                        // No attendance record exists yet, update it with all students marked as absent
                        const newAttendance: CreateAttendanceRequest = {
                            eventId: eventId,
                            present: [],
                            late: [],
                            absent: students.map(student => ({ id: student.id, username: student.username }))
                        };
                        
                        handleApiPromise<ApiResponse<GetAttendanceResponse>>(
                            fetch(`/api/class/${classId}/attendance`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(newAttendance),
                            })
                        ).then(({ success, payload, level, remark }) => {
                            if (success && 'attendance' in payload && Array.isArray(payload.attendance) && payload.attendance.length > 0) {
                                setAttendance(payload.attendance[0]);
                            } else {
                                dispatch(addAlert({ level, remark }));
                            }
                            setLoading(false);
                        });
                    }
                } else {
                    dispatch(addAlert({ level, remark }));
                }
                setLoading(false);
            });
    }, [classId, eventId]);

    const updateAttendance = async (studentId: string, status: 'present' | 'late' | 'absent') => {
        if (!attendance) return;

        const newAttendance: CreateAttendanceRequest = {
            eventId: eventId,
            present: status === 'present' 
                ? [...attendance.present, { id: studentId, username: '' }]
                : attendance.present.filter(s => s.id !== studentId),
            late: status === 'late'
                ? [...attendance.late, { id: studentId, username: '' }]
                : attendance.late.filter(s => s.id !== studentId),
            absent: status === 'absent'
                ? [...attendance.absent, { id: studentId, username: '' }]
                : attendance.absent.filter(s => s.id !== studentId),
        };

        const response = await handleApiPromise<ApiResponse<GetAttendanceResponse>>(
            fetch(`/api/class/${classId}/attendance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAttendance),
            })
        );

        if (response.success) {
            // Fetch the updated attendance record
            const updatedResponse = await handleApiPromise<ApiResponse<GetAttendanceResponse>>(
                fetch(`/api/class/${classId}/attendance?eventId=${eventId}`)
            );
            
            if (updatedResponse.success && 'attendance' in updatedResponse.payload && Array.isArray(updatedResponse.payload.attendance) && updatedResponse.payload.attendance.length > 0) {
                setAttendance(updatedResponse.payload.attendance[0]);
                dispatch(addAlert({
                    level: AlertLevel.SUCCESS,
                    remark: 'Attendance updated successfully',
                }));
                dispatch(setRefetch(true));
            }
        } else {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: response.remark,
            }));
        }
    };

    if (loading) {
        return <div className="flex flex-col space-y-6 w-[30rem]">
            <Loading />
        </div>;
    }

    if (!attendance) {
        return <Empty 
            icon={HiDocumentText}
            title="No attendance record found"
            description="Please try again later"
        />;
    }

    // Combine all students from all statuses
    const allStudents = Array.from(new Set([
        ...attendance.present,
        ...attendance.late,
        ...attendance.absent,
    ].map(s => s.id)));

    return (
        <div className="flex flex-col space-y-6 w-[30rem]">
            <div className="bg-background-muted p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">Event Details</h3>
                {attendance.event && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-foreground-muted">Event Name:</div>
                        <div className="font-medium text-foreground">{attendance.event.name || 'Untitled Event'}</div>
                        <div className="text-foreground-muted">Date:</div>
                        <div className="font-medium text-foreground">{new Date(attendance.date).toLocaleDateString()}</div>
                        {attendance.event.location && (
                            <>
                                <div className="text-foreground-muted">Location:</div>
                                <div className="font-medium text-foreground">{attendance.event.location}</div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full border border-border dark:border-border-dark rounded-lg p-4 shadow-md bg-background dark:bg-background-subtle">
                <h2 className="text-xl font-semibold mb-4 text-foreground-primary">Attendance</h2>
                
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 mb-3 font-medium px-4 text-foreground-secondary">
                    <span>Student</span>
                    <span className="text-center">Present</span>
                    <span className="text-center">Late</span>
                    <span className="text-center">Absent</span>
                </div>
                <div className="space-y-2">
                    {allStudents.map((studentId) => {
                        const student = attendance.present.find(s => s.id === studentId) ||
                                     attendance.late.find(s => s.id === studentId) ||
                                     attendance.absent.find(s => s.id === studentId);
                        
                        return (
                            <div key={studentId} 
                                className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 items-center rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
                            >
                                <span className="font-medium text-foreground">{student?.username}</span>
                                <div className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`attendance-${studentId}`}
                                        className="w-4 h-4 rounded border-border text-success focus:ring-success"
                                        checked={attendance.present.some(s => s.id === studentId)}
                                        onChange={() => updateAttendance(studentId, 'present')}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`attendance-${studentId}`}
                                        className="w-4 h-4 rounded border-border text-warning focus:ring-warning"
                                        checked={attendance.late.some(s => s.id === studentId)}
                                        onChange={() => updateAttendance(studentId, 'late')}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`attendance-${studentId}`}
                                        className="w-4 h-4 rounded border-border text-error focus:ring-error"
                                        checked={attendance.absent.some(s => s.id === studentId)}
                                        onChange={() => updateAttendance(studentId, 'absent')}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-success mr-2"></div>
                        <span className="text-sm text-foreground-muted">Present: {attendance.present.length}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-warning mr-2"></div>
                        <span className="text-sm text-foreground-muted">Late: {attendance.late.length}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-error mr-2"></div>
                        <span className="text-sm text-foreground-muted">Absent: {attendance.absent.length}</span>
                    </div>
                </div>
                <Button.Primary onClick={() => dispatch(closeModal())}>
                    Close
                </Button.Primary>
            </div>
        </div>
    );
} 