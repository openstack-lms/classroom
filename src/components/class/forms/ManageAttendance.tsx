import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, closeModal } from "@/store/appSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Button from "@/components/ui/Button";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import { HiDocumentText, HiUserAdd, HiX } from "react-icons/hi";
import { emitAttendanceUpdate } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@server/routers/_app";
import SearchableMultiSelect from "@/components/ui/SearchableMultiSelect";

type RouterOutput = inferRouterOutputs<AppRouter>;
type AttendanceRecord = RouterOutput["attendance"]["get"]["attendance"][number];
type ClassData = RouterOutput["class"]["get"];

interface Student {
    id: string;
    username: string;
}

interface ManageAttendanceProps {
    classId: string;
    eventId: string;
}

export default function ManageAttendance({ classId, eventId }: ManageAttendanceProps) {
    const dispatch = useDispatch();
    const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddStudents, setShowAddStudents] = useState(false);

    // Fetch class data to get students
    const { data: classData } = trpc.class.get.useQuery({ classId });
    const students = (classData as ClassData)?.class?.students || [];

    // Fetch attendance record for this event
    const { data: attendanceData, isLoading: attendanceLoading } = trpc.attendance.get.useQuery({ 
        classId,
        eventId 
    });

    // Update attendance mutation
    const updateAttendanceMutation = trpc.attendance.update.useMutation({
        onSuccess: (data) => {
            setAttendance(data.attendance);
            emitAttendanceUpdate(classId, data.attendance);
        },
        onError: (error) => {
            dispatch(addAlert({ 
                level: AlertLevel.ERROR, 
                remark: error.message 
            }));
        }
    });

    useEffect(() => {
        if (!attendanceLoading && attendanceData) {
            if (attendanceData.attendance.length > 0) {
                setAttendance(attendanceData.attendance[0]);
                } else {
                // No attendance record exists yet, create one with all students marked as absent
                updateAttendanceMutation.mutate({
                    classId,
                    eventId,
                    attendance: {
                        eventId,
                            present: [],
                            late: [],
                        absent: students.map((student: Student) => ({ id: student.id, username: student.username }))
                    }
                });
                }
                setLoading(false);
        }
    }, [attendanceLoading, attendanceData, classId, eventId, students, updateAttendanceMutation]);

    const updateAttendance = async (studentId: string, status: 'present' | 'late' | 'absent') => {
        if (!attendance) return;

        const newAttendance = {
            eventId,
            present: status === 'present' 
                ? [...attendance.present, { id: studentId, username: '' }]
                : attendance.present.filter((s: { id: string }) => s.id !== studentId),
            late: status === 'late'
                ? [...attendance.late, { id: studentId, username: '' }]
                : attendance.late.filter((s: { id: string }) => s.id !== studentId),
            absent: status === 'absent'
                ? [...attendance.absent, { id: studentId, username: '' }]
                : attendance.absent.filter((s: { id: string }) => s.id !== studentId),
        };

        updateAttendanceMutation.mutate({
            classId,
            eventId,
            attendance: newAttendance
        });
    };

    const handleAddStudents = (selectedStudentIds: string[]) => {
        if (!attendance) return;

        // Add new students to absent list
        const newStudents = selectedStudentIds
            .filter(id => !allStudents.includes(id))
            .map(id => {
                const student = students.find((s: Student) => s.id === id);
                return { id, username: student?.username || '' };
            });

        const newAttendance = {
            eventId,
            present: attendance.present,
            late: attendance.late,
            absent: [...attendance.absent, ...newStudents]
        };

        updateAttendanceMutation.mutate({
            classId,
            eventId,
            attendance: newAttendance
        });

        setShowAddStudents(false);
    };

    const handleRemoveStudent = (studentId: string) => {
        if (!attendance) return;

        const newAttendance = {
            eventId,
            present: attendance.present.filter((s: { id: string }) => s.id !== studentId),
            late: attendance.late.filter((s: { id: string }) => s.id !== studentId),
            absent: attendance.absent.filter((s: { id: string }) => s.id !== studentId),
        };

        updateAttendanceMutation.mutate({
            classId,
            eventId,
            attendance: newAttendance
        });
    };

    if (loading || attendanceLoading) {
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
    ].map((s: { id: string }) => s.id)));

    // Get students not in attendance
    const availableStudents = students.filter((student: Student) => !allStudents.includes(student.id));

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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-foreground-primary">Attendance</h2>
                    {availableStudents.length > 0 && (
                        <Button.Primary
                            onClick={() => setShowAddStudents(!showAddStudents)}
                            className="flex items-center gap-2"
                        >
                            <HiUserAdd className="h-4 w-4" />
                            Add Students
                        </Button.Primary>
                    )}
                </div>

                {showAddStudents && (
                    <div className="mb-4">
                        <SearchableMultiSelect
                            options={availableStudents.map((student: Student) => ({
                                id: student.id,
                                label: student.username
                            }))}
                            selectedIds={[]}
                            onSelectionChange={handleAddStudents}
                            placeholder="Select students to add..."
                            searchPlaceholder="Search students..."
                            className="mb-4"
                        />
                    </div>
                )}
                
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 mb-3 font-medium px-4 text-foreground-secondary">
                    <span>Student</span>
                    <span className="text-center">Present</span>
                    <span className="text-center">Late</span>
                    <span className="text-center">Absent</span>
                    <span className="w-8"></span>
                </div>
                <div className="space-y-2">
                    {allStudents.map((studentId) => {
                        const student = attendance.present.find((s: { id: string }) => s.id === studentId) ||
                                     attendance.late.find((s: { id: string }) => s.id === studentId) ||
                                     attendance.absent.find((s: { id: string }) => s.id === studentId);
                        
                        return (
                            <div key={studentId} 
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center rounded-md hover:bg-background-muted dark:hover:bg-background-subtle transition-colors"
                            >
                                <span className="font-medium text-foreground">{student?.username}</span>
                                <div className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`attendance-${studentId}`}
                                        className="w-4 h-4 rounded border-border text-success focus:ring-success"
                                        checked={attendance.present.some((s: { id: string }) => s.id === studentId)}
                                        onChange={() => updateAttendance(studentId, 'present')}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`attendance-${studentId}`}
                                        className="w-4 h-4 rounded border-border text-warning focus:ring-warning"
                                        checked={attendance.late.some((s: { id: string }) => s.id === studentId)}
                                        onChange={() => updateAttendance(studentId, 'late')}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <input
                                        type="radio"
                                        name={`attendance-${studentId}`}
                                        className="w-4 h-4 rounded border-border text-error focus:ring-error"
                                        checked={attendance.absent.some((s: { id: string }) => s.id === studentId)}
                                        onChange={() => updateAttendance(studentId, 'absent')}
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveStudent(studentId)}
                                    className="text-foreground-muted hover:text-error transition-colors"
                                >
                                    <HiX className="h-4 w-4" />
                                </button>
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