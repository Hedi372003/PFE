import { useEffect, useMemo, useState } from "react";
import { Bot, Plus, Trash2, Wrench } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { RobotStatusBadge } from "@/components/robot/RobotStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deriveRobotTelemetry } from "@/lib/robot";
import { formatDateTime } from "@/lib/utils";
import { getApiErrorMessage, logService, robotService } from "@/services/api";
import type { RobotRecord, RobotStatus } from "@/types/robot";

const Robots: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [robots, setRobots] = useState<RobotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeRobotId, setActiveRobotId] = useState<string | null>(null);

  const loadRobots = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await robotService.list();
      setRobots(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load the robot fleet."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRobots();
  }, []);

  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      setMessage(state.toast);
      const timer = window.setTimeout(() => setMessage(""), 2500);
      navigate(location.pathname, { replace: true, state: null });
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [location.pathname, location.state, navigate]);

  const onlineCount = useMemo(
    () => robots.filter((robot) => robot.status === "online").length,
    [robots],
  );

  const maintenanceCount = useMemo(
    () => robots.filter((robot) => robot.status === "maintenance").length,
    [robots],
  );

  const handleStatusChange = async (robot: RobotRecord, status: RobotStatus) => {
    setActiveRobotId(robot.id);
    setError("");

    try {
      const updatedRobot = await robotService.update(robot.id, { status });
      setRobots((previous) => previous.map((item) => (item.id === robot.id ? updatedRobot : item)));
      logService.record({
        category: "robot",
        severity: status === "offline" ? "warning" : "success",
        actor: "Admin",
        title: "Robot status updated",
        description: `${robot.name} was switched to ${status}.`,
      });
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, "Unable to update the robot status."));
    } finally {
      setActiveRobotId(null);
    }
  };

  const handleDelete = async (robot: RobotRecord) => {
    setActiveRobotId(robot.id);
    setError("");

    try {
      await robotService.remove(robot.id);
      setRobots((previous) => previous.filter((item) => item.id !== robot.id));
      logService.record({
        category: "robot",
        severity: "warning",
        actor: "Admin",
        title: "Robot removed from fleet",
        description: `${robot.name} (${robot.robotId}) was removed from the administration console.`,
      });
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Unable to remove this robot right now."));
    } finally {
      setActiveRobotId(null);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Robot Fleet</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Supervise fleet availability, update robot status, and jump directly into the robot
                control interface when a live session is needed.
              </p>
            </div>

            <Link to="/robots/add">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Robot
              </Button>
            </Link>
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

        <section className="grid gap-4 md:grid-cols-3">
          <div className="card-elevated p-5">
            <p className="text-sm font-medium text-muted-foreground">Fleet Size</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{loading ? "..." : robots.length}</p>
            <p className="mt-2 text-sm text-muted-foreground">Telepresence units registered in the platform.</p>
          </div>

          <div className="card-elevated p-5">
            <p className="text-sm font-medium text-muted-foreground">Online Robots</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{loading ? "..." : onlineCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Ready to host visitors and remote operators.</p>
          </div>

          <div className="card-elevated p-5">
            <p className="text-sm font-medium text-muted-foreground">Maintenance Queue</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{loading ? "..." : maintenanceCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Robots that need operator attention before reuse.</p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {loading ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">Loading robots...</div>
          ) : robots.length === 0 ? (
            <div className="card-elevated p-8 text-sm text-muted-foreground">
              No robots are registered yet. Add one to start fleet supervision.
            </div>
          ) : (
            robots.map((robot) => {
              const telemetry = deriveRobotTelemetry(robot);

              return (
                <div key={robot.id} className="card-elevated p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-950 p-3 text-white">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">{robot.name}</h2>
                          <p className="text-sm text-muted-foreground">Robot ID: {robot.robotId}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <RobotStatusBadge status={robot.status} />
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          Battery {telemetry.batteryLevel}%
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {telemetry.networkQuality}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p>
                          Coordinates: {robot.latitude.toFixed(3)}, {robot.longitude.toFixed(3)}
                        </p>
                        <p>Last synced: {formatDateTime(robot.updatedAt || robot.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 lg:w-52">
                      <Select
                        value={robot.status}
                        onValueChange={(value) => void handleStatusChange(robot, value as RobotStatus)}
                        disabled={activeRobotId === robot.id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate("/robot-control", { state: { robotId: robot.id } })}
                      >
                        <Wrench className="h-4 w-4" />
                        Open Control
                      </Button>

                      <Button
                        variant="ghost"
                        className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        disabled={activeRobotId === robot.id}
                        onClick={() => void handleDelete(robot)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </AppLayout>
  );
};

export default Robots;
