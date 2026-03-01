import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Bot, ShoppingBag, History,
  Settings, ChevronLeft, Plus, Gamepad2, CalendarCheck, LogOut
} from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/users", icon: Users },
  { title: "Robot Control", url: "/robot-control", icon: Gamepad2 },
  { title: "Robots", url: "/robots", icon: Bot },
  { title: "Add Robot", url: "/robots/add", icon: Plus },
  { title: "Requests", url: "/requests", icon: CalendarCheck },
  { title: "Shop", url: "/shop", icon: ShoppingBag },
  { title: "Usage History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveRoute = (url: string) =>
    location.pathname === url || location.pathname.startsWith(`${url}/`);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Bot className="h-7 w-7 text-sidebar-primary" />
                <span className="font-bold text-lg text-sidebar-primary-foreground">TeleBot</span>
              </motion.div>
            )}
          </AnimatePresence>
          {!sidebarOpen && <Bot className="h-7 w-7 text-sidebar-primary mx-auto" />}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const active = isActiveRoute(item.url);
              return (
                <li key={item.url}>
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium btn-transition ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        </div>
      </motion.aside>

      {/* Main */}
      <div
        className="flex-1 transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? 256 : 64 }}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-foreground">
            {navItems.find(i => i.url === location.pathname)?.title || "TeleBot"}
          </h2>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold btn-transition hover:opacity-90"
              >
                A
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg border bg-card shadow-lg overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-card-foreground">Admin</p>
                      <p className="text-xs text-muted-foreground">admin@telebot.com</p>
                    </div>
                    <button
                      onClick={() => { navigate("/admin"); setUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm btn-transition ${
                        isActiveRoute("/admin")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-card-foreground hover:bg-muted"
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </button>
                    <button
                      onClick={() => { navigate("/settings"); setUserMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm btn-transition ${
                        isActiveRoute("/settings")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-card-foreground hover:bg-muted"
                      }`}
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setUserMenuOpen(false);
                        window.location.replace("/login");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 btn-transition border-t"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
