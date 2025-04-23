import { HiPhoto } from "react-icons/hi2";

export default function Empty({ message }: { message?: string }) {
    return <div className="w-full h-full flex justify-center items-center border-border border rounded-md p-5 shadow-sm transition-all duration-200 ease-in-out">
        <div className="flex flex-col space-y-3 pt-12 pb-12 items-center justify-center h-[10rem]">
            <HiPhoto className="size-20 text-foreground-muted transition-colors duration-200 ease-in-out" />
            <span className="text-foreground-muted transition-colors duration-200 ease-in-out">
                {message ? message : 'Nothing to see here yet, something amazing is coming though...'}
            </span>
        </div>
    </div>;
}