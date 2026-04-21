import { cn } from "@/lib/utils";

interface NotificationDotProps {
  className?: string;
  label?: string;
}

export function NotificationDot({
  className,
  label = "Unread notifications",
}: NotificationDotProps) {
  return (
    <span
      aria-label={label}
      title={label}
      className={cn("inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white", className)}
    />
  );
}
