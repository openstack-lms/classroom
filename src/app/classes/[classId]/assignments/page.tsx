"use client";

import { useEffect, useState } from "react";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addAlert, openModal, setRefetch } from "@/store/appSlice";
import Loading from "@/components/Loading";
import CreateAssignment from "@/components/class/forms/CreateAssignment";
import Empty from "@/components/util/Empty";
import CreateSection from "@/components/class/forms/CreateSection";
import { HiClipboardList, HiFilter, HiSearch } from "react-icons/hi";
import { initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { AlertLevel } from "@/lib/alertLevel";

import Button from "@/components/util/Button";
import Assignment from "@/components/class/Assignment";
import AssignmentGroup from "@/components/class/AssignmentGroup";
import { ApiResponse } from "@/interfaces/api/Response";
import { Assignment as AssignmentType, GetClassResponse } from "@/interfaces/api/Class";
import { handleApiPromise } from "@/lib/handleApiPromise";
import Input from "@/components/util/Input";
import IconFrame from "@/components/util/IconFrame";

type Section = {
    id: string;
    name: string;
};

type FilterState = {
    search: string;
    status: 'all' | 'submitted' | 'late' | 'returned' | 'pending';
    dueDate: 'all' | 'today' | 'week' | 'month';
};

export default function AssignmentListPage({ params }: { params: { classId: string } }) {
    const classId = params.classId;

    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    const [assignments, setAssignments] = useState<AssignmentType[] | null>(null);
    const [sections, setSections] = useState<Section[] | null>(null);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        status: 'all',
        dueDate: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch initial data
    useEffect(() => {
        handleApiPromise<GetClassResponse>(fetch(`/api/class/${classId}`, {}))
            .then(({ payload, level, success, remark }) => {
                if (success) {
                    setAssignments([...payload.classData.assignments])
                    setSections([...payload.classData.sections])
                    dispatch(setRefetch(false));
                } else {
                    dispatch(addAlert({
                        level: level,
                        remark: remark,
                    }))
                }
            })
    }, [appState.refetch])

    // Socket connection and event handling
    useEffect(() => {
        const socket = initializeSocket();
        
        // Join the class room
        joinClass(classId);

        // Handle assignment updates
        socket.on('assignment-updated', (updatedAssignment: AssignmentType, ack) => {
            setAssignments(prevAssignments => {
                if (!prevAssignments) return [updatedAssignment];
                
                const index = prevAssignments.findIndex(a => a.id === updatedAssignment.id);
                if (index === -1) {
                    return [...prevAssignments, updatedAssignment];
                }
                
                const newAssignments = [...prevAssignments];
                newAssignments[index] = updatedAssignment;
                return newAssignments;
            });
            if (ack) ack();
        });

        // Handle new assignments
        socket.on('assignment-created', (newAssignment: AssignmentType, ack) => {
            setAssignments(prevAssignments => {
                if (!prevAssignments) return [newAssignment];
                return [...prevAssignments, newAssignment];
            });
            if (ack) ack();
        });

        // Handle assignment deletions
        socket.on('assignment-deleted', (deletedAssignmentId: string, ack) => {
            setAssignments(prevAssignments => {
                if (!prevAssignments) return null;
                return prevAssignments.filter(a => a.id !== deletedAssignmentId);
            });
            if (ack) ack();
        });

        // Handle section creation
        socket.on('section-created', (newSection: Section, ack) => {
            setSections(prevSections => {
                if (!prevSections) return [newSection];
                return [...prevSections, newSection];
            });
            if (ack) ack();
        });

        // Handle section updates
        socket.on('section-updated', (updatedSection: Section, ack) => {
            setSections(prevSections => {
                if (!prevSections) return [updatedSection];
                
                const index = prevSections.findIndex(s => s.id === updatedSection.id);
                if (index === -1) {
                    return [...prevSections, updatedSection];
                }
                
                const newSections = [...prevSections];
                newSections[index] = updatedSection;
                return newSections;
            });
            if (ack) ack();
        });

        // Handle section deletions
        socket.on('section-deleted', (deletedSectionId: string, ack) => {
            setSections(prevSections => {
                if (!prevSections) return null;
                return prevSections.filter(s => s.id !== deletedSectionId);
            });
            if (ack) ack();
        });

        // Cleanup on unmount
        return () => {
            leaveClass(classId);
            socket.off('assignment-updated');
            socket.off('assignment-created');
            socket.off('assignment-deleted');
            socket.off('section-created');
            socket.off('section-updated');
            socket.off('section-deleted');
        };
    }, [classId]);

    const filterAssignments = (assignments: AssignmentType[]) => {
        if (!assignments) return [];
        
        return assignments.filter(assignment => {
            // Search filter
            if (filters.search && !assignment.title.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Status filter
            if (filters.status !== 'all') {
                switch (filters.status) {
                    case 'submitted':
                        if (!assignment.submitted) return false;
                        break;
                    case 'late':
                        if (!assignment.late) return false;
                        break;
                    case 'returned':
                        if (!assignment.returned) return false;
                        break;
                    case 'pending':
                        if (assignment.submitted || assignment.late || assignment.returned) return false;
                        break;
                }
            }

            // Due date filter
            if (filters.dueDate !== 'all' && assignment.dueDate) {
                const now = new Date();
                const dueDate = new Date(assignment.dueDate);
                const diffTime = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (filters.dueDate) {
                    case 'today':
                        if (diffDays !== 0) return false;
                        break;
                    case 'week':
                        if (diffDays < 0 || diffDays > 7) return false;
                        break;
                    case 'month':
                        if (diffDays < 0 || diffDays > 30) return false;
                        break;
                }
            }

            return true;
        });
    };

    if (!assignments) {
        return <div className="flex justify-center items-center h-full w-full">
            <Loading />
        </div>
    }

    const filteredAssignments = filterAssignments(assignments);

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex flex-row justify-between items-center mb-5">
                <div className="font-semibold text-4xl">Assignments</div>
                {
                    appState.user.teacher && (
                        <div className="flex flex-row space-x-2">
                            <Button.Light
                                onClick={() => dispatch(openModal({body: <CreateSection classId={classId} />, header: 'Create Section'}))}
                                >Add section</Button.Light>
                            <Button.Primary
                                onClick={() => dispatch(openModal({body: <CreateAssignment classId={classId} sections={sections} />, header: 'Create Assignment'}))}
                                >Add assignment</Button.Primary>
                        </div>
                    )
                }
            </div>

            {/* Filters */}
            <div className="flex flex-col space-y-4 bg-background p-6 rounded-xl shadow-sm border border-border">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex flex-row items-center space-x-3">
                        <IconFrame>
                            <HiFilter className="w-5 h-5" />
                        </IconFrame>
                        <span className="font-semibold">Filters</span>
                    </div>
                    <Button.Light 
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button.Light>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input.Text
                                    className="pl-10 w-full"
                                    placeholder="Search assignments..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                        </div>

                        {!appState.user.teacher && (
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Input.Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value as FilterState['status'] })}
                                >
                                    <option value="all">All</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="late">Late</option>
                                    <option value="returned">Returned</option>
                                    <option value="pending">Pending</option>
                                </Input.Select>
                            </div>
                        )}

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <Input.Select
                                value={filters.dueDate}
                                onChange={(e) => setFilters({ ...filters, dueDate: e.target.value as FilterState['dueDate'] })}
                            >
                                <option value="all">All</option>
                                <option value="today">Due Today</option>
                                <option value="week">Due This Week</option>
                                <option value="month">Due This Month</option>
                            </Input.Select>
                        </div>
                    </div>
                )}
            </div>

            {
                filteredAssignments.length === 0 && (
                    <Empty 
                        icon={HiClipboardList}
                        title="No Assignments"
                        description="No assignments match your current filters."
                    />
                )
            }

            {
                sections && sections.map((section: Section) => {
                    const sectionAssignments = filteredAssignments.filter((assignment: AssignmentType) => 
                        assignment && 
                        assignment.section && 
                        assignment.section.id === section.id
                    );

                    return (
                        <AssignmentGroup
                            section={section}
                            assignments={sectionAssignments}
                            key={section.id}
                            classId={classId}
                            isTeacher={appState.user.teacher}
                        />
                    );
                })
            }

            {
                filteredAssignments.filter(assignment => 
                    assignment && 
                    (!assignment.section || !assignment.section.id)
                ).map((assignment: AssignmentType, index: number) => (
                    <Assignment
                        key={index}
                        title={assignment.title}
                        date={assignment.dueDate!}
                        isTeacher={appState.user.teacher}
                        classId={classId}
                        assignmentId={assignment.id}
                        late={assignment.late}
                        submitted={assignment.submitted}
                        returned={assignment.returned}
                    />
                ))
            }
        </div>
    )
}