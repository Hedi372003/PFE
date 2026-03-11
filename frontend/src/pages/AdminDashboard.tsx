import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, Users, Search, Bot, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLayout } from "@/components/layout/AppLayout";
import api from "@/api/axios";
import type { AuthUser } from "@/types/auth";

type DashboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  robotId: string | null;
};

type ToastType = "success" | "info" | "error";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

interface ApiErrorResponse {
  message?: string;
}

interface UsersResponseItem {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  robotId?: string | null;
}

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
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / durationMs, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  return <>{display}</>;
};

const mapApiUser = (u: UsersResponseItem): DashboardUser => {
  const fullName = u.name?.trim() || "";
  const [fallbackFirstName, ...rest] = fullName.split(" ");

  return {
    id: u.id || u._id || "",
    firstName: u.firstName || fallbackFirstName || "",
    lastName: u.lastName || rest.join(" "),
    email: u.email,
    phone: u.phone || "",
    robotId: u.robotId ?? null,
  };
};

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userToDelete, setUserToDelete] = useState<DashboardUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const location = useLocation();

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);

    try {
      const { data } = await api.get<UsersResponseItem[]>("/api/users");
      setUsers((Array.isArray(data) ? data : []).map(mapApiUser));
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const apiMessage = (err.response?.data as ApiErrorResponse)?.message;
        addToast(apiMessage || "Failed to load users.", "error");
      } else addToast("Failed to load users.", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("created") === "1")
      addToast("User created successfully.", "success");

    if (params.get("updated") === "1")
      addToast("User updated successfully.", "success");
  }, [location.search]);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();

    return users.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(term)
    );
  }, [users, search]);

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleting(true);

    try {
      await api.delete(`/api/users/${userToDelete.id}`);

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));

      addToast(
        `${userToDelete.firstName} ${userToDelete.lastName} deleted.`,
        "success"
      );

      setUserToDelete(null);
    } catch {
      addToast("Failed to delete user.", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage platform users and monitor robot activity.
            </p>
          </div>

          <Link to="/users/add">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white flex gap-2">
              <Plus size={16} />
              Add User
            </Button>
          </Link>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-3xl font-bold text-slate-800">
              <CountUp value={users.length} />
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-slate-500">Active Robots</p>
            <p className="text-3xl font-bold text-slate-800">
              <CountUp value={users.filter((u) => u.robotId).length} />
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-slate-500">Alerts</p>
            <p className="text-3xl font-bold text-slate-800">
              <CountUp value={2} />
            </p>
          </div>

        </div>

        {/* SEARCH */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">

            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Robot ID</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>

              {loadingUsers && (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    Loading users...
                  </td>
                </tr>
              )}

              {!loadingUsers && filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-slate-50">

                  <td className="px-5 py-3">
                    {u.firstName} {u.lastName}
                  </td>

                  <td className="px-5 py-3 text-slate-600">
                    {u.email}
                  </td>

                  <td className="px-5 py-3">
                    {u.robotId ? (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {u.robotId}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">

                      <Link to={`/users/edit/${u.id}`}>
                        <Button size="sm" variant="ghost">
                          <Pencil size={16} />
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setUserToDelete(u)}
                        className="text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

<<<<<<< HEAD
export default AdminDashboard;
=======
export default AdminDashboard;
>>>>>>> forth
