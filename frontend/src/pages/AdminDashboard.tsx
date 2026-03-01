import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users, Search, Bot, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import type { AuthUser } from "@/types/auth";

type DashboardUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  robotId: string;
};

type ToastType = "success" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

const initialUsers: DashboardUser[] = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Martin",
    email: "alice@company.com",
    robotId: "R-001",
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Chen",
    email: "bob@company.com",
    robotId: "R-002",
  },
  {
    id: 3,
    firstName: "Clara",
    lastName: "Dubois",
    email: "clara@company.com",
    robotId: "R-003",
  },
  {
    id: 4,
    firstName: "Daniel",
    lastName: "Smith",
    email: "daniel@company.com",
    robotId: "R-004",
  },
];

interface AdminDashboardProps {
  onLogout: () => void;
  user: AuthUser;
}

interface CountUpProps {
  value: number;
  durationMs?: number;
}

const CountUp: React.FC<CountUpProps> = ({ value, durationMs = 700 }) => {
  const [display, setDisplay] = useState<number>(0);

  useEffect(() => {
    let frameId = 0;
    let start = 0;

    const step = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }
      const progress = Math.min((timestamp - start) / durationMs, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  return <>{display}</>;
};

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [users, setUsers] = useState<DashboardUser[]>(initialUsers);
  const [search, setSearch] = useState<string>("");
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const location = useLocation();

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("created") === "1") {
      addToast("User created successfully.", "success");
    }
    if (params.get("updated") === "1") {
      addToast("User updated successfully.", "success");
    }
  }, [location.search]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return users;
    }
    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(term)
    );
  }, [users, search]);

  const handleDeleteConfirm = () => {
    if (!userToDelete) {
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    addToast(`${userToDelete.firstName} ${userToDelete.lastName} deleted.`, "success");
    setUserToDelete(null);
  };

  const buttonHoverClass =
    "group transition-all duration-200 hover:scale-[1.03] hover:shadow-md";
  const iconHoverClass = "transition-colors duration-200 group-hover:text-foreground";

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage platform users, assign robots, and monitor system activity
              from this control panel.
            </p>
          </div>
          <Link
            to="/users/add"
            onClick={() => addToast("User created successfully.", "success")}
          >
            <Button className={`${buttonHoverClass} gap-2`}>
              <Plus className={`h-4 w-4 ${iconHoverClass}`} />
              Add User
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: "Total Users", value: users.length, icon: Users },
            { label: "Active Robots", value: 3, icon: Bot },
            { label: "Alerts", value: 2, icon: Bell },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.25 }}
              className="card-elevated p-5 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                <CountUp value={s.value} />
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex w-full items-center md:w-96">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name or email..."
              className="pl-9"
              aria-label="Search users"
            />
          </div>
        </div>

        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground">
                    Robot ID
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filteredUsers.map((u, index) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      className="border-b last:border-0 transition-colors duration-200 hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          {u.robotId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/users/edit/${u.id}`}
                            onClick={() => addToast("User updated successfully.", "success")}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`${buttonHoverClass} h-8 w-8 p-0`}
                              aria-label={`Edit ${u.firstName} ${u.lastName}`}
                            >
                              <Pencil
                                className={`h-4 w-4 text-muted-foreground ${iconHoverClass}`}
                              />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`${buttonHoverClass} h-8 w-8 p-0 text-destructive hover:text-destructive`}
                            onClick={() => setUserToDelete(u)}
                            aria-label={`Delete ${u.firstName} ${u.lastName}`}
                          >
                            <Trash2 className="h-4 w-4 transition-colors duration-200 group-hover:text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-sm text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
                {userToDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl p-6 shadow-2xl w-80"
            >
              <h3 className="font-semibold text-lg mb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setUserToDelete(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={`pointer-events-auto rounded-lg border p-3 text-sm shadow-lg ${
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
