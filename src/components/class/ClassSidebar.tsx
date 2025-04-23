"use client";

import { openModal } from "@/store/appSlice";
import { HiCalendar, HiClipboard, HiDocumentReport, HiHome, HiPencil, HiUserGroup } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import InviteCode from "./forms/InviteCode";
import Button from "../util/Button";
import { RootState } from "@/store/store";
import { useState, useEffect } from "react";

export default function ClassSidebar({ teacher, classId }: { teacher: boolean, classId: string }) {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        ...(teacher ? [{
            icon: <HiPencil className="size-5" />,
            label: "Settings",
            href: `/classes/${classId}/settings`,
        },
        {
            icon: <HiCalendar className="size-5" />,
            label: "Attendance",
            href: `/classes/${classId}/attendance`,
        },
        ] : []),
    ];

    if (isMobile) {
        return (
            <div className="md:hidden fixed bottom-0 left-0 right-0 m-5 rounded-md bg-background dark:bg-background-subtle border border-border dark:border-border-dark z-50">
                <div className="flex justify-around items-center h-16">
                    {navigationItems.slice(0, 5).map((item, index) => (
                        <Button.Select
                            key={index}
                            href={item.href}
                            className="flex flex-col items-center justify-center space-y-1 px-3 py-2"
                        >
                            <div className="text-foreground dark:text-foreground-muted">
                                {item.icon}
                            </div>
                            <span className="text-xs text-foreground dark:text-foreground-muted">
                                {item.label}
                            </span>
                        </Button.Select>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-[17rem] py-5 pr-5 border-r border-border dark:border-border-dark">
            <span className="mb-3 font-semibold">Classroom</span>
            {navigationItems.map((item, index) => (
                <Button.Select
                    key={index}
                    href={item.href}
                    className="flex flex-row items-center space-x-3"
                >
                    <div className="dark:text-foreground-muted">{item.icon}</div>
                    <span className="text-foreground dark:text-foreground">{item.label}</span>
                </Button.Select>
            ))}
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
        </div>
    );
}