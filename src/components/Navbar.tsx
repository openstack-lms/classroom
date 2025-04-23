"use client";

import { openModal } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import CreateClass from "./class/forms/CreateClass";
import JoinClass from "./class/forms/JoinClass";
import Button from "./util/Button";
import { useState } from "react";
import { HiMenu, HiX, HiPlus } from "react-icons/hi";
import ProfilePicture from "@/components/util/ProfilePicture";

export default function Navbar() {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!appState.user.loggedIn) {
        return (
            <nav className="bg-background dark:bg-background-subtle p-4 w-full flex flex-row items-center px-7 border-b border-border dark:border-border-dark shadow-sm">
                <div className="flex-1">
                    <a href="/" className="flex flex-row items-center space-x-1">
                        <img src="/internal/favicon.svg" alt="logo" className="w-9" />
                        <h1 className="text-lg font-semibold text-foreground">Open<span className="font-bold text-primary-500">Stack</span></h1>
                    </a>
                </div>
                <div className="flex-1">
                    <div className="flex flex-row justify-end space-x-7">
                        <a href='/login' className="text-foreground hover:text-foreground-muted">Login</a>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-background p-4 w-full flex flex-col md:flex-row items-center px-4 md:px-7 border-b border-border shadow-sm">
            <div className="w-full md:w-auto flex items-center justify-between">
                <a href="/" className="flex flex-row items-center space-x-1">
                    <img src="/internal/favicon.svg" alt="logo" className="w-9" />
                    <h1 className="text-lg font-semibold text-foreground">Open<span className="font-bold text-primary-500">Stack</span></h1>
                </a>
                
                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden text-foreground p-2 hover:bg-background-subtle rounded-md"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile & Desktop Menu */}
            <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center w-full md:w-auto md:ml-auto mt-4 md:mt-0 space-y-4 md:space-y-0`}>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center w-full md:w-auto md:mx-4 text-foreground">
                    <a href='/classes' className="hover:text-foreground-muted w-full md:w-auto text-center">Classes</a>
                    <a href='/agenda' className="hover:text-foreground-muted w-full md:w-auto text-center">Agenda</a>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                    {/* Mobile Create/Join Button */}
                    <div className="md:hidden w-full">
                        <Button.Primary 
                            className="w-full flex items-center justify-center space-x-2"
                            onClick={() => {
                                setIsMenuOpen(false);
                                dispatch(openModal({
                                    body: (
                                        <div className="flex flex-col space-y-4">
                                            <Button.Light 
                                                className="w-full"
                                                onClick={() => dispatch(openModal({
                                                    body: <JoinClass />,
                                                    header: 'Join Class',
                                                }))}
                                            >
                                                Join Class
                                            </Button.Light>
                                            <Button.Primary 
                                                className="w-full"
                                                onClick={() => dispatch(openModal({
                                                    body: <CreateClass />,
                                                    header: 'Create Class'
                                                }))}
                                            >
                                                Create Class
                                            </Button.Primary>
                                        </div>
                                    ),
                                    header: 'Class Options',
                                }));
                            }}
                        >
                            <HiPlus className="h-5 w-5" />
                            <span>Add Class</span>
                        </Button.Primary>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden md:flex space-x-2">
                        <Button.Light onClick={() => dispatch(openModal({
                            body: <JoinClass />,
                            header: 'Join Class',
                        }))}>
                            Join
                        </Button.Light>
                        <Button.Primary onClick={() => dispatch(openModal({
                            body: <CreateClass />,
                            header: 'Create Class'
                        }))}>
                            Create
                        </Button.Primary>
                    </div>
                </div>
            </div>
        </nav>
    );
}