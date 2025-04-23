"use client";

import { addAlert, setAuth } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "./Loading";
import { AlertLevel } from "@/lib/alertLevel";
import { ApiResponse } from "@/interfaces/api/Response";
import { SessionVerificationResponse } from "@/interfaces/api/Auth";

export default function AuthWrapper({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    const dispatch = useDispatch();
    const appState = useSelector((state: RootState) => state.app);

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/api/auth')
            .then(res => res.json())
            .then((data: ApiResponse<SessionVerificationResponse>) => {
                if (data.success && (data.payload as SessionVerificationResponse).authenticated) {
                    dispatch(setAuth({
                        ...(data.payload as SessionVerificationResponse).user,
                        loggedIn: true,
                    }));
                    setLoaded(true);
                } 
                else if (data.success && !(data.payload as SessionVerificationResponse).authenticated) {
                    dispatch(setAuth({
                        loggedIn: false,
                    }));
                    setLoaded(true);
                }
                else if (!data.success) {
                    dispatch(addAlert({
                        level: AlertLevel.ERROR,
                        remark: 'Sign in unsuccessful'
                        // remark: data.payload.remark,
                    }));
                }
            })
            .catch(_ => {
                dispatch(addAlert({
                    level: AlertLevel.ERROR,
                    remark: 'Please try again later',
                }));
            });
    }, []);


    return <>
        {loaded ?
            children
            :
            <div className="h-screen w-full flex justify-center items-center bg-background dark:bg-background-subtle">
                <Loading />
            </div>
        }
    </>;
}