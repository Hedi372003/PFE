import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Play } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

type Robot = {
  id: string;
  name: string;
  robotId: string;
  status: "online" | "offline" | "maintenance" | "busy" | string;
};

type RobotStatusResponse = {
  robot: Robot;
  telemetry: {
    robotStatus: string;
    batteryLevel: number;
    currentCommand: string;
    lastUpdate: string;
  };
};

type CommandResponse = {
  status: string;
  command: {
    name: string;
    parameters: {
      speed?: number;
      direction?: string;
    };
  };
  robot: Robot;
  telemetry: RobotStatusResponse["telemetry"];
  transport: string;
  topic: string;
};

type RobotCommand =
  | "start"
  | "stop"
  | "move_forward"
  | "move_backward"
  | "turn_left"
  | "turn_right";

const RobotControl: React.FC = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [selectedRobotId, setSelectedRobotId] = useState<string>("");
  const [statusData, setStatusData] = useState<RobotStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingCommand, setSendingCommand] = useState<RobotCommand | null>(null);
  const [error, setError] = useState("");
  const [requestMeta, setRequestMeta] = useState("");

  const selectedRobot = useMemo(
    () => robots.find((robot) => robot.id === selectedRobotId) || null,
    [robots, selectedRobotId],
  );

  const isOnline = (statusData?.telemetry.robotStatus || selectedRobot?.status || "").toLowerCase() === "online";

  const loadRobots = async () => {
    const { data } = await api.get<Robot[]>("/api/robots");
    setRobots(data);
    if (!selectedRobotId && data.length > 0) {
      const preferred = data.find((robot) => robot.status === "online") || data[0];
      setSelectedRobotId(preferred.id);
    }
  };

  const loadStatus = async (robotId: string) => {
    if (!robotId) return;
    const { data } = await api.get<RobotStatusResponse>(`/api/robots/${robotId}/status`);
    setStatusData(data);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      try {
        await loadRobots();
      } catch {
        setError("Failed to load robots.");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!selectedRobotId) return;

    let timer: number | undefined;
    const poll = async () => {
      try {
        await loadStatus(selectedRobotId);
      } catch {
        setError("Failed to fetch live robot status.");
      }
    };

    void poll();
    timer = window.setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [selectedRobotId]);

  const sendCommand = async (command: RobotCommand, parameters?: { speed?: number; direction?: string }) => {
    if (!selectedRobotId) return;

    setError("");
    setSendingCommand(command);

    try {
      const { data } = await api.post<CommandResponse>(`/api/robots/${selectedRobotId}/command`, {
        command,
        parameters: parameters || {},
      });

      setStatusData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          telemetry: data.telemetry,
          robot: data.robot,
        };
      });
      setRequestMeta(`Queued via ${data.transport} (${data.topic})`);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || "Command failed.");
    } finally {
      setSendingCommand(null);
    }
  };

  const renderControlButton = (
    label: string,
    command: RobotCommand,
    icon: JSX.Element,
    extra?: { speed?: number; direction?: string },
    variant: "default" | "secondary" | "outline" = "default",
  ) => (
    <Button
      type="button"
      variant={variant}
      disabled={!selectedRobotId || !isOnline || Boolean(sendingCommand)}
      onClick={() => void sendCommand(command, extra)}
      className="h-14 w-14 p-0"
    >
      {sendingCommand === command ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span className="sr-only">{label}</span>
    </Button>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Robot Control</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time teleoperation panel with structured command dispatch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {requestMeta && <p className="text-sm text-muted-foreground">{requestMeta}</p>}

        {loading ? (
          <p>Loading robot control...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="card-elevated p-6 space-y-4 lg:col-span-2">
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full sm:w-auto">
                  <label className="text-xs text-muted-foreground block mb-1">Select robot</label>
                  <select
                    value={selectedRobotId}
                    onChange={(e) => setSelectedRobotId(e.target.value)}
                    className="h-10 min-w-56 rounded-md border bg-background px-3 text-sm"
                  >
                    {robots.map((robot) => (
                      <option key={robot.id} value={robot.id}>
                        {robot.name} ({robot.robotId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={!selectedRobotId || !isOnline || Boolean(sendingCommand)}
                    onClick={() => void sendCommand("start")}
                    className="gap-2"
                  >
                    {sendingCommand === "start" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Start
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedRobotId || !isOnline || Boolean(sendingCommand)}
                    onClick={() => void sendCommand("stop")}
                    className="gap-2"
                  >
                    {sendingCommand === "stop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                    Stop
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div />
                  {renderControlButton("Move Forward", "move_forward", <ArrowUp className="h-5 w-5" />, { speed: 1, direction: "forward" })}
                  <div />

                  {renderControlButton("Turn Left", "turn_left", <ArrowLeft className="h-5 w-5" />, { speed: 1, direction: "left" })}
                  {renderControlButton("Stop", "stop", <Square className="h-4 w-4" />, undefined, "secondary")}
                  {renderControlButton("Turn Right", "turn_right", <ArrowRight className="h-5 w-5" />, { speed: 1, direction: "right" })}

                  <div />
                  {renderControlButton("Move Backward", "move_backward", <ArrowDown className="h-5 w-5" />, { speed: 1, direction: "backward" })}
                  <div />
                </div>
              </div>
            </section>

            <aside className="card-elevated p-6 space-y-4">
              <h3 className="font-semibold">Live Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Robot status</span>
                  <span className="font-medium">{statusData?.telemetry.robotStatus || selectedRobot?.status || "unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Battery</span>
                  <span className="font-medium">{Math.round(statusData?.telemetry.batteryLevel ?? 0)}%</span>
                </div>
                <div className="h-2 w-full rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.max(0, Math.min(100, statusData?.telemetry.batteryLevel ?? 0))}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current command</span>
                  <span className="font-medium">{statusData?.telemetry.currentCommand || "idle"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last update</span>
                  <span className="font-medium">
                    {statusData?.telemetry.lastUpdate
                      ? new Date(statusData.telemetry.lastUpdate).toLocaleTimeString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default RobotControl;
