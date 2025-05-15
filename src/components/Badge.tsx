import React from "react";

type BadgeVariant = "primary" | "success" | "error" | "warning" | "foreground";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = "primary", 
  children,
  className = ""
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    primary: "bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors",
    success: "bg-success-100 text-success-700 hover:bg-success-200 transition-colors",
    error: "bg-error-100 text-error-700 hover:bg-error-200 transition-colors",
    warning: "bg-warning-100 text-warning-700 hover:bg-warning-200 transition-colors",
    foreground: "bg-background-muted text-foreground hover:bg-background-muted/80 transition-colors"
  };

  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 
        text-xs font-medium rounded-full
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
