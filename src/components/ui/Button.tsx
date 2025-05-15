const Button = {
    Primary: ({ children, onClick, ...props }: Readonly<{
        children: React.ReactNode,
        onClick?: () => void,
        [key: string]: any,
    }>) => {
        return (<button onClick={onClick} {...props} className={`bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md shadow-sm transition-all duration-200 ease-in-out ${props.className}`} >
            {children}
        </button>);
    },
    Light: ({ children, onClick, ...props }: Readonly<{
        children: React.ReactNode,
        onClick?: () => void,
        [key: string]: any,
    }>) => {
        return (<button onClick={onClick} {...props} className={`border border-border bg-background hover:bg-background-muted py-2 px-4 rounded-md shadow-sm transition-all duration-200 ease-in-out ${props.className}`}>
            {children}
        </button>);
    },
    Select: ({ children, onClick, ...props }: Readonly<{
        children: React.ReactNode,
        onClick?: () => void,
        [key: string]: any,
    }>) => {
        return (<a onClick={onClick} {...props} className={`bg-background hover:bg-background-muted text-foreground py-3 px-4 rounded-md shadow-sm transition-all duration-200 ease-in-out ${props.className}`}>
            {children}
        </a>);
    },
    SM: ({ children, onClick, ...props }: Readonly<{
        children: React.ReactNode,
        onClick?: () => void,
        [key: string]: any,
    }>) => {
        return (<button 
            type="button"
            onClick={onClick} 
            {...props} 
            className={`transition-colors duration-200 ease-in-out ${props.className ? props.className : 'text-foreground hover:text-foreground-muted'}`}
        >
            {children}
        </button>);
    }
}

export default Button;