import { BatteryCharging, Gauge, MapPinned, Wifi } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { formatDateTime } from "@/lib/utils";
import type { RobotRecord, RobotTelemetry } from "@/types/robot";

interface TelemetryCardProps {
  robot: RobotRecord;
  telemetry: RobotTelemetry;
}

const networkClasses = {
  excellent: "text-emerald-600",
  good: "text-sky-600",
  unstable: "text-amber-600",
  offline: "text-slate-500",
};

export function TelemetryCard({ robot, telemetry }: TelemetryCardProps) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Live Telemetry</h2>
        <p className="text-sm text-muted-foreground">
          Robot health, signal quality, and navigation context.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <BatteryCharging className="h-4 w-4 text-emerald-600" />
              Battery
            </span>
            <span className="text-muted-foreground">{telemetry.batteryLevel}%</span>
          </div>
          <Progress value={telemetry.batteryLevel} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Wifi className={`h-4 w-4 ${networkClasses[telemetry.networkQuality]}`} />
              Network
            </p>
            <p className="text-sm capitalize text-muted-foreground">{telemetry.networkQuality}</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <Gauge className="h-4 w-4 text-sky-600" />
              Motion
            </p>
            <p className="text-sm text-muted-foreground">{telemetry.speedKph.toFixed(1)} km/h</p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPinned className="h-4 w-4 text-slate-700" />
              Coordinates
            </p>
            <p className="text-sm text-muted-foreground">
              {robot.latitude.toFixed(3)}, {robot.longitude.toFixed(3)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-slate-50 p-4 text-sm text-muted-foreground">
          <p>Last synced: {formatDateTime(robot.updatedAt || robot.createdAt)}</p>
          <p className="mt-1">Presence status refreshed {telemetry.lastSeenLabel}.</p>
        </div>
      </div>
    </div>
  );
}
