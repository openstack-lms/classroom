import { useDispatch } from "react-redux";
import Button from "./Button";
import InviteCode from "../class/forms/InviteCode";
import { openModal } from "@/store/appSlice";
import { useEffect, useState } from "react";

interface SidebarProps {
    title: string;
    navigationItems: {
        icon: React.ReactNode;
        label: string;
        href: string;
    }[];
    children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ title, navigationItems, children }) => {
    const dispatch = useDispatch();
    
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    return (<div className="flex flex-col h-full w-[17rem] py-5 pr-5 border-r border-border dark:border-border-dark">
        <span className="mb-3 font-semibold">{title}</span>
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
        {children}
    </div>)
}