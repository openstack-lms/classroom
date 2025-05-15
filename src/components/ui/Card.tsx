import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-base border border-base rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
} 