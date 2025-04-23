import { removeAlert, type Alert } from "@/store/appSlice";
import { HiInformationCircle, HiX } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { AlertLevel } from "@/lib/alertLevel";
import { useEffect, useState } from "react";

export default function Alert({
    remark,
    level,
    index,
}: Readonly<Alert & {
    index: number;
    remark: string;
    level: AlertLevel;
}>) {
    const dispatch = useDispatch();
    const [isExiting, setIsExiting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    let color = ''
    let exclamation = ''

    switch (level) {
        case AlertLevel.INFO:
            color = 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30';
            exclamation = 'Info!';
            break;
        case AlertLevel.SUCCESS:
            color = 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/30';
            exclamation = 'Success!';
            break;
        case AlertLevel.WARNING:
            color = 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30';
            exclamation = 'Warning!';
            break;
        case AlertLevel.ERROR:
            color = 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30';
            exclamation = 'Error!';
            break;
    }

    useEffect(() => {
        // Trigger entrance animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            // Start exit animation
            setIsExiting(true);
            // Remove alert after animation
            setTimeout(() => {
                dispatch(removeAlert(index));
            }, 300); // Match the animation duration
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div 
            className={`flex flex-row space-x-3 items-center p-4 mb-4 text-sm ${color} rounded-md shadow-sm pointer-events-auto transform transition-all duration-300 ease-in-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
            } ${isExiting ? 'translate-y-2 opacity-0' : ''}`}
            role="alert"
        >
            <HiInformationCircle className="size-4" />
            <div>
                <span className="font-medium">{exclamation}</span> {remark}
            </div>
            <HiX 
                className="size-4 cursor-pointer hover:text-foreground-muted transition-colors duration-200 ease-in-out" 
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        dispatch(removeAlert(index));
                    }, 300);
                }}
            />
        </div>
    );
}