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
    const [tempValue, setTempValue] = useState(value);

    useEffect(() => {
        setTempValue(value);
    }, [value]);

    if (editing) {
        return (
            <div className="flex flex-row items-center space-x-2">
                <Input.Small
                    value={tempValue}
                    onChange={(e) => {
                        setTempValue(e.target.value);
                    }}
                    onBlur={() => {
                        // Save changes when input loses focus
                        onChange({
                            target: {
                                value: tempValue
                            }
                        } as React.ChangeEvent<HTMLInputElement>);
                        onBlur?.();
                    }}
                />
                <Button.SM onClick={() => {
                    onChange({
                        target: {
                            value: tempValue
                        }
                    } as React.ChangeEvent<HTMLInputElement>);
                }}><HiCheck /></Button.SM>
            </div>
        );
    }

    return <span>{label}</span>;
};

export default EditableLabel;