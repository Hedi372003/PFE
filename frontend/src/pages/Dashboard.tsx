import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  Bot,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
  Waypoints,
} from "lucide-react";
import { Link } from "react-router-dom";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { NotificationsPreview } from "@/components/dashboard/NotificationsPreview";
import { RobotStatusSummary } from "@/components/dashboard/RobotStatusSummary";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { formatDateTime } from "@/lib/utils";
import {
  authService,
  companyService,
  getApiErrorMessage,
  requestService,
  robotService,
  userService,
} from "@/services/api";
import type { VisitorRequest } from "@/types/request";
import type { RobotRecord } from "@/types/robot";
import type { UserRecord } from "@/types/user";

const quickActions = [
  {
    title: "Validate visitor flow",
    description: "Review pending requests and prepare live support.",
    href: "/requests",
  },
  {
    title: "Open communication room",
    description: "Start an audio or video support session in one click.",
    href: "/communication",
  },
  {
    title: "Inspect robot fleet",
    description: "Monitor availability, battery, and navigation status.",
    href: "/robots",
  },
];

const Dashboard: React.FC = () => {
  const user = authService.getStoredUser();
  const isAdmin = user?.role === "admin";
  const { notifications, unreadCount } = useSocket();

  const [visitors, setVisitors] = useState<UserRecord[]>([]);
  const [robots, setRobots] = useState<RobotRecord[]>([]);
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const company = useMemo(() => companyService.load(), []);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [robotList, visitorList, requestList] = await Promise.all([
          robotService.list(),
          isAdmin ? userService.list() : Promise.resolve([]),
          isAdmin ? requestService.listPending() : Promise.resolve([]),
        ]);

        if (!active) {
          return;
        }

        setRobots(robotList);
        setVisitors(visitorList);
        setRequests(requestList);
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, "Unable to load the admin dashboard right now."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const onlineRobots = robots.filter((robot) => robot.status === "online").length;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated overflow-hidden">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                Professional telepresence administration
              </span>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {isAdmin ? "Administration dashboard" : "Operator dashboard"}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Centralize visitor approvals, communication, robot supervision, and company content
                  management from a clean administration workspace ready for your PFE presentation.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-medium text-slate-300">Company profile</p>
              <h2 className="mt-2 text-2xl font-semibold">{company.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{company.welcomeMessage}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">Support hours</p>
              <p className="mt-1 text-sm text-slate-100">{company.hours}</p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Registered Visitors"
            value={loading ? "..." : visitors.length}
            helper={isAdmin ? "Approved visitor profiles managed in the platform." : "Visible to admin accounts only."}
            icon={UsersRound}
          />
          <MetricCard
            label="Robots Online"
            value={loading ? "..." : onlineRobots}
            helper={`${robots.length} robots currently tracked by the frontend.`}
            icon={Bot}
            tone={onlineRobots > 0 ? "success" : "warning"}
          />
          <MetricCard
            label="Pending Requests"
            value={loading ? "..." : requests.length}
            helper={isAdmin ? "Requests waiting for approval or follow-up." : "Admin review queue."}
            icon={Waypoints}
            tone={requests.length > 0 ? "warning" : "default"}
          />
          <MetricCard
            label="Unread Alerts"
            value={unreadCount}
            helper="Database-backed notifications with live realtime updates."
            icon={BellRing}
            tone={unreadCount > 0 ? "critical" : "default"}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <RobotStatusSummary robots={robots} />

          <div className="card-elevated p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">
                Move fast between the telepresence workflows that matter most during demos.
              </p>
            </div>

            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
                >
                  <div>
                    <h3 className="font-medium text-foreground">{action.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-white p-4">
              <p className="text-sm font-medium text-foreground">Security posture</p>
              <div className="mt-3 flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Authenticated administration flow</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Axios-based API access, typed routes, and role-based navigation are now aligned.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <NotificationsPreview notifications={notifications} />

          <div className="card-elevated p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Operations Snapshot</h2>
              <p className="text-sm text-muted-foreground">
                Key context for reception, robot readiness, and communications.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-foreground">Next recommended action</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {requests.length > 0
                    ? "Review pending visitor requests and prepare communication handoff."
                    : "No pending requests. You can focus on robot supervision or company content updates."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-foreground">Most recent robot sync</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {robots[0] ? formatDateTime(robots[0].updatedAt || robots[0].createdAt) : "No robot data yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="text-sm font-medium text-foreground">Communication readiness</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  The new communication workspace supports audio, video, chat, and WebRTC service scaffolding.
                </p>
                <Link to="/communication" className="mt-4 inline-flex">
                  <Button className="gap-2">
                    <MessageSquareText className="h-4 w-4" />
                    Open Communication
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
