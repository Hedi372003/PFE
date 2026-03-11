import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Bot,
  Settings,
  ChevronLeft,
  Plus,
  Gamepad2,
  CalendarCheck,
  LogOut,
} from "lucide-react";

import { NotificationDropdown } from "./NotificationDropdown";
import { Button } from "@/components/ui/button";

/* =========================
   NAV ITEMS
========================= */

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "Robots", url: "/robots", icon: Bot },
  { title: "Add Robot", url: "/robots/add", icon: Plus },
  { title: "Robot Control", url: "/robot-control", icon: Gamepad2 },
  { title: "Requests", url: "/requests", icon: CalendarCheck },
  { title: "Settings", url: "/settings", icon: Settings },
];

const operatorNavItems = [
  { title: "Dashboard", url: "/operator", icon: LayoutDashboard },
  { title: "Robot Control", url: "/robot-control", icon: Gamepad2 },
  { title: "Robots", url: "/robots", icon: Bot },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  /* =========================
     USER ROLE
  ========================= */

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navItems =
    user.role === "admin" ? adminNavItems : operatorNavItems;

  const isActiveRoute = (url: string) =>
    location.pathname === url || location.pathname.startsWith(`${url}/`);

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* SIDEBAR */}

      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 70 }}
        transition={{ duration: 0.2 }}
        className="fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white flex flex-col"
      >
        {/* LOGO */}

        <div className="flex items-center gap-2 h-16 px-4 border-b border-slate-800">
          <Bot className="h-6 w-6 text-blue-400" />

          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-lg"
              >
                TeleBot
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">

            {navItems.map((item) => {

              const active = isActiveRoute(item.url);

              return (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                      active
                        ? "bg-slate-800"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />

                    {sidebarOpen && item.title}
                  </Link>
                </li>
              );
            })}

          </ul>
        </nav>

        {/* COLLAPSE BUTTON */}

        <div className="p-2 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-white hover:bg-slate-800"
          >
            <ChevronLeft
              className={`h-4 w-4 transition ${
                !sidebarOpen && "rotate-180"
              }`}
            />
          </Button>
        </div>
      </motion.aside>

      {/* MAIN */}

      <div
        className="flex-1 transition-all"
        style={{ marginLeft: sidebarOpen ? 260 : 70 }}
      >

        {/* TOPBAR */}

        <header className="h-16 bg-white border-b flex items-center justify-between px-6">

          <h1 className="text-lg font-semibold text-slate-800">
            {navItems.find((i) => i.url === location.pathname)?.title ||
              "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">

            <NotificationDropdown />

            {/* USER BUTTON */}

            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="h-9 w-9 rounded-full bg-slate-900 text-white"
            >
              {user.firstName?.charAt(0) || "U"}
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-6 top-16 w-48 bg-white border rounded-lg shadow-lg"
                >
                  <button
                    onClick={() =>
                      navigate(
                        user.role === "admin"
                          ? "/admin"
                          : "/operator"
                      )
                    }
                    className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="flex w-full items-center gap-2 px-4 py-2 hover:bg-slate-100"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");

                      window.location.replace("/login");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 border-t"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </header>

        {/* CONTENT */}

        <main className="p-6">{children}</main>

      </div>
    </div>
  );
}