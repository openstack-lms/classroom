"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/utils/trpc';
import { useDispatch } from 'react-redux';
import { setAuth } from '@/store/appSlice';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { data: user, isLoading, error } = trpc.auth.check.useQuery();
    const [authenticated, setAuthenticated] = useState(false);
    
    useEffect(() => {
        if (!isLoading && error) {
                    dispatch(setAuth({
                        loggedIn: false,
                teacher: false,
                student: false,
            }));
            router.push('/login');
        }
    }, [error, router, isLoading]);

    useEffect(() => {
        if (user?.user) {
            dispatch(setAuth({
                ...user.user,
                loggedIn: true,
                teacher: false,
                student: false,
            }));
            setAuthenticated(true);
        }
    }, [user]);

    if (isLoading || !authenticated) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}