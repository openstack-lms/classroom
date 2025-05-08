"use client";

import AnnouncementComponent from "@/components/class/Announcement";
import Empty from "@/components/util/Empty";
import Loading from "@/components/Loading";
import { Announcement, Class, GetClassResponse } from "@/interfaces/api/Class";
import { emitNewAnnouncement, initializeSocket, joinClass, leaveClass } from "@/lib/socket";
import { handleApiPromise, ProcessedResponse } from "@/lib/handleApiPromise";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import Textbox from "@/components/util/Textbox";
import Button from "@/components/util/Button";
import Input from "@/components/util/Input";

export default function ClassHome({ params }: { params: { classId: string } }) {
    const { classId } = params;
    const [classProps, setClassProps] = useState<Class & { announcements: Announcement[] } | null>(null);
    const [announcementTitle, setAnnouncementTitle] = useState<string>('');
    const [announcementContent, setAnnouncementContent] = useState<string>('');

    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();

    useEffect(() => {
        // Initialize socket connection
        const socket = initializeSocket();

        // Join class room
        joinClass(classId);

        // Handle new announcements
        socket.on('announcement-created', (announcement: Announcement) => {
            setClassProps(prev => {
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

    useEffect(() => {
        handleApiPromise<GetClassResponse>(fetch(`/api/class/${classId}`))
            .then(({ success, payload, level, remark }: ProcessedResponse<GetClassResponse>) => {
                if (success) {
                    setClassProps(payload.classData);
                    dispatch(setRefetch(false));
                }

                if (!success) {
                    dispatch(addAlert({
                        level: level,
                        remark: remark,
                    }));
                }
            });
    }, [appState.refetch]);

    if (!classProps) {
        return <div className="w-full h-full flex items-center justify-center">
            <Loading />
        </div>;
    }

    return (
        <div>
            <div className="space-y-5 mb-5">
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

                                handleApiPromise(fetch(`/api/class/${classId}/announcement`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        remarks: formattedContent
                                    }),
                                }))
                                .then(({ success, payload, level, remark }: ProcessedResponse) => {
                                    if (success && payload) {
                                        emitNewAnnouncement(classId, payload.announcement);
                                        dispatch(setRefetch(true));
                                        setAnnouncementContent("");
                                        setAnnouncementTitle("");
                                    }
                                    dispatch(addAlert({
                                        level: level,
                                        remark: remark,
                                    }));
                                });
                            }}>
                                Post Announcement
                            </Button.Primary>
                        </div>
                    )}
                </div>}
            </div>
            <div className="space-y-2">
                {
                    classProps.announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((announcement, index) => <AnnouncementComponent
                        remarks={announcement.remarks}
                        user={announcement.teacher}
                        id={announcement.id}
                        classId={params.classId}
                        key={index}
                    />)
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
