"use client";

import { useState, useRef, useEffect } from "react";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import React from "react";
import Button from "./Button";
import Empty from "../Empty";

interface ShelfProps {
    label: React.ReactNode | string;
    content: React.ReactNode;
    children: React.ReactNode;
}

const Shelf: React.FC<ShelfProps> = ({ label, content, children }) => {
    const [opened, setOpened] = useState(false);
    const [height, setHeight] = useState(0);
    const [opacity, setOpacity] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (opened) {
            if (contentRef.current) {
                setHeight(contentRef.current.scrollHeight);
                setTimeout(() => setOpacity(1), 10);
            }
        } else {
            setOpacity(0);
            setTimeout(() => setHeight(0), 200);
        }
    }, [opened]);

    const hasChildren = React.Children.count(children) > 0;

    return (
        <div className="flex flex-col space-y-1 select-none border border-border dark:border-border-dark px-3 rounded-md shadow-sm transition-all duration-200 ease-in-out">
            <div className="flex justify-between py-3">
                <div 
                    className="flex flex-row space-x-4 items-center cursor-pointer" 
                >
                    {opened ? (
                        <Button.SM onClick={() => setOpened(!opened)}><BiChevronDown /></Button.SM>
                    ) : (
                        <Button.SM onClick={() => setOpened(!opened)}><BiChevronRight /></Button.SM>
                    )}
                    <div className="flex flex-col space-y-2">
                        <a className="font-bold text-foreground transition-colors duration-200 ease-in-out">
                            {label}
                        </a>
                    </div>
                </div>
                {content}
            </div>
            <div 
                className="overflow-hidden transition-all duration-300 ease-in-out" 
                style={{ 
                    height: `${height}px`,
                    opacity: opacity
                }}
            >
                <div ref={contentRef} className="ml-8">
                    {hasChildren ? children : (
                        <div className="py-2">
                            <Empty message="No items available" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shelf;