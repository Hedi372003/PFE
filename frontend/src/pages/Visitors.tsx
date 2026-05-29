import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Pencil, Search, Trash2, UserPlus2, UserRoundX, UsersRound } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

type VisitorMetric = "approved" | "today" | "assigned" | "unassigned";

const visitorChartColors = ["#2563eb", "#10b981", "#7c3aed", "#f59e0b"];

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
  const [activeMetric, setActiveMetric] = useState<VisitorMetric | null>(null);

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

  const isCreatedToday = (visitor: UserRecord) => {
    if (!visitor.createdAt) {
      return false;
    }

    return new Date(visitor.createdAt).toDateString() === new Date().toDateString();
  };

  const metricVisitors = useMemo(() => {
    if (activeMetric === "today") {
      return visitors.filter(isCreatedToday);
    }

    if (activeMetric === "assigned") {
      return visitors.filter((visitor) => Boolean(visitor.robotId));
    }

    if (activeMetric === "unassigned") {
      return visitors.filter((visitor) => !visitor.robotId);
    }

    return visitors;
  }, [activeMetric, visitors]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return metricVisitors;
    }

    return metricVisitors.filter((visitor) =>
      `${visitor.firstName} ${visitor.lastName} ${visitor.email} ${visitor.phone}`
        .toLowerCase()
        .includes(query),
    );
  }, [metricVisitors, search]);

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

  const visitorChartData = useMemo(
    () => [
      {
        name: "Approved Visitors",
        value: visitors.length,
        description: "Approved visitor profiles imported from the database.",
      },
      {
        name: "Created Today",
        value: newTodayCount,
        description: "Visitor profiles created during the current day.",
      },
      {
        name: "Robot Assigned",
        value: assignedCount,
        description: "Visitors already linked to a robot identity.",
      },
      {
        name: "Unassigned",
        value: unassignedCount,
        description: "Visitors still waiting for fleet assignment.",
      },
    ],
    [assignedCount, newTodayCount, unassignedCount, visitors.length],
  );

  const visitorChartTotal = visitorChartData.reduce((total, item) => total + item.value, 0);

  const metricDetails = useMemo(() => {
    const countByMetric = {
      approved: visitors.length,
      today: newTodayCount,
      assigned: assignedCount,
      unassigned: unassignedCount,
    };

    const details = {
      approved: {
        label: "Approved Visitors",
        identifier: `VIS-APPROVED-${String(countByMetric.approved).padStart(3, "0")}`,
        description: "All approved visitor profiles currently available.",
      },
      today: {
        label: "Created Today",
        identifier: `VIS-TODAY-${new Date().toISOString().slice(0, 10)}-${String(countByMetric.today).padStart(3, "0")}`,
        description: "Visitor profiles created during the current day.",
      },
      assigned: {
        label: "Robot Assigned",
        identifier: `VIS-ROBOT-ASSIGNED-${String(countByMetric.assigned).padStart(3, "0")}`,
        description: "Visitors already linked to a robot identity.",
      },
      unassigned: {
        label: "Unassigned",
        identifier: `VIS-UNASSIGNED-${String(countByMetric.unassigned).padStart(3, "0")}`,
        description: "Visitors still waiting for a robot assignment.",
      },
    };

    return activeMetric ? details[activeMetric] : null;
  }, [activeMetric, assignedCount, newTodayCount, unassignedCount, visitors.length]);

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
            tone="info"
            active={activeMetric === "approved"}
            onClick={() => setActiveMetric("approved")}
          />
          <MetricCard
            label="Created Today"
            value={loading ? "..." : newTodayCount}
            helper="New visitor profiles added during the current day."
            icon={UserPlus2}
            tone="success"
            active={activeMetric === "today"}
            onClick={() => setActiveMetric("today")}
          />
          <MetricCard
            label="Robot Assigned"
            value={loading ? "..." : assignedCount}
            helper="Visitors already linked to a robot identity."
            icon={UsersRound}
            tone="violet"
            active={activeMetric === "assigned"}
            onClick={() => setActiveMetric("assigned")}
          />
          <MetricCard
            label="Unassigned"
            value={loading ? "..." : unassignedCount}
            helper="Visitors still waiting for fleet assignment."
            icon={UserRoundX}
            tone="warning"
            active={activeMetric === "unassigned"}
            onClick={() => setActiveMetric("unassigned")}
          />
        </section>

        {metricDetails ? (
          <section className="card-elevated p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dynamic identifier for {metricDetails.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {metricDetails.identifier}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {metricDetails.description}
                </p>
              </div>

              <Button variant="outline" onClick={() => setActiveMetric(null)}>
                Show All
              </Button>
            </div>
          </section>
        ) : null}

        <section className="card-elevated p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Visitor Statistics Overview</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Database-backed summary of approved visitors, daily creations, robot assignments,
                and unassigned profiles.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {visitorChartData.map((item, index) => (
                  <div key={item.name} className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: visitorChartColors[index] }}
                      />
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    </div>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                      {loading ? "..." : item.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[300px]">
              {loading ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border text-sm text-muted-foreground">
                  Loading chart data...
                </div>
              ) : visitorChartTotal === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50 text-center">
                  <p className="text-4xl font-semibold text-foreground">0</p>
                  <p className="mt-2 text-sm text-muted-foreground">No visitor data to display.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visitorChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={72}
                      outerRadius={108}
                      paddingAngle={3}
                      label={({ name, value }) => `${name}: ${value}`}
                      isAnimationActive={!loading}
                    >
                      {visitorChartData.map((item, index) => (
                        <Cell key={item.name} fill={visitorChartColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
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
