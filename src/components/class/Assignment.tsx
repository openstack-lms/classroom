import IconFrame from "../util/IconFrame";
import Button from "../util/Button";
import { addAlert, setRefetch } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import { useDispatch } from "react-redux";
import { DefaultApiResponse } from "@/interfaces/api/Response";
import Badge from "../Badge";
import { handleApiPromise, ProcessedResponse } from "@/lib/handleApiPromise";
import { HiDocumentText, HiPencil, HiTrash } from "react-icons/hi";

interface AssignmentProps {
    title: string;
    date: string | Date;
    isTeacher: boolean;
    classId: string;
    assignmentId: string;
    late?: boolean | null;
    returned?: boolean | null;
    submitted?: boolean | null;
}

export default function Assignment({
    title,
    date,
    isTeacher,
    classId,
    assignmentId,
    late,
    returned,
    submitted,
}: AssignmentProps) {
    const dispatch = useDispatch();

    return (<div className="py-3 flex justify-between">
        <div className="flex flex-row space-x-4 items-center">
            <IconFrame>
                <HiDocumentText />
            </IconFrame>
            <div className="flex flex-col space-y-2">
                <a
                    href={`/classes/${classId}/assignment/${assignmentId}`}
                    className="font-bold hover:underline cursor-pointer">{title}</a>
                <span className="text-gray-400 pr-5">{new Date(date).toDateString()}</span>
            </div>
        </div>
        {!isTeacher && (
            <div className="flex flex-row space-x-3 items-center">
                {late && <Badge color="error">Late</Badge>}
                {submitted && !returned &&<Badge color="success">Submitted</Badge>}
                {returned && <Badge color="primary">Returned</Badge>}
            </div>
        )}
        {isTeacher && (
            <div className="flex flex-row space-x-3 items-center">
                <Button.SM href={`/classes/${classId}/assignment/${assignmentId}/edit`}><HiPencil /></Button.SM>
                <Button.SM className="text-inherit hover:text-red-400" onClick={() => {
                    handleApiPromise(fetch(`/api/class/${classId}/assignment/${assignmentId}`, {
                        method: 'DELETE',
                    }))
                    .then(({ success, payload, level, remark }: ProcessedResponse) => {
                        dispatch(addAlert({
                            level: level,
                            remark: remark,
                        }));
                        if (success) {
                            dispatch(setRefetch(true));
                        }
                    })
                }}><HiTrash /></Button.SM>
            </div>)}
    </div>)
}