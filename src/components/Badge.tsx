import React from "react";

type BadgeProps = {
  color?: "primary" | "success" | "error" | "warning" | "foreground";
  children: string;
};

const Badge: React.FC<BadgeProps> = ({ color = "primary", children }) => {
  const colorClasses: Record<string, string> = {
    primary: "bg-primary-100 text-primary-500",
    success: "bg-successtext-success",
    error: "bg-base text-error",
    warning: "bg-base text-warning",
    foreground: "bg-background-muted text-foreground"
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClasses[color] || colorClasses.foreground}`}>
      {children}
    </span>
  );
};

export default Badge;
