"use client";

import { RootState } from "@/store/store";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProtectedRoute ({ children }: Readonly<{ children: React.ReactNode }>) {
    const appState = useSelector((state: RootState) => state.app);

    const [loaded, setLoaded] = useState(false);
    
    useEffect(() => {
        if (!appState.user.loggedIn) {
            redirect('/login');
        } else {
            setLoaded(true);
        }
    }, [appState.user.loggedIn]);

    return (<>{loaded && (<>{children}</>)}</>);
}