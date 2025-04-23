'use client';

import { useState, useEffect, FC } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";

enum Month {
    JAN = 0,
    FEB,
    MAR,
    APR,
    MAY,
    JUN,
    JUL,
    AUG,
    SEP,
    OCT,
    NOV,
    DEC
}

type Day = {
    prev: boolean;
    label: number;
};

interface CalendarProps {
    onChange: (date: { 
        day: number, 
        month: Month | number, 
        year: number, 
        week?: Date[] 
    }) => void;
    active?: { 
        day: number, 
        month: Month | number, 
        year: number 
    };
}

const Calendar: FC<CalendarProps> = ({ onChange }) => {
    const [active, setActive] = useState<{ day: number, month: Month | number, year: number }>({
        day: new Date().getUTCDate(), 
        month: new Date().getUTCMonth(),
        year: new Date().getUTCFullYear()
    });

    const [date, setDate] = useState<{ month: Month, year: number }>({ month: active.month as Month, year: active.year });

    const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const monthStart = new Date(Date.UTC(date.year, date.month, 1));
    const daysInMonth = new Date(Date.UTC(date.year, date.month + 1, 0)).getDate();

    const prevDaysCount = (monthStart.getDay() + 6) % 7;
    const prevDates: Day[] = Array.from({ length: prevDaysCount }, (_, i) => ({
        prev: true,
        label: new Date(Date.UTC(date.year, date.month, -(prevDaysCount - i))).getDate()
    }));

    const monthEnd = new Date(Date.UTC(date.year, date.month, daysInMonth));
    const afterDaysCount = (7 - monthEnd.getDay()) % 7;
    const afterDates: Day[] = Array.from({ length: afterDaysCount }, (_, i) => ({
        prev: true,
        label: new Date(Date.UTC(date.year, date.month + 1, i + 1)).getDate()
    }));

    const dates: Day[] = [
        ...prevDates.reverse(),
        ...Array.from({ length: daysInMonth }, (_, i) => ({ prev: false, label: i + 1 })),
        ...afterDates
    ];

    const weekstoDays: Record<number, Day[]> = Array.from({ length: 7 }, () => []);

    dates.forEach((day, i) => {
        weekstoDays[i % 7].push(day);
    });

    const handlePreviousMonth = () => {
        const newMonth = (date.month - 1 + 12) % 12;
        const newYear = date.month === 0 ? date.year - 1 : date.year;
        setDate({ month: newMonth, year: newYear });
    };

    const handleNextMonth = () => {
        const newMonth = (date.month + 1) % 12;
        const newYear = date.month === 11 ? date.year + 1 : date.year;
        setDate({ month: newMonth, year: newYear });
    };

    useEffect(() => {
        WEEKDAY_LABELS.forEach((label, index) => {
            weekstoDays[index].forEach((day, dayIndex) => {
                if (day.label === active.day && !day.prev && date.month === active.month && date.year === active.year) {
                    onChange({ day: day.label, month: date.month, year: date.year, week: Array.from({ length: 7 }, (_, i) => new Date(Date.UTC( date.year, date.month, day.label - (index) + i, 12, 0, 0, 0)) ) });
                }
            });
        });
    }, [active]);

    return (
        <div className="flex flex-col w-[15rem] shrink-0">
            <div className="flex flex-row justify-between items-center p-4">
                <button onClick={handlePreviousMonth}><HiArrowLeft /></button>
                <span className="font-semibold text-lg">{Month[date.month]} {date.year}</span>
                <button onClick={handleNextMonth}><HiArrowRight /></button>
            </div>
            <div className="flex flex-row p-4 justify-between w-full shrink-0">
                {WEEKDAY_LABELS.map((label, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <span className="font-semibold text-xs text-center">{label}</span>
                        <div className="flex flex-col space-y-2 mt-3">
                            {weekstoDays[index].map((day, dayIndex) => (
                                <div key={dayIndex} className={`w-6 h-6 hover:cursor-pointer flex justify-center items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${day.prev ? ' dark:text-gray-700 text-gray-400' : 'text-black dark:text-white'} ${(active.day === day.label && !day.prev && date.month === active.month && date.year === active.year) && 'bg-primary-500 text-white'}`} 
                                    onClick={() => {
                                        if (day.prev) {
                                            setActive({ day: day.label, month: date.month + ((day.label > 7) ? -1 : 1), year: date.year });
                                            setDate({ month: date.month + ((day.label > 7) ? -1 : 1), year: date.year });
                                        } else {
                                            setActive({ day: day.label, month: date.month, year: date.year });
                                        }
                                        const weekStart = new Date(Date.UTC(date.year, date.month, day.label - (index)));

                                        const weeksAll = Array.from({ length: 7 }, (_, i) => new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + i)));
                                        
                                        onChange({ day: day.label, month: date.month, year: date.year, week: weeksAll });    
                                    }}>
                                    {day.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
