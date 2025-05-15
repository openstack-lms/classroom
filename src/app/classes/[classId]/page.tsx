"use client";

import { trpc } from "@/utils/trpc";
import type { RouterOutput } from "@server/routers/_app";
import { AlertLevel } from "@/lib/alertLevel";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import Textbox from "@/components/ui/Textbox";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/Loading";
import Empty from "@/components/ui/Empty";
import AnnouncementComponent from "@/components/class/Announcement";
import { emitNewAnnouncement, initializeSocket, joinClass, leaveClass } from "@/lib/socket";

type ClassData = RouterOutput['class']['get']['class'];
type Announcement = ClassData['announcements'][number];

export default function ClassHome({ params }: { params: { classId: string } }) {
    const { classId } = params;
    const [classProps, setClassProps] = useState<ClassData | null>(null);
    const [announcementTitle, setAnnouncementTitle] = useState<string>('');
    const [announcementContent, setAnnouncementContent] = useState<string>('');

    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    const { mutate: createAnnouncement } = trpc.announcement.create.useMutation();

    useEffect(() => {
        // Initialize socket connection
        const socket = initializeSocket();

        // Join class room
        joinClass(classId);

        // Handle new announcements
        socket.on('announcement-created', (announcement: Announcement) => {
            setClassProps((prev: ClassData | null) => {
                if (!prev) return null;
                return {
                    ...prev,
                    announcements: [announcement, ...prev.announcements]
                };
            });
        });

        // Cleanup on unmount
        return () => {
            leaveClass(classId);
            socket.off('announcement-created');
        };
    }, [classId]);

    const { data: classData, isLoading } = trpc.class.get.useQuery({ classId });

    useEffect(() => {
        if (classData?.class) {
            setClassProps({
                ...classData.class,
                announcements: classData.class.announcements.sort((a: Announcement, b: Announcement) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            });
        }
    }, [classData]);

    if (!classProps) {
        return <div className="w-full h-full flex items-center justify-center">
            <Loading />
        </div>;
    }

    return (
        <div>
            <div className="space-y-5 mb-5">
                <span className="text-sm text-gray-500">{appState.user.teacher ? 'Teacher' : 'Student'}</span>
                <div className="text-4xl font-semibold">{classProps.name}</div>
                <div className="text-sm text-gray-500">{classProps.subject}, Section {classProps.section}</div>
                {appState.user.teacher && 
                    <div className="space-y-2">
                        <Input.Text
                            value={announcementTitle}
                            placeholder="New Announcement Title"
                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                            className="w-full"
                    />
                    {announcementTitle.length > 0 && (
                        <div className="space-y-2">
                            <Textbox
                                content={announcementContent}
                                onChange={(content) => {
                                    setAnnouncementContent(content);
                                }}
                            />
                            <Button.Primary onClick={() => {
                                const formattedContent = `<h1>${announcementTitle}</h1>${announcementContent}`;

                                createAnnouncement({
                                    classId,
                                    remarks: formattedContent,
                                }, {
                                    onSuccess: (data) => {
                                        emitNewAnnouncement(classId, data.announcement);
                                        dispatch(setRefetch(true));
                                    },
                                });

                                setAnnouncementContent("");
                                setAnnouncementTitle("");
                            }}>
                                Post Announcement
                            </Button.Primary>
                        </div>
                    )}
                </div>}
            </div>
            <div className="space-y-2">
                {
                    classProps.announcements.sort((a: Announcement, b: Announcement) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    ).map((announcement: Announcement, index: number) => (
                        <AnnouncementComponent
                            remarks={announcement.remarks}
                            user={announcement.teacher}
                            id={announcement.id}
                            key={index}
                            classId={classId}
                        />
                    ))
                }

                {
                    classProps.announcements.length === 0 && (
                        <Empty 
                            icon={HiSpeakerphone}
                            title="No Announcements"
                            description="There are no announcements in this class yet."
                        />
                    )
                }
            </div>
        </div>
    );
}
