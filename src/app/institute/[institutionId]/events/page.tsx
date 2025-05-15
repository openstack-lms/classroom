"use client";

import { useParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { HiCalendar, HiPlus, HiPencil, HiTrash } from "react-icons/hi";

export default function EventsPage() {
  const params = useParams();
  
  // Template data
  const events = [
    {
      id: "1",
      title: "Parent-Teacher Conference",
      date: "2024-04-15",
      time: "14:00",
      location: "Main Hall",
      type: "meeting",
      description: "Annual parent-teacher conference for all grades"
    },
    {
      id: "2",
      title: "Science Fair",
      date: "2024-04-20",
      time: "09:00",
      location: "Science Building",
      type: "event",
      description: "Annual science fair showcasing student projects"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-base">Events</h2>
        <Button.Primary>
          <HiPlus className="size-5 mr-2" />
          Add Event
        </Button.Primary>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <HiCalendar className="size-6 text-primary-500" />
              <h3 className="text-lg font-semibold text-base">Calendar</h3>
            </div>
            <div className="min-h-[400px] bg-muted rounded-lg">
              {/* Calendar component will go here */}
              <div className="p-4 text-center text-muted">
                Calendar View Coming Soon
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <HiCalendar className="size-6 text-primary-500" />
              <h3 className="text-lg font-semibold text-base">Upcoming Events</h3>
            </div>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="p-4 bg-subtle rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-base">{event.title}</h4>
                    <div className="flex gap-2">
                      <Button.Light className="p-1">
                        <HiPencil className="size-4" />
                      </Button.Light>
                      <Button.Light className="p-1">
                        <HiTrash className="size-4" />
                      </Button.Light>
                    </div>
                  </div>
                  <p className="text-sm text-muted mb-2">{event.description}</p>
                  <div className="text-xs text-muted">
                    <p>{event.date} at {event.time}</p>
                    <p>Location: {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 