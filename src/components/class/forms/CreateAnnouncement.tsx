import Button from "@/components/util/Button";
import Input from "@/components/util/Input";
import { CreateAnnouncementProps } from "@/interfaces/api/Class";
import { handleApiPromise, ProcessedResponse } from "@/lib/handleApiPromise";
import { useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { addAlert, setRefetch } from "@/store/appSlice";

export default function CreateAnnouncement({ classId }: { classId: string }) {
    const dispatch = useDispatch();
    const [announcementProps, setAnnouncementProps] = useState<CreateAnnouncementProps>({
        remarks: "",
    });



    return (<div className="flex flex-row space-x-3 w-full">
        <div className="flex flex-row w-1/2">
            <div className="border-r-0 flex justify-center items-center dark:bg-background-active border-border dark:border-border-dark px-4 border rounded-l-md h-full">
                <HiSpeakerphone className="text-gray-400"/>
            </div>
            <Input.Text
                value={announcementProps.remarks}
                placeholder="Class name" 
                className="w-full rounded-r-md rounded-l-none border-l-0 ps-3"
                onChange={(e) => setAnnouncementProps({
                    ...announcementProps,
                    remarks: e.currentTarget.value,
                })}
            />
        </div>
        <Button.Primary onClick={() => {
            handleApiPromise(fetch(`/api/class/${classId}/announcement`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(announcementProps),
            }))
            .then(({ success, payload, level, remark }: ProcessedResponse) => {
                if (success) dispatch(setRefetch(true));
                dispatch(addAlert({
                    level: level,
                    remark: remark,
                }));
            });
        }}>
            Post
        </Button.Primary>
    </div>)
}