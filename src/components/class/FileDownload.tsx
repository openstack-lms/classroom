import { 
    HiDocument, 
    HiDownload,
    HiPhotograph,
    HiDocumentText,
    HiDocumentDuplicate,
    HiTable,
    HiPresentationChartBar,
    HiCode,
    HiVideoCamera,
    HiMusicNote,
    HiDatabase
} from "react-icons/hi";
import Button from "../ui/Button";
import IconFrame from "../ui/IconFrame";
import { useState } from "react";
import { getFileIconInfo } from "@/lib/fileTypes";

interface FileDownloadProps {
    src: string;
    name: string;
    type: string;
    thumbnailId?: string | null;
}

export default function FileDownload({ src, name, type, thumbnailId }: FileDownloadProps) {
    const fileId = src.includes('/') ? src.split('/').pop() : src;
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
        <Button.SM href={`/api/files/${fileId}`} download className="text-blue-500 hover:text-blue-700">
            <HiDownload />
        </Button.SM>
    </div>)
}