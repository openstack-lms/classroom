import IconFrame from "../ui/IconFrame";
import Button from "../ui/Button";
import { addAlert, setRefetch } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import Badge from "../Badge";
import { HiDocumentText, HiPencil, HiTrash } from "react-icons/hi";
import { emitAssignmentDelete } from "@/lib/socket";
import { trpc } from "@/utils/trpc";
import { AlertLevel } from "@/lib/alertLevel";

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

    const { mutate: deleteAssignment } = trpc.assignment.delete.useMutation({
        onSuccess: () => {
            emitAssignmentDelete(classId, assignmentId);
            dispatch(addAlert({ level: AlertLevel.SUCCESS, remark: "Assignment deleted successfully" }));
            dispatch(setRefetch(true));
        },
        onError: (error) => {
            dispatch(addAlert({ level: AlertLevel.ERROR, remark: error.message }));
        }
    });

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
                {late && <Badge variant="error">Late</Badge>}
                {submitted && !returned &&<Badge variant="success">Submitted</Badge>}
                {returned && <Badge variant="primary">Returned</Badge>}
            </div>
        )}
        {isTeacher && (
            <div className="flex flex-row space-x-3 items-center">
                <Button.SM href={`/classes/${classId}/assignment/${assignmentId}/edit`}><HiPencil /></Button.SM>
                <Button.SM className="text-inherit hover:text-red-400" onClick={() => {
                    deleteAssignment({
                        classId,
                        id: assignmentId
                    });
                }}><HiTrash /></Button.SM>
            </div>)}
    </div>)
}