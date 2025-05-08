"use client";

import { openModal } from "@/store/appSlice";
import { HiCalendar, HiClipboard, HiDocumentReport, HiHome, HiPencil, HiUserGroup } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import InviteCode from "./forms/InviteCode";
import Button from "../util/Button";
import { RootState } from "@/store/store";
import { useState, useEffect } from "react";
import { Sidebar } from "../util/Sidebar";

export default function ClassSidebar({ teacher, classId }: { teacher: boolean, classId: string }) {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);

    const navigationItems = [
        {
            icon: <HiHome className="size-5" />,
            label: "Home",
            href: `/classes/${classId}`,
        },
        {
            icon: <HiClipboard className="size-5" />,
            label: "Assignments",
            href: `/classes/${classId}/assignments`,
        },
        {
            icon: <HiUserGroup className="size-5" />,
            label: "Members",
            href: `/classes/${classId}/members`,
        },
        {
            icon: <HiDocumentReport className="size-5" />,
            label: "Grades",
            href: teacher ? `/classes/${classId}/grades` : `/classes/${classId}/grades/${appState.user.id}`,
        },
        {
            icon: <HiCalendar className="size-5" />,
            label: "Attendance",
            href: `/classes/${classId}/attendance`,
        },
        ...(teacher ? [{
            icon: <HiPencil className="size-5" />,
            label: "Settings",
            href: `/classes/${classId}/settings`,
        },
        ] : []),
    ];

    return (
        <Sidebar title="Classroom" navigationItems={navigationItems}>
            {teacher && (
                <div className="mt-auto">
                    <Button.Primary
                        className="w-full flex justify-center items-center font-semibold"
                        onClick={() => {
                            dispatch(openModal({ body: <InviteCode classId={classId} />, header: 'Invite' }))
                        }}
                    >
                        Invite
                    </Button.Primary>
                </div>
            )}
        </Sidebar>
    );
}