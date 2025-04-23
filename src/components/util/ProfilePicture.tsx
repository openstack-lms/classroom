"use client";

import { useMemo } from 'react';

interface ProfilePictureProps {
    username: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showName?: boolean;
    namePosition?: 'right' | 'bottom';
}

export default function ProfilePicture({ 
    username, 
    size = 'md',
    className = '',
    showName = false,
    namePosition = 'right'
}: ProfilePictureProps) {
    const sizeClasses = useMemo(() => {
        switch (size) {
            case 'sm': return 'size-6 text-sm';
            case 'lg': return 'size-12 text-lg';
            default: return 'size-8 text-base';
        }
    }, [size]);

    const avatar = (
        <div 
            className={`
                ${sizeClasses} 
                bg-primary-100 dark:bg-primary-900
                text-primary-600 dark:text-primary-300
                rounded-full flex items-center justify-center
                font-medium select-none
                ${className}
            `}
            title={username}
        >
            {username[0].toUpperCase()}
        </div>
    );

    if (!showName) return avatar;

    return (
        <div className={`
            flex items-center
            ${namePosition === 'bottom' ? 'flex-col space-y-2' : 'flex-row space-x-3'}
        `}>
            {avatar}
            <span className="font-medium text-foreground">{username}</span>
        </div>
    );
} 