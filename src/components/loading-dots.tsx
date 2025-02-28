import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  color?: string;
}

export function LoadingDots({
  className,
  color = "bg-white",
}: LoadingDotsProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div
        className={cn("h-2 w-2 rounded-full animate-pulse-opacity", color)}
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className={cn("h-2 w-2 rounded-full animate-pulse-opacity", color)}
        style={{ animationDelay: "300ms" }}
      ></div>
      <div
        className={cn("h-2 w-2 rounded-full animate-pulse-opacity", color)}
        style={{ animationDelay: "600ms" }}
      ></div>
    </div>
  );
}
