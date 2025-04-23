"use client";

import { useState } from "react";
import { addAlert, closeModal } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import { AlertLevel } from "@/lib/alertLevel";
import { HiX } from "react-icons/hi";
import Button from "../../util/Button";
import Input from "../../util/Input";
import { CreateClassRequest } from "@/interfaces/api/Class";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import { handleApiPromise } from "@/lib/handleApiPromise";

export default function CreateClass() {
    const dispatch = useDispatch();

    const [classData, setClassData] = useState({
        name: '',
        subject: '',
        section: '',
    });

    return (<div className="w-[30rem]">
        <form onSubmit={(e) => {
            e.preventDefault();
        
            setClassData({ name: '', subject: '', section: '' });

            handleApiPromise(fetch('/api/class', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(classData as CreateClassRequest),
            }))
            .then(({ success, level, remark }) => {
                dispatch(addAlert({ level, remark }));
                if (success) {
                    setClassData({ name: '', subject: '', section: '' });
                    dispatch(closeModal());
                }
            });
        }}>
            <div className="w-full flex flex-col space-y-3 mt-4">
                <Input.Text
                    label="Name" 
                    type="text"
                    value={classData.name} 
                    onChange={(e) => setClassData({ ...classData, name: e.target.value })} />
                <Input.Text
                    label="Subject"
                    type="text"
                    value={classData.subject}
                    onChange={(e) => setClassData({ ...classData, subject: e.target.value })} />
                <Input.Text
                    label="Section"
                    type="number"
                    min="1"
                    value={classData.section}
                    onChange={(e) => setClassData({ ...classData, section: Number(e.target.value).toString() })} />
            </div>
            <Button.Primary className="mt-5">Create</Button.Primary>
        </form>
    </div>)
}