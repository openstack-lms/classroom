import { RouterOutputs } from "@server/routers/_app";

type PersonalEvent = RouterOutputs['agenda']['get']['events']['personal'][number];
type ClassEvent = RouterOutputs['agenda']['get']['events']['class'][number];

export function splitMultiDayEvent<T extends PersonalEvent | ClassEvent>(event: T): T[] {
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