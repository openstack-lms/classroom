"use client";

import Loading from "@/components/Loading";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState, useMemo } from "react"
import { HiInbox, HiTrash, HiSearch, HiUsers } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import Empty from "@/components/ui/Empty";
import ProfilePicture from "@/components/ui/ProfilePicture";
import { initializeSocket, joinClass, leaveClass, emitMemberUpdate, emitMemberDelete } from "@/lib/socket";
import { trpc } from "@/utils/trpc";

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

    const changeRole = trpc.class.changeRole.useMutation({
        onSuccess: (data) => {
            emitMemberUpdate(classId, data.user);
            onUpdate();
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        },
    });

    const removeMember = trpc.class.removeMember.useMutation({
        onSuccess: (data) => {
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: 'User removed successfully' }));
            emitMemberDelete(classId, data.removedUserId);
            onUpdate();
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        },
    });

    const handleRoleChange = (newType: 'teacher' | 'student') => {
        changeRole.mutate({
            classId,
            userId: member.id,
            type: newType,
        });
    };

    const handleDelete = () => {
        removeMember.mutate({
            classId,
            userId: member.id,
        });
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
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<MemberFilter>('all');
    
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    const { data: classData, isLoading, refetch } = trpc.class.get.useQuery({ classId });

    useEffect(() => {
        if (appState.refetch) {
            refetch();
            dispatch(setRefetch(false));
        }
    }, [appState.refetch, dispatch, refetch]);

    useEffect(() => {
        const socket = initializeSocket();
        
        joinClass(classId);

        socket.on('member-updated', (updatedMember: Member) => {
            refetch();
        });

        socket.on('member-deleted', (deletedMemberId: string) => {
            refetch();
        });

        return () => {
            leaveClass(classId);
            socket.off('member-updated');
            socket.off('member-deleted');
        };
    }, [classId, refetch]);

    const members = useMemo(() => {
        if (!classData?.class) return { teachers: [], students: [] };

        return {
            teachers: classData.class.teachers.map((t: { id: string; username: string }) => ({ ...t, type: 'teacher' as const })),
            students: classData.class.students.map((s: { id: string; username: string }) => ({ ...s, type: 'student' as const })),
        };
    }, [classData]);

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

    if (isLoading || !members) {
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

                <div className="flex flex-col space-y-2">
                    {filteredMembers.length === 0 ? (
                        <Empty
                            icon={HiUsers}
                            title="No members found"
                            description="Try adjusting your search or filter"
                        />
                    ) : (
                        filteredMembers.map((member) => (
                            <MemberCard
                                key={member.id}
                                member={member}
                                isCurrentUser={member.id === appState.user?.id}
                                isTeacher={appState.user?.teacher}
                                classId={classId}
                                onUpdate={refetch}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}