import { useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import {
  authService,
  companyService,
  getApiErrorMessage,
  logService,
  requestService,
  robotService,
  userService,
} from "@/services/api";
import type { ActivityLog, LogCategory, LogSeverity } from "@/types/log";

const severityClasses: Record<LogSeverity, string> = {
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
};

function sortLogs(logs: ActivityLog[]): ActivityLog[] {
  return [...logs].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

const Logs: React.FC = () => {
  const user = authService.getStoredUser();
  const isAdmin = user?.role === "admin";

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<LogCategory | "all">("all");

  useEffect(() => {
    let active = true;

    const loadLogs = async () => {
      setLoading(true);
      setError("");

      try {
        const [robots, users, requests] = await Promise.all([
          robotService.list(),
          isAdmin ? userService.list() : Promise.resolve([]),
          isAdmin ? requestService.listPending() : Promise.resolve([]),
        ]);

        if (!active) {
          return;
        }

        const company = companyService.load();
        const derivedLogs: ActivityLog[] = [
          ...robots.map((robot) => ({
            id: `robot-${robot.id}`,
            category: "robot" as const,
            severity: robot.status === "offline" ? "warning" : "info",
            title: `${robot.name} status synchronized`,
            description: logService.describeRobotStatus(robot.status),
            actor: "Robot fleet",
            timestamp: robot.updatedAt || robot.createdAt || new Date().toISOString(),
          })),
          ...users.map((visitor) => ({
            id: `visitor-${visitor.id}`,
            category: "visit" as const,
            severity: "success" as const,
            title: `${visitor.firstName} ${visitor.lastName} profile active`,
            description: visitor.robotId
              ? `Assigned to robot ${visitor.robotId}.`
              : "Waiting for robot assignment.",
            actor: "Visitor management",
            timestamp: visitor.updatedAt || visitor.createdAt || new Date().toISOString(),
          })),
          ...requests.map((request) => ({
            id: `request-${request.id}`,
            category: "visit" as const,
            severity: "warning" as const,
            title: `${request.firstName} ${request.lastName} awaiting approval`,
            description: request.message,
            actor: "Request queue",
            timestamp: request.createdAt || request.updatedAt || new Date().toISOString(),
          })),
          {
            id: "company-cms",
            category: "cms",
            severity: "info",
            title: `${company.name} content profile loaded`,
            description: "Public company information is ready for the landing page and administration shell.",
            actor: "Company CMS",
            timestamp: company.updatedAt,
          },
          ...logService.list(),
        ];

        setLogs(sortLogs(derivedLogs));
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, "Failed to load activity logs."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLogs();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((entry) => {
      const matchesCategory = category === "all" ? true : entry.category === category;
      const matchesSearch = query
        ? `${entry.title} ${entry.description} ${entry.actor}`.toLowerCase().includes(query)
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [category, logs, search]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated p-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Activity Logs</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review visit history, robot status events, communication actions, notifications, and CMS
            changes from one searchable timeline.
          </p>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="card-elevated p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs by title, description, or actor..."
            />

            <Select value={category} onValueChange={(value) => setCategory(value as LogCategory | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="visit">Visits</SelectItem>
                <SelectItem value="robot">Robots</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="notification">Notifications</SelectItem>
                <SelectItem value="cms">CMS</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="card-elevated overflow-hidden">
  {loading ? (
    <div className="p-8 text-sm text-muted-foreground">
      Loading activity history...
    </div>
  ) : filteredLogs.length === 0 ? (
    <div className="p-8 text-sm text-muted-foreground">
      No log entries match the current filter.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Title
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Severity
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Actor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Description
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredLogs.map((entry) => (
            <tr
              key={entry.id}
              className="border-t border-slate-200 hover:bg-slate-50 transition"
            >
              <td className="px-4 py-4 font-medium text-foreground">
                {entry.title}
              </td>

              <td className="px-4 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                  {entry.category}
                </span>
              </td>

              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClasses[entry.severity]}`}
                >
                  {entry.severity}
                </span>
              </td>

              <td className="px-4 py-4 text-sm text-muted-foreground">
                {entry.actor}
              </td>

              <td className="px-4 py-4 text-sm text-muted-foreground max-w-md">
                {entry.description}
              </td>

              <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                <div>{formatDateTime(entry.timestamp)}</div>
                <div className="text-xs">
                  {formatRelativeTime(entry.timestamp)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>
      </div>
    </AppLayout>
  );
};

export default Logs;
