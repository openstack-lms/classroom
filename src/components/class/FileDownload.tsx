import { HiDocument, HiDownload } from "react-icons/hi";
import Button from "../util/Button";
import IconFrame from "../util/IconFrame";

export default function FileDownload({ src, name, type }: { src: string, name: string, type: string }) {
    return (<div className="flex flex-row justify-between">
        <div className="flex flex-row items-center space-x-3">
            {/* <img src={src} className="w-10 h-10 rounded-md" /> */}
            <IconFrame>
                <HiDocument />
            </IconFrame>
            <div className="flex flex-col">
                <span className="font-semibold">
                    {name}
                </span>
                <span className="text-foreground-muted text-xs">
                    {type}
                </span>
            </div>
        </div>
        <Button.SM href={src} download className="text-blue-500 hover:text-blue-700">
            <HiDownload />
        </Button.SM>
    </div>)
}