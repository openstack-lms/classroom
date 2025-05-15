"use client";

import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";

import Alert from "@/components/Alert";
import { MdDarkMode, MdLightMode, MdClose } from "react-icons/md";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import { closeModal } from "@/store/appSlice";
import Loading from "@/components/Loading";

const ThemeToggle = ({ theme, onToggle }: { theme: string, onToggle: () => void }) => (
    <button 
        className={`
            border-border border px-5 py-3 rounded-md shadow-sm
            transition-all duration-200 ease-in-out
            ${theme === 'dark' 
                ? 'hover:bg-warning hover:text-white hover:border-warning' 
                : 'hover:bg-primary-600 hover:text-white hover:border-primary-600'
            }
        `} 
        onClick={onToggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
        {theme === 'dark' ? <MdLightMode className="size-5" /> : <MdDarkMode className="size-5" />}
    </button>
);

const Modal = ({ header, body, onClose }: { header: string, body: React.ReactNode, onClose: () => void }) => (
    <div className="absolute z-50 top-0 left-0 h-full w-full flex justify-center items-center bg-background-subtle/40 pointer-events-auto backdrop-blur-sm">
        <div 
            className="border-border bg-background px-9 py-7 border rounded-md shadow-md transform transition-all duration-300 ease-in-out"
        >
            <div className="flex flex-row justify-between items-center mb-6">
                <div className="text-lg font-bold text-foreground">
                    {header}
                </div>
                <button
                    onClick={onClose}
                    className="text-foreground-muted hover:text-foreground transition-colors duration-200 ease-in-out"
                    aria-label="Close modal"
                >
                    <MdClose className="size-5" />
                </button>
            </div>
            {body}
        </div>
    </div>
);

export default function AppWrapper({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    const appState = useSelector((state: RootState) => state.app);
    const [theme, setTheme] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const newTheme = prefersDark ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
        }
    }, []);

    useEffect(() => {
        if (!theme) return;
        
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    if (!theme) {
        return (
            <div className="h-screen w-full flex justify-center items-center bg-background dark:bg-background">
                <Loading />
            </div>
        );
    }

    return (
        <div className="text-sm h-full bg-background text-foreground dark:text-foreground dark:bg-background">
            {children}
            
            {/* Alerts Container */}
            <div className="fixed bottom-0 left-0 right-0 p-6 flex flex-col items-center pointer-events-none z-40">
                {appState.alerts.map((alert, index) => (
                    <Alert key={index} index={index} remark={alert.remark} level={alert.level} />
                ))}
            </div>

            {/* Modal */}
            {appState.modal.body && (
                <Modal
                    header={appState.modal.header}
                    body={appState.modal.body}
                    onClose={() => dispatch(closeModal())}
                />
            )}

            {/* Theme Toggle */}
            <div className="fixed bottom-0 right-0 p-6 z-30">
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
        </div>
    );
}