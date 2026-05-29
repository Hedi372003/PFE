import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  BellRing,
  Bot,
  UsersRound,
  Waypoints,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { RobotStatusSummary } from "@/components/dashboard/RobotStatusSummary";

import { AppLayout } from "@/components/layout/AppLayout";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useSocket } from "@/hooks/useSocket";

import {
  authService,
  companyService,
  dashboardService,
  getApiErrorMessage,
  requestService,
  robotService,
  userService,
} from "@/services/api";

import type { VisitorRequest } from "@/types/request";
import type { RobotRecord } from "@/types/robot";
import type { UserRecord } from "@/types/user";

interface CommunicationStats {
  calls: number;
  conversations: number;
  requests: number;
}

const communicationChartColors = ["#2563eb", "#10b981", "#f59e0b"];

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

  const { unreadCount } = useSocket();

  const [visitors, setVisitors] = useState<UserRecord[]>([]);
  const [robots, setRobots] = useState<RobotRecord[]>([]);
  const [requests, setRequests] = useState<VisitorRequest[]>([]);
  const [communicationStats, setCommunicationStats] =
    useState<CommunicationStats>({
      calls: 0,
      conversations: 0,
      requests: 0,
    });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");

  const [period, setPeriod] = useState("week");

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
          setError(
            getApiErrorMessage(
              loadError,
              "Unable to load the admin dashboard right now."
            )
          );
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

  useEffect(() => {
    let active = true;

    const loadCommunicationStats = async () => {
      if (!isAdmin) {
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      setStatsError("");

      try {
        const stats = await dashboardService.getCommunicationStats(period);

        if (!active) {
          return;
        }

        setCommunicationStats(stats);
      } catch (loadError) {
        if (active) {
          setStatsError(
            getApiErrorMessage(
              loadError,
              "Unable to load communication statistics right now."
            )
          );
        }
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    };

    void loadCommunicationStats();

    return () => {
      active = false;
    };
  }, [isAdmin, period]);

  const onlineRobots = robots.filter(
    (robot) => robot.status === "online"
  ).length;

  const chartData = [
    { name: "Calls", value: communicationStats.calls },
    { name: "Conversations", value: communicationStats.conversations },
    { name: "Requests", value: communicationStats.requests },
  ];

  const chartTotal = chartData.reduce((total, item) => total + item.value, 0);

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
                  {isAdmin
                    ? "Administration dashboard"
                    : "Operator dashboard"}
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Centralize visitor approvals, communication,
                  robot supervision, and company content management.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-medium text-slate-300">
                Company profile
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {company.name}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {company.welcomeMessage}
              </p>

              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
                Support hours
              </p>

              <p className="mt-1 text-sm text-slate-100">
                {company.hours}
              </p>
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
            helper="Approved visitor profiles managed in the platform."
            icon={UsersRound}
            tone="info"
          />

          <MetricCard
            label="Robots Online"
            value={loading ? "..." : onlineRobots}
            helper={`${robots.length} robots currently tracked.`}
            icon={Bot}
            tone="success"
          />

          <MetricCard
            label="Pending Requests"
            value={loading ? "..." : requests.length}
            helper="Requests waiting for approval."
            icon={Waypoints}
            tone="warning"
          />

          <MetricCard
            label="Unread Alerts"
            value={unreadCount}
            helper="Realtime notifications."
            icon={BellRing}
            tone={unreadCount > 0 ? "critical" : "default"}
          />
        </section>

        {/* STATISTICS CHART */}

        <section className="card-elevated p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Communication Statistics
              </h2>

              <p className="text-sm text-muted-foreground">
                Calls, conversations and requests statistics.
              </p>
            </div>

            <Select value={period} onValueChange={setPeriod}>

              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>

            </Select>
          </div>

          <div className="mt-8">
            {statsError ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {statsError}
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
              <div className="grid gap-3 sm:grid-cols-3">
                {chartData.map((item, index) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-border/70 bg-slate-50 p-4"
                    style={{
                      borderLeftColor: communicationChartColors[index],
                      borderLeftWidth: 6,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: communicationChartColors[index] }}
                      />
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                    </div>

                    <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                      {statsLoading ? "..." : item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative h-[300px]">
                {statsLoading ? (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border text-sm text-muted-foreground">
                    Loading chart data...
                  </div>
                ) : chartTotal === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50 text-center">
                    <p className="text-4xl font-semibold text-foreground">0</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      No communication data to display.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={72}
                        outerRadius={108}
                        paddingAngle={3}
                        label={({ name, value }) => `${name}: ${value}`}
                        isAnimationActive={!statsLoading}
                      >
                        {chartData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={communicationChartColors[index]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>


          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          <RobotStatusSummary robots={robots} />

          <div className="card-elevated p-6">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-foreground">
                Quick Actions
              </h2>

              <p className="text-sm text-muted-foreground">
                Move fast between workflows.
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
                    <h3 className="font-medium text-foreground">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-500" />

                </Link>

              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
