import { BellRing } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { NotificationItem } from "@/types/notification";

interface NotificationsPreviewProps {
  notifications: NotificationItem[];
}

const priorityClasses = {
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
};

export function NotificationsPreview({ notifications }: NotificationsPreviewProps) {
  const items = notifications.slice(0, 4);

  return (
    <div className="card-elevated p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notification Stream</h2>
          <p className="text-sm text-muted-foreground">
            Recent alerts from requests, robot health, and communication channels.
          </p>
        </div>
        <Link to="/logs">
          <Button variant="outline" className="gap-2">
            <BellRing className="h-4 w-4" />
            Open Logs
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-6 text-sm text-muted-foreground">
            No notifications yet. Live events will appear here as the admin system receives them.
          </div>
        ) : (
          items.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-slate-50 p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{notification.title}</h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      priorityClasses[notification.priority]
                    }`}
                  >
                    {notification.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
