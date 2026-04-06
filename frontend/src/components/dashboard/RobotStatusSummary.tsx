import { Activity, Bot, Wrench } from "lucide-react";

import type { RobotRecord } from "@/types/robot";

interface RobotStatusSummaryProps {
  robots: RobotRecord[];
}

export function RobotStatusSummary({ robots }: RobotStatusSummaryProps) {
  const onlineCount = robots.filter((robot) => robot.status === "online").length;
  const maintenanceCount = robots.filter((robot) => robot.status === "maintenance").length;
  const offlineCount = robots.filter((robot) => robot.status === "offline").length;

  const summaries = [
    {
      label: "Online",
      value: onlineCount,
      helper: "Available for live sessions",
      icon: Activity,
      chipClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Maintenance",
      value: maintenanceCount,
      helper: "Under supervision",
      icon: Wrench,
      chipClassName: "bg-amber-100 text-amber-700",
    },
    {
      label: "Offline",
      value: offlineCount,
      helper: "Waiting for reactivation",
      icon: Bot,
      chipClassName: "bg-slate-200 text-slate-700",
    },
  ];

  return (
    <div className="card-elevated p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Robot Status</h2>
          <p className="text-sm text-muted-foreground">
            Fleet availability across the telepresence administration system.
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {robots.length} total
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaries.map((summary) => (
          <div key={summary.label} className="rounded-2xl border border-border/70 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${summary.chipClassName}`}>
                {summary.label}
              </span>
              <summary.icon className="h-4 w-4 text-slate-500" />
            </div>
            <p className="text-3xl font-semibold text-foreground">{summary.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{summary.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
