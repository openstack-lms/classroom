"use client";

import Loading from "@/components/Loading";
import Button from "@/components/util/Button";
import Input from "@/components/util/Input";
import { GetClassResponse, MemberRequest } from "@/interfaces/api/Class";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState, useMemo } from "react"
import { HiInbox, HiTrash, HiSearch, HiUsers } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { handleApiPromise } from "@/lib/handleApiPromise";
import Empty from "@/components/util/Empty";
import ProfilePicture from "@/components/util/ProfilePicture";
import { initializeSocket, joinClass, leaveClass, emitMemberUpdate, emitMemberDelete } from "@/lib/socket";

type Member = {
    id: string;
    username: string;
    type: 'teacher' | 'student';
};

type MemberFilter = 'all' | 'teachers' | 'students';

const MemberCard = ({ member, isCurrentUser, isTeacher, classId, onUpdate }: {
    member: Member;
    isCurrentUser: boolean;
    isTeacher: boolean;
    classId: string;
    onUpdate: () => void;
}) => {
    const dispatch = useDispatch();

    const handleRoleChange = async (newType: 'teacher' | 'student') => {
        const { success, level, remark } = await handleApiPromise(fetch(`/api/class/${classId}/member`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: member.id, type: newType } as MemberRequest),
        }));

        dispatch(addAlert({ level, remark }));
        
        if (success) {
            emitMemberUpdate(classId, { ...member, type: newType });
            onUpdate();
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/class/${classId}/member`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: member.id, type: member.type } as MemberRequest),
            });
            const data = await response.json();

            if (data.success) {
                dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: 'User removed successfully' }));
                emitMemberDelete(classId, member.id);
                onUpdate();
            } else {
                dispatch(addAlert({ level: AlertLevel.ERROR, remark: data.remark }));
            }
        } catch {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: 'Please try again later' }));
        }
    };

    return (
        <div className="flex flex-row justify-between items-center py-3 px-4 rounded-md hover:bg-background-muted/50 transition-all duration-200">
            <div className="flex flex-row items-center space-x-4">
                <ProfilePicture 
                    username={member.username} 
                    size="md" 
                    showName={true}
                    namePosition="right"
                />
                {!isTeacher && (
                    <span className="text-sm text-foreground-muted capitalize px-2 py-1 bg-background-muted rounded-full">
                        {member.type}
                    </span>
                )}
            </div>
            
            {isTeacher && !isCurrentUser ? (
                <div className="flex flex-row items-center space-x-3">
                    <Input.Select
                        value={member.type}
                        onChange={(e) => handleRoleChange(e.target.value as 'teacher' | 'student')}
                    >
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </Input.Select>
                    <Button.SM 
                        onClick={handleDelete}
                        className="text-foreground-muted hover:text-error hover:bg-error/10 transition-colors duration-200"
                    >
                        <HiTrash className="size-4" />
                    </Button.SM>
                </div>
            ) : (
                <>
                    {isCurrentUser ? (
                        <div className="text-sm text-foreground-muted bg-background-muted px-3 py-1 rounded-full">
                            You
                        </div>
                    ) : (
                        <div className="text-foreground-muted capitalize px-2 py-1 bg-background-muted rounded-full text-sm">
                            {member.type}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default function Members({ params }: { params: { classId: string } }) {
    const { classId } = params;
    const [members, setMembers] = useState<{ teachers: Member[], students: Member[] }>();
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<MemberFilter>('all');
    
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    useEffect(() => {
        if (appState.refetch || !members) {
            fetchMembers();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch, dispatch]);

    useEffect(() => {
        const socket = initializeSocket();
        
        joinClass(classId);

        socket.on('member-updated', (updatedMember: Member) => {
            setMembers(prevMembers => {
                if (!prevMembers) return { teachers: [], students: [] };
                
                const isTeacher = updatedMember.type === 'teacher';
                const list = isTeacher ? prevMembers.teachers : prevMembers.students;
                const otherList = isTeacher ? prevMembers.students : prevMembers.teachers;
                
                const index = list.findIndex(m => m.id === updatedMember.id);
                if (index === -1) {
                    const newList = [...list, updatedMember];
                    const newOtherList = otherList.filter(m => m.id !== updatedMember.id);
                    return {
                        teachers: isTeacher ? newList : newOtherList,
                        students: isTeacher ? newOtherList : newList
                    };
                }
                
                const newList = [...list];
                newList[index] = updatedMember;
                return {
                    teachers: isTeacher ? newList : prevMembers.teachers,
                    students: isTeacher ? prevMembers.students : newList
                };
            });
        });

        socket.on('member-deleted', (deletedMemberId: string) => {
            setMembers(prevMembers => {
                if (!prevMembers) return { teachers: [], students: [] };
                
                return {
                    teachers: prevMembers.teachers.filter(m => m.id !== deletedMemberId),
                    students: prevMembers.students.filter(m => m.id !== deletedMemberId)
                };
            });
        });

        return () => {
            leaveClass(classId);
            socket.off('member-updated');
            socket.off('member-deleted');
        };
    }, [classId]);

    const fetchMembers = async () => {
        const { success, payload, level, remark } = await handleApiPromise<GetClassResponse>(
            fetch(`/api/class/${classId}`)
        );

        if (success) {
            setMembers({
                teachers: payload.classData.teachers.map(t => ({ ...t, type: 'teacher' as const })),
                students: payload.classData.students.map(s => ({ ...s, type: 'student' as const })),
            });
        } else {
            dispatch(addAlert({ level, remark }));
        }
    };

    const filteredMembers = useMemo(() => {
        if (!members) return [];

        let result: Member[] = [];
        if (filter === 'all' || filter === 'teachers') {
            result = [...result, ...members.teachers];
        }
        if (filter === 'all' || filter === 'students') {
            result = [...result, ...members.students];
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(member => 
                member.username.toLowerCase().includes(query)
            );
        }

        return result;
    }, [members, filter, searchQuery]);

    if (!members) {
        return (
            <div className="h-full w-full flex justify-center items-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2">
                    <h1 className="font-semibold text-4xl text-foreground">Members</h1>
                    <span className="text-foreground-muted">
                        {members.teachers.length + members.students.length} members
                    </span>
                </div>

                <div className="flex flex-row space-x-4">
                    <div className="flex-1 relative">
                        <Input.Text 
                            placeholder="Search members..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
                    </div>
                    <Input.Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as MemberFilter)}
                    >
                        <option value="all">All Members</option>
                        <option value="teachers">Teachers</option>
                        <option value="students">Students</option>
                    </Input.Select>
                </div>

                <div className="flex flex-col">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((member, index) => (
                            <MemberCard
                                key={member.id || index}
                                member={member}
                                isCurrentUser={appState.user.username === member.username}
                                isTeacher={appState.user.teacher}
                                classId={classId}
                                onUpdate={() => dispatch(setRefetch(true))}
                            />
                        ))
                    ) : (
                        <Empty
                            icon={HiUsers}
                            title={searchQuery ? "No Members Found" : "No Members"}
                            description={searchQuery 
                                ? "No members found matching your search criteria" 
                                : "There are no members in this class yet. Add members to get started."}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}