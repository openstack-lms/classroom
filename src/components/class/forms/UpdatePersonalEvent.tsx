import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addAlert } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { trpc } from "@/utils/trpc";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatDateForInput } from "@/lib/time";

interface UpdatePersonalEventProps {
  id: string;
}

export default function UpdatePersonalEvent({ id }: UpdatePersonalEventProps) {
  const [eventData, setEventData] = useState({
    name: "",
    location: "",
    remarks: "",
    startTime: "",
    endTime: "",
  });

  const dispatch = useDispatch();

  const { data: event } = trpc.event.get.useQuery({ id });

  useEffect(() => {
    if (event?.event) {
      setEventData({
        name: event.event.name || "",
        location: event.event.location || "",
        remarks: event.event.remarks || "",
        startTime: formatDateForInput(event.event.startTime),
        endTime: formatDateForInput(event.event.endTime),
      });
    }
  }, [event]);

  const updateEvent = trpc.event.update.useMutation({
    onSuccess: () => {
      dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Event updated successfully" }));
    },
    onError: (error) => {
      dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEvent.mutate({
      id,
      data: eventData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input.Text
        label="Name"
        value={eventData.name}
        onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
        required
      />
      <Input.Text
        label="Location"
        value={eventData.location}
        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
      />
      <Input.Textarea
        label="Remarks"
        value={eventData.remarks}
        onChange={(e) => setEventData({ ...eventData, remarks: e.target.value })}
      />
      <Input.Text
        label="Start Time"
        type="datetime-local"
        value={eventData.startTime}
        onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
        required
      />
      <Input.Text
        label="End Time"
        type="datetime-local"
        value={eventData.endTime}
        onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
        required
      />
      <div className="flex justify-end space-x-2">
        <Button.Light>Cancel</Button.Light>
        <Button.Primary type="submit">Update Event</Button.Primary>
      </div>
    </form>
  );
}