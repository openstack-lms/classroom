
import { AlertLevel } from '@/lib/alertLevel';
import { User } from '@prisma/client';
import { createSlice } from '@reduxjs/toolkit';
import { stat } from 'fs';

export interface Alert {
    level: AlertLevel;
    remark: string;
}

interface AppState {
    user: {
        loggedIn: boolean;
        teacher: boolean;
        student: boolean;
    } & Partial<User>;
    alerts: Alert[];
    modal: {
        header: string;
        body: React.ReactNode,
    };
    refetch: boolean;
}

const initialState: AppState = {
    user: {
        loggedIn: false,
        teacher: false,
        student: false,
    },
    alerts: [],
    modal: {
        body: null,
        header: '',
    },
    refetch: false,
};

export const appSlice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAuth: (state, action) => {
            state.user = {
                ...state.user,
                ...action.payload
            }
        },
        addAlert: (state, action) => {
            state.alerts.push({
                level: action.payload.level,
                remark: action.payload.remark
            })
        },
        removeAlert: (state, action) => {
            const id = action.payload;

            state.alerts = state.alerts.filter((_, index) => index !== id);
        },
        openModal: (state, action) => {
            const content = action.payload;

            state.modal = content;
        },
        closeModal: (state) => {
            state.modal = {
                body: null,
                header: '',
            };
        },
        setRefetch: (state, action) => {
            state.refetch = action.payload;
        },
        setTeacher: (state, action) => {
            if (!action.payload) {
                state.user = {
                    ...state.user,
                    teacher: false,
                    student: true,
                }
                return;
            }
            state.user = {
                ...state.user,
                teacher: true,
                student: false,
            }
        }
    },
});

export const { setAuth, addAlert, removeAlert, openModal, closeModal , setRefetch, setTeacher} = appSlice.actions;
export default appSlice.reducer;