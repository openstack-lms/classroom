import { useEffect, useState } from "react";
import Input from "../Input";
import Button from "../Button";
import React from "react";
import { HiCheck } from "react-icons/hi";

interface EditableLabelProps {
    label: string;
    value: string;
    editing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
}

const EditableLabel: React.FC<EditableLabelProps> = ({
    label,
    value,
    editing,
    onChange,
    onBlur
}) => {
    const [isEditing, setIsEditing] = useState(editing);

    useEffect(() => {
        setIsEditing(editing);
    }, [editing]);

    if (isEditing) {
        return (
            <div className="flex flex-row items-center space-x-2">
                <Input.Small
                    value={value}
                    onChange={onChange}
                    onBlur={() => {
                        setIsEditing(false);
                        onBlur?.();
                    }}
                />
                <Button.SM onClick={() => setIsEditing(false)}><HiCheck /></Button.SM>
            </div>
        );
    }

    return (
        <button onDoubleClick={() => setIsEditing(true)}>
            {label}
        </button>
    );
};

export default EditableLabel;