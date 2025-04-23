export default function NotFound () {
    return (
        <div className="flex flex-row space-x-5 items-center justify-center h-full">
            <h1 className="text-6xl font-thin text-foreground">404</h1>
            <div className="w-0.5 h-20 bg-border"></div>
            <div className="flex flex-col space-y-2">
                <h1 className="text-lg font-semibold text-foreground">Page Not Found</h1>
                <span className="text-sm text-foreground-muted">The page you are looking for does not exist.</span>
                <a href="/" className="text-primary-500 hover:underline rounded-md font-medium">Go back to home</a>
            </div>
        </div>
    );
}