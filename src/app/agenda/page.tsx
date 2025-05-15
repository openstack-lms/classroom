"use client";

import CreateEvent from "@/components/class/forms/CreateEvent";
import Button from "@/components/ui/Button";
import Calendar from "@/components/ui/Calendar";
import { splitMultiDayEvent } from "@/lib/splitMultiDayEvent";
import { openModal, setRefetch } from "@/store/appSlice";
import { useEffect, useRef, useState } from "react";
import { HiAcademicCap, HiClock, HiPencil, HiTrash, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import Event from "@/components/class/Event";
import { trpc } from "@/utils/trpc";
import type { RouterOutputs } from "@server/routers/_app";

type PersonalEvent = RouterOutputs['agenda']['get']['events']['personal'][number];
type ClassEvent = RouterOutputs['agenda']['get']['events']['class'][number];

export default function Agenda() {
    const [weekDays, setWeekDays] = useState<Date[]>([]);
    const [selectedDay, setSelectedDay] = useState<number>(0);
    const eventComponent = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<{
        personal: PersonalEvent[],
        class: ClassEvent[],
    }>();
    const dispatch = useDispatch();

    const WEEKDAY_LABELS = [
        'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
    ]
    const spacingPerHour = 80;

    useEffect(() => {
        if (eventComponent && eventComponent.current) eventComponent.current.scrollTop = 80 * 8;
    }, []);

    const { data: agendaData } = trpc.agenda.get.useQuery(
        {
            weekStart: weekDays[0]?.toISOString() || new Date().toISOString(),
        },
        {
            enabled: weekDays.length > 0,
        }
    );

    useEffect(() => {
        if (agendaData) {
            const processedEvents = {
                personal: agendaData.events.personal.flatMap((event: PersonalEvent) => splitMultiDayEvent(event)),
                class: agendaData.events.class.flatMap((event: ClassEvent) => splitMultiDayEvent(event))
            };
            setEvents(processedEvents);
            dispatch(setRefetch(false));
        }
    }, [agendaData, dispatch]);

    return (
        <div className="flex flex-row ml-12 pt-5">
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