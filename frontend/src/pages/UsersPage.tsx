import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Pencil, Search, Trash2, UserPlus2, UserRoundX, UsersRound } from "lucide-react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationDot } from "@/components/notifications/NotificationDot";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { useNotificationBadges } from "@/hooks/useNotificationBadges";
import { formatDateTime } from "@/lib/utils";
import { getApiErrorMessage, logService, userService } from "@/services/api";
import type { UserRecord } from "@/types/user";

const UsersPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { badgeState } = useNotificationBadges();

  const [visitors, setVisitors] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeVisitorId, setActiveVisitorId] = useState<string | null>(null);
  const [visitorToDelete, setVisitorToDelete] = useState<UserRecord | null>(null);

  const loadVisitors = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await userService.list();
      setVisitors(data.filter((user) => user.role === "user"));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Failed to load visitor profiles."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVisitors();
  }, []);

  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    const params = new URLSearchParams(location.search);
    const toastMessage =
      state?.toast ||
      (params.get("created") === "1"
        ? "Visitor created successfully."
        : params.get("updated") === "1"
          ? "Visitor updated successfully."
          : "");

    if (toastMessage) {
      setMessage(toastMessage);
      const timer = window.setTimeout(() => setMessage(""), 2500);
      navigate(location.pathname, { replace: true, state: null });
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [location.pathname, location.search, location.state, navigate]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return visitors;
    }

    return visitors.filter((visitor) =>
      `${visitor.firstName} ${visitor.lastName} ${visitor.email} ${visitor.phone}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, visitors]);

  const newTodayCount = useMemo(() => {
    const today = new Date().toDateString();

    return visitors.filter((visitor) => {
      if (!visitor.createdAt) {
        return false;
      }

      return new Date(visitor.createdAt).toDateString() === today;
    }).length;
  }, [visitors]);

  const assignedCount = useMemo(
    () => visitors.filter((visitor) => Boolean(visitor.robotId)).length,
    [visitors],
  );

  const unassignedCount = Math.max(0, visitors.length - assignedCount);

  const handleDelete = async (visitor: UserRecord) => {
    setActiveVisitorId(visitor.id);
    setError("");

    try {
      await userService.remove(visitor.id);
      setVisitors((previous) => previous.filter((item) => item.id !== visitor.id));
      setMessage(`${visitor.firstName} ${visitor.lastName} removed.`);
      logService.record({
        category: "visit",
        severity: "warning",
        actor: "Admin",
        title: "Visitor profile deleted",
        description: `${visitor.firstName} ${visitor.lastName} was removed from visitor management.`,
      });
      window.setTimeout(() => setMessage(""), 2500);
      return true;
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Failed to remove the visitor."));
      return false;
    } finally {
      setActiveVisitorId(null);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Visitor Management</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Manage approved visitor profiles, keep robot assignments clean, and move directly into
                edit or approval workflows without breaking the existing admin routes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/requests" className="relative">
                <Button variant="outline" className="gap-2 pr-5">
                  <ArrowRight className="h-4 w-4" />
                  Review Requests
                </Button>
                {badgeState.requests ? (
                  <NotificationDot
                    className="absolute right-2 top-2 ring-slate-100"
                    label="Unread request notifications"
                  />
                ) : null}
              </Link>
              <Link to="/users/add">
                <Button>Add Visitor</Button>
              </Link>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Approved Visitors"
            value={loading ? "..." : visitors.length}
            helper="Profiles currently available in visitor management."
            icon={UsersRound}
          />
          <MetricCard
            label="Created Today"
            value={loading ? "..." : newTodayCount}
            helper="New visitor profiles added during the current day."
            icon={UserPlus2}
            tone={newTodayCount > 0 ? "success" : "default"}
          />
          <MetricCard
            label="Robot Assigned"
            value={loading ? "..." : assignedCount}
            helper="Visitors already linked to a robot identity."
            icon={UsersRound}
            tone={assignedCount > 0 ? "success" : "default"}
          />
          <MetricCard
            label="Unassigned"
            value={loading ? "..." : unassignedCount}
            helper="Visitors still waiting for fleet assignment."
            icon={UserRoundX}
            tone={unassignedCount > 0 ? "warning" : "default"}
          />
        </section>

        <section className="card-elevated p-6">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search visitors by name, email, or phone..."
            />
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">Loading visitor directory...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">
              No visitor profiles match the current search.
            </div>
          ) : (
            filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="card-elevated p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">
                      {visitor.firstName} {visitor.lastName}
                    </h2>
                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                      <p>{visitor.email}</p>
                      <p>{visitor.phone}</p>
                      <p>Robot assignment: {visitor.robotId || "Unassigned"}</p>
                      <p>Updated: {formatDateTime(visitor.updatedAt || visitor.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to={`/users/edit/${visitor.id}`}>
                      <Button variant="outline" className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="gap-2 border-rose-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                      disabled={activeVisitorId === visitor.id}
                      onClick={() => setVisitorToDelete(visitor)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <ConfirmDialog
        open={!!visitorToDelete}
        title="Delete visitor profile?"
        description={
          visitorToDelete
            ? `You are about to permanently delete ${visitorToDelete.firstName} ${visitorToDelete.lastName} from visitor management.`
            : ""
        }
        confirmationMessage="This will remove the visitor record and any current robot assignment linked to this profile."
        confirmText="Delete Visitor"
        cancelText="Cancel"
        loading={activeVisitorId === visitorToDelete?.id}
        loadingText="Deleting visitor..."
        onCancel={() => setVisitorToDelete(null)}
        onConfirm={async () => {
          if (!visitorToDelete) return;

          const deleted = await handleDelete(visitorToDelete);
          if (deleted) {
            setVisitorToDelete(null);
          }
        }}
      />
    </AppLayout>
  );
};

export default UsersPage;
