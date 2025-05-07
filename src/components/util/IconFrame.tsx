interface IconFrameProps {
    children: React.ReactNode;
    backgroundColor?: string; // Tailwind background color class
    baseColor?: string; // Tailwind text color class
}

export default function IconFrame({ 
    children, 
    backgroundColor = 'bg-primary-100',
    baseColor = 'text-primary-500'
}: IconFrameProps) {
    return (
        <div className={`flex size-12 ${backgroundColor} justify-center items-center ${baseColor} rounded-md text-lg`}>
            {children}
        </div>
    )
}
