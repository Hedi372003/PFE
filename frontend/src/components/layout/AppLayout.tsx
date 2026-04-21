import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  Bot,
  Building2,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings,
  UsersRound,
  Waypoints,
  Wrench,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { NotificationDot } from "@/components/notifications/NotificationDot";
import { Button } from "@/components/ui/button";
import { useNotificationBadges, type NotificationBadgeKey } from "@/hooks/useNotificationBadges";
import type { AuthUser } from "@/types/auth";

interface NavigationItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: NotificationBadgeKey;
}

const adminNavItems: NavigationItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Visitors", url: "/users", icon: UsersRound },
  { title: "Requests", url: "/requests", icon: Waypoints, badgeKey: "requests" },

  { title: "Robot Control", url: "/robot-control", icon: Wrench, badgeKey: "robots" },
  { title: "Robots", url: "/robots", icon: Bot, badgeKey: "robots" },
  { title: "Company CMS", url: "/company-cms", icon: Building2 },
  { title: "Logs", url: "/logs", icon: BookOpenText, badgeKey: "logs" },
  { title: "Settings", url: "/settings", icon: Settings },
];

const operatorNavItems: NavigationItem[] = [
  { title: "Dashboard", url: "/operator", icon: LayoutDashboard },
  { title: "Communication", url: "/communication", icon: MessageSquareText, badgeKey: "communication" },
  { title: "Robot Control", url: "/robot-control", icon: Wrench, badgeKey: "robots" },
  { title: "Robots", url: "/robots", icon: Bot, badgeKey: "robots" },
  { title: "Logs", url: "/logs", icon: BookOpenText, badgeKey: "logs" },
  { title: "Settings", url: "/settings", icon: Settings },
];

function getStoredUser(): AuthUser | null {
  try {
    const rawValue = localStorage.getItem("user");
    return rawValue ? (JSON.parse(rawValue) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { badgeState, notifications, unreadCount, markAsRead, markAllAsRead, status } =
    useNotificationBadges();

  const user = getStoredUser();
  const navItems = user?.role === "admin" ? adminNavItems : operatorNavItems;
  const pageTitle = useMemo(
    () =>
      navItems.find(
        (item) => location.pathname === item.url || location.pathname.startsWith(`${item.url}/`),
      )?.title || "Operations",
    [location.pathname, navItems],
  );

  const dashboardPath = user?.role === "admin" ? "/admin" : "/operator";

  return (
    <div className="min-h-screen bg-slate-100">
      <motion.aside
        animate={{ width: sidebarOpen ? 274 : 92 }}
        transition={{ duration: 0.22 }}
        className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-800 bg-slate-950 text-white"
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
            <Bot className="h-6 w-6" />
          </div>

          <AnimatePresence initial={false}>
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="min-w-0"
              >
                <p className="truncate text-lg font-semibold">TeleBot Admin</p>
                <p className="truncate text-xs text-slate-400">Telepresence operations suite</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 py-5">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const active =
                location.pathname === item.url || location.pathname.startsWith(`${item.url}/`);
              const showBadge = item.badgeKey ? badgeState[item.badgeKey] : false;

              return (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      active ? "bg-slate-800 text-white shadow-sm" : "text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <span className="relative flex shrink-0">
                      <item.icon className="h-5 w-5 shrink-0" />
                      {showBadge ? (
                        <NotificationDot
                          className="absolute -right-1 -top-1 ring-slate-950"
                          label={`Unread alerts in ${item.title}`}
                        />
                      ) : null}
                    </span>
                    {sidebarOpen ? <span className="truncate">{item.title}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <Button
            variant="ghost"
            className="w-full justify-center text-slate-300 hover:bg-slate-900 hover:text-white"
            onClick={() => setSidebarOpen((previous) => !previous)}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
          </Button>
        </div>
      </motion.aside>

      <div className="transition-all duration-200" style={{ marginLeft: sidebarOpen ? 274 : 92 }}>
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-sm">
          <div className="flex h-20 items-center justify-between gap-4 px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Telepresence</p>
              <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
            </div>

            <div className="relative flex items-center gap-3">
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                status={status}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
              />

              <button
                type="button"
                onClick={() => setMenuOpen((previous) => !previous)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
                </div>
                {sidebarOpen ? (
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name || "TeleBot operator"}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">{user?.role || "session"}</p>
                  </div>
                ) : null}
              </button>

              <AnimatePresence>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-16 z-50 w-56 rounded-3xl border border-border bg-card p-2 shadow-2xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(dashboardPath);
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-foreground hover:bg-slate-100"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/settings");
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-foreground hover:bg-slate-100"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.replace("/login");
                      }}
                      className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
