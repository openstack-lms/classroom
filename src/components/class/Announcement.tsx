import { User } from "@/interfaces/api/Auth";
import Button from "../util/Button";
import { HiCheck, HiPencil, HiTrash, HiSpeakerphone } from "react-icons/hi";
import { useState } from "react";
import { CreateAnnouncementProps } from "@/interfaces/api/Class";
import Input from "../util/Input";
import { handleApiPromise, ProcessedResponse } from "@/lib/handleApiPromise";
import { useDispatch, useSelector } from "react-redux";
import { addAlert, setRefetch } from "@/store/appSlice";
import IconFrame from "../util/IconFrame";
import { RootState } from "@/store/store";
import Textbox from "../util/Textbox";

export default function Announcement({
    classId,
    id,
    remarks,
    user,
}: {
    id: string,
    classId: string,
    remarks: string,
    user: User
}) {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<CreateAnnouncementProps>({
        remarks: remarks,
    });

    // Get the current user from Redux state
    const currentUser = useSelector((state: RootState) => state.app.user);

    // Check if the current user is the creator of the announcement
    const canEdit = currentUser.id === user.id;

    return (
        <div className="rounded-lg shadow-sm hover:shadow-md duration-200 py-5">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <IconFrame>
                            <HiSpeakerphone className="h-6 w-6" />
                        </IconFrame>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-foreground">
                                {user.username}
                            </p>
                            <span className="text-sm text-foreground-muted">•</span>
                            <span className="text-sm text-foreground-muted">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                        <div className="mt-2">
                            {editing ? (
                                <div className="flex items-end space-x-2">
                                    <Textbox
                                        content={form.remarks}
                                        onChange={(content) => setForm({ ...form, remarks: content })}
                                    />
                                    <Button.SM
                                        onClick={() => {
                                            handleApiPromise(fetch(`/api/class/${classId}/announcement/${id}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-type': 'application/json'
                                                },
                                                body: JSON.stringify(form),
                                            }))
                                                .then(({ success, level, remark }: ProcessedResponse) => {
                                                    dispatch(addAlert({ level, remark }));
                                                    if (success) {
                                                        setEditing(false);
                                                        dispatch(setRefetch(true));
                                                    }
                                                });
                                        }}
                                    >
                                        <HiCheck className="h-4 w-4" />
                                    </Button.SM>
                                </div>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: remarks }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                    {canEdit && (
                        <>
                            <Button.SM
                                className="text-foreground-muted hover:text-primary-500 dark:text-foreground-muted dark:hover:text-primary-400"
                                onClick={() => setEditing(true)}
                            >
                                <HiPencil className="h-4 w-4" />
                            </Button.SM>
                            <Button.SM
                                className="text-foreground-muted hover:text-error dark:text-foreground-muted dark:hover:text-error-light"
                                onClick={() => {
                                    handleApiPromise(fetch(`/api/class/${classId}/announcement/${id}`, {
                                        method: 'DELETE',
                                    }))
                                        .then(({ success, level, remark }: ProcessedResponse) => {
                                            dispatch(addAlert({ level, remark }));
                                            if (success) {
                                                dispatch(setRefetch(true));
                                            }
                                        });
                                }}
                            >
                                <HiTrash className="h-4 w-4" />
                            </Button.SM>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}