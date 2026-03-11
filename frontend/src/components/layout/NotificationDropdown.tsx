import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockNotifications = [
  { id: 1, text: "Robot R-001 went offline", time: "2 min ago", read: false },
  { id: 2, text: "New user registered", time: "15 min ago", read: false },
  { id: 3, text: "Robot R-003 battery low", time: "1 hr ago", read: true },
  { id: 4, text: "System update completed", time: "3 hr ago", read: true },
];

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = mockNotifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-muted btn-transition"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 rounded-lg border bg-card shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold text-sm text-card-foreground">Notifications</h3>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {mockNotifications.map(n => (
                <li
                  key={n.id}
                  className={`px-4 py-3 border-b last:border-0 text-sm ${
                    !n.read ? "bg-accent/10" : ""
                  }`}
                >
                  <p className="text-card-foreground">{n.text}</p>
                  <p className="text-muted-foreground text-xs mt-1">{n.time}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
