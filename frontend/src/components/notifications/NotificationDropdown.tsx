import { Bell, RadioTower } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { NotificationDot } from "@/components/notifications/NotificationDot";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { NotificationItem, SocketConnectionStatus } from "@/types/notification";

const connectionClasses = {
  idle: "bg-slate-100 text-slate-700",
  connecting: "bg-sky-100 text-sky-700",
  connected: "bg-emerald-100 text-emerald-700",
  disconnected: "bg-slate-100 text-slate-700",
  error: "bg-rose-100 text-rose-700",
};

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  status: SocketConnectionStatus;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  status,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen((previous) => !previous)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      connectionClasses[status]
                    }`}
                  >
                    <RadioTower className="h-3 w-3" />
                    {status}
                  </span>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => void markAllAsRead()}>
                Mark all read
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3">
              {notifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No alerts right now.
                </div>
              ) : (
                notifications.slice(0, 8).map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`mb-2 w-full rounded-2xl border p-3 text-left last:mb-0 ${
                      notification.read ? "border-border/70 bg-slate-50" : "border-sky-200 bg-sky-50/70"
                    }`}
                    onClick={() => void markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {!notification.read ? <NotificationDot className="h-2 w-2 ring-0" /> : null}
                          <p className="font-medium text-foreground">{notification.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
