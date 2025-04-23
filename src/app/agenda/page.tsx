"use client";

import CreateEvent from "@/components/class/forms/CreateEvent";
import UpdatePersonalEvent from "@/components/class/forms/UpdatePersonalEvent";
import UpdateClassEvent from "@/components/class/forms/UpdateClassEvent";
import Button from "@/components/util/Button";
import Calendar from "@/components/util/Calendar";
import Input from "@/components/util/Input";
import { ClassEvent, GetAgendaResponse, PersonalEvent } from "@/interfaces/api/Agenda";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { AlertLevel } from "@/lib/alertLevel";
import { fmtTime, getTimeDifferenceInHours } from "@/lib/time";
import { addAlert, closeModal, openModal, setRefetch } from "@/store/appSlice";
import { RootState } from "@/store/store";
import { useEffect, useRef, useState } from "react";
import { HiAcademicCap, HiClock, HiPencil, HiTrash, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import Event from "@/components/class/Event";
import { handleApiPromise } from "@/lib/handleApiPromise";

function splitMultiDayEvent<T extends PersonalEvent | ClassEvent>(event: T): T[] {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    // If event is within same day, return as is
    if (start.getUTCDate() === end.getUTCDate() && 
        start.getUTCMonth() === end.getUTCMonth() && 
        start.getUTCFullYear() === end.getUTCFullYear()) {
        return [event];
    }

    const events: T[] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
        const nextDay = new Date(currentDate);
        nextDay.setUTCDate(currentDate.getUTCDate() + 1);
        nextDay.setUTCHours(0, 0, 0, 0);

        const splitEvent = {
            ...event,
            startTime: currentDate.toISOString(),
            endTime: currentDate.getUTCDate() === end.getUTCDate() ? 
                end.toISOString() : 
                nextDay.toISOString()
        } as T;

        events.push(splitEvent);

        currentDate = nextDay;
    }

    return events;
}

export default function Agenda() {
    const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const eventComponent = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<{
        personal: PersonalEvent[],
        class: ClassEvent[],
    }>();
    const appState = useSelector((state: RootState) => state.app);

    const WEEKDAY_LABELS = [
        'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
    ]
    const spacingPerHour = 80;

    useEffect(() => {
        if (eventComponent && eventComponent.current) eventComponent.current.scrollTop = 80 * 8;
    }, []);

    useEffect(() => {
        if (!weekDays.length) return;

        // Ensure we're using UTC ISO string and handling it properly
        const weekStart = new Date(weekDays[0]);
        weekStart.setUTCHours(0, 0, 0, 0);

        handleApiPromise<GetAgendaResponse>(fetch(`/api/agenda/${weekStart.toISOString()}`))
            .then(({ success, payload, level, remark }) => {
                if (success) {
                    const processedEvents = {
                        personal: payload.events.personal.flatMap(event => splitMultiDayEvent(event)),
                        class: payload.events.class.flatMap(event => splitMultiDayEvent(event))
                    };
                    setEvents(processedEvents);
                    dispatch(setRefetch(false));
                } else {
                    dispatch(addAlert({ level, remark }));
                }
            });
    }, [weekDays, appState.refetch]);


    const dispatch = useDispatch();

    return (
        <div className="flex flex-row ml-12">

            {/* sidebar */}
            <div className="flex flex-col w-[17rem] shrink-0">
                <Calendar onChange={(e) => {
                    setWeekDays(e.week!);
                    setSelectedDay(((new Date(Date.UTC(e.year, e.month, e.day)).getDay() - 1) > -1) ? (new Date(Date.UTC(e.year, e.month, e.day)).getDay() - 1) : 6);
                }} />

            </div>

            <div className="w-full flex flex-col space-y-3 overflow-x-visible">
                <div className="flex flex-row ml-12">
                    <Button.Primary
                        onClick={() => {
                            dispatch(openModal({ body: <CreateEvent selectedDay={weekDays[selectedDay]} />, header: 'Add event' }));
                        }}
                    >Add Event</Button.Primary>
                </div>

                <div className="flex flex-row ml-12 w-full pl-12">
                    {weekDays.map((day, index) => <span key={index}
                        onClick={() => setSelectedDay(index)}
                        className={`hover:underline flex-shrink-0 flex-grow-0 text-sm font-semibold text-center w-[9rem] ${index == selectedDay ? 'text-primary-500' : "text-gray-500 dark:text-gray-300"}`}>{WEEKDAY_LABELS[index]} <span className={`${index == selectedDay ? 'text-white px-2 rounded-full bg-primary-500' : "text-gray-500 dark:text-gray-300"}`}>{day.getDate()}</span></span>
                    )}
                </div>

                <div className="flex flex-row ml-12 w-[66rem] overflow-x-visible overflow-y-scroll h-[40rem] relative" ref={eventComponent}>
                    {
                        Array.from({ length: 24 }, (_, i) => (<div key={i} className="absolute w-[2rem] text-foreground-muted font-bold border-border dark:border-border-dark flex-shrink-0 flex-grow-0" style={{
                            height: spacingPerHour,
                            top: spacingPerHour * i -10
                        }}>{i.toString().padStart(2, "0")}:00</div>))
                    }
                    <div className="relative w-full flex flex-row ml-12">
                        {
                            Array.from({ length: 24 }, (_, i) => (<div key={i} className="absolute w-[63rem] border-b border-border dark:border-border-dark flex-shrink-0 flex-grow-0" style={{
                                height: spacingPerHour,
                                top: spacingPerHour * i
                            }}></div>))
                        }
                        {
                            weekDays.map((day, index) => (
                                <div key={index} className="flex flex-col w-[9rem] shrink-0">
                                    <div className="relative items-center">
                                        {
                                            Array.from({ length: 24 }, (_, i) => (<div key={i} className="w-full border-b border-x border-border dark:border-border-dark flex-shrink-0 flex-grow-0" style={{
                                                height: spacingPerHour,
                                            }}></div>))
                                        }
                                        {events &&
                                            events.personal.filter((e) => new Date(e.startTime).getUTCDate() == day.getUTCDate()).map((e, index) => (
                                                <Event id={e.id}
                                                key={index}
                                                personal={true}
                                                    startTime={e.startTime}
                                                    endTime={e.endTime}
                                                    location={e.location ? e.location : 'No location specified'}
                                                    remarks={e.remarks ? e.remarks : 'No remarks were left'}
                                                    eventName={e.name ? e.name : 'Untitled event'}
                                                    spacingPerHour={spacingPerHour} />
                                            ))
                                        }

                                        {events &&
                                            events.class.filter((e) => new Date(e.startTime).getUTCDate() == day.getUTCDate()).map((e, index) => (
                                                <Event id={e.id}
                                                key={index}
                                                    personal={false}
                                                    startTime={e.startTime}
                                                    endTime={e.endTime}
                                                    location={e.location ? e.location : 'No location specified'}
                                                    remarks={e.remarks ? e.remarks : 'No remarks were left'}
                                                    eventName={e.class!.name}
                                                    spacingPerHour={spacingPerHour} />
                                            ))
                                        }
                                        
                                    </div>
                                </div>
                            ))
                        }
                        
                    </div>
                </div>
            </div>

        </div>
    );
}