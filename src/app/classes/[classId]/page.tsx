"use client";

import AnnouncementComponent from "@/components/class/Announcement";
import CreateAnnouncement from "@/components/class/forms/CreateAnnouncement";
import Empty from "@/components/util/Empty";
import Loading from "@/components/Loading";
import IconFrame from "@/components/util/IconFrame";
import { Announcement, Class, GetClassResponse } from "@/interfaces/api/Class";
import { ApiResponse, ErrorPayload } from "@/interfaces/api/Response";

import { AlertLevel } from "@/lib/alertLevel";
import { handleApiPromise, ProcessedResponse } from "@/lib/handleApiPromise";
import { addAlert, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { HiPencil, HiBell, HiSpeakerphone } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

export default function ClassHome({ params }: { params: { classId: string } }) {
    const { classId } = params;
    const [classProps, setClassProps] = useState<Class & { announcements: Announcement[] } | null>(null);

    const appState = useSelector((state: RootState) => state.app);

    const dispatch = useDispatch();

    useEffect(() => {
        handleApiPromise<GetClassResponse>(fetch(`/api/class/${classId}`))
            .then(({ success, payload, level, remark }: ProcessedResponse<GetClassResponse>) => {
                if (success)    {
                    setClassProps(payload.classData);
                    dispatch(setRefetch(false));
                }

                if (!success)   dispatch(addAlert({
                    level: level,
                    remark: remark,
                }))
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
            </div>
            <div className="space-y-2">
                <CreateAnnouncement classId={params.classId} />

                {
                    classProps.announcements.map((announcement, index) => <AnnouncementComponent
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
