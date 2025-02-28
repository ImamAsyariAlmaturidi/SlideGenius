import type React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "secondary" | "ghost";
}

export function Loader({
  className,
  size = "md",
  variant = "default",
  ...props
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const variantClasses = {
    default: "border-t-primary",
    secondary: "border-t-secondary",
    ghost: "border-t-muted-foreground",
  };

  return (
    <div
      className={cn(
        "animate-loader-spin rounded-full border-solid border-t-transparent",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
