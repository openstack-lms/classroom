import { HiDownload, HiTrash } from "react-icons/hi";
import IconFrame from "../ui/IconFrame";
import { getFileIconInfo } from "@/lib/fileTypes";
import { useState } from "react";
import Button from "../ui/Button";

export default function FileEdit({
    src,
    name,
    type,
    onDelete,
    thumbnailId,
}: {
    src: string,
    name: string,
    type: string,
    onDelete: () => void,
    thumbnailId?: string | null,
}) {
    const iconInfo = getFileIconInfo(type);
    const [imageError, setImageError] = useState(false);

    return (<div className="flex flex-row justify-between">
        <div className="flex flex-row items-center space-x-3">
            {thumbnailId ? (
                <div className="size-12 rounded-md overflow-hidden bg-gray-100">
                    {!imageError ? (
                        <img
                            src={`/api/files/${thumbnailId}`}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <IconFrame
                            backgroundColor={iconInfo.backgroundColor}
                            baseColor={iconInfo.baseColor}
                        >
                            {iconInfo.icon}
                        </IconFrame>
                    )}
                </div>
            ) : (
                <IconFrame
                    backgroundColor={iconInfo.backgroundColor}
                    baseColor={iconInfo.baseColor}
                >
                    {iconInfo.icon}
                </IconFrame>
            )}
            <div className="flex flex-col">
                <span className="font-semibold">
                    {name}
                </span>
                <span className="text-foreground-muted text-xs">
                    {type}
                </span>
            </div>
        </div>
        <div className="flex flex-row space-x-2">
            <Button.SM href={`/api/files/${src}`} download className="text-blue-500 hover:text-blue-700">
                <HiDownload />
            </Button.SM>
            <Button.SM onClick={() => onDelete()} className="text-red-500 hover:text-red-700">
                <HiTrash />
            </Button.SM>
        </div>
    </div>)
}