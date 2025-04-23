export default function IconFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex size-12 bg-primary-100 justify-center items-center text-primary-500 rounded-md text-lg">
            {children}
        </div>
    )
}
