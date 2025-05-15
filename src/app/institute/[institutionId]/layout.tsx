"use client";

import { useParams } from "next/navigation";
import { HiAcademicCap, HiUserGroup, HiBookOpen, HiChartBar, HiCog, HiAdjustments } from "react-icons/hi";
import Sidebar from "@/components/layout/Sidebar";
import { Notifications } from "@/components/institute/Notifications";
import { useState } from "react";

export default function InstituteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "info" as const,
      message: "Welcome to your institution dashboard",
      timestamp: "Just now",
      read: false,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const navigationItems = [
    {
      icon: <HiAcademicCap className="size-5" />,
      label: "Overview",
      href: `/institute/${institutionId}`,
    },
    {
      icon: <HiUserGroup className="size-5" />,
      label: "Users",
      href: `/institute/${institutionId}/users`,
    },
    {
      icon: <HiBookOpen className="size-5" />,
      label: "Classes",
      href: `/institute/${institutionId}/classes`,
    },
    {
      icon: <HiChartBar className="size-5" />,
      label: "Analytics",
      href: `/institute/${institutionId}/analytics`,
    },
    {
      icon: <HiCog className="size-5" />,
      label: "Bulk Operations",
      href: `/institute/${institutionId}/bulk`,
    },
    {
      icon: <HiAdjustments className="size-5" />,
      label: "Settings",
      href: `/institute/${institutionId}/settings`,
    },
  ];

  return (
    <div className="flex flex-row mx-5 space-x-7 h-full">
      <Sidebar />
      <div className="h-full pt-7 overflow-y-scroll flex-grow pe-7 ps-1">
        <div className="mx-0 md:mx-4 lg:mx-8">
          {children}
        </div>      
      </div>
      <Notifications 
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onClearAll={handleClearAll}
      />
    </div>
  );
} 