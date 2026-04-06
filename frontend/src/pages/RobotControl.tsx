import { MonitorPlay, Radio, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPad } from "@/components/robot/ControlPad";
import { Button } from "@/components/ui/button";
import { logService } from "@/services/api";
import {
  startRobotViewer,
  stopMediaStream,
  type RobotViewerSession,
} from "@/services/webrtc";
import type { RobotCommand } from "@/types/robot";

const RobotControl: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const viewerSessionRef = useRef<RobotViewerSession | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [viewerState, setViewerState] = useState("idle");
  const [error, setError] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    return () => {
      viewerSessionRef.current?.stop();
      stopMediaStream(remoteStream);
    };
  }, [remoteStream]);

  const startViewer = async () => {
    setViewerState("connecting");
    setError("");

    try {
      viewerSessionRef.current?.stop();
      setRemoteStream(null);

      viewerSessionRef.current = await startRobotViewer({
        onRemoteStream: (stream) => {
          setRemoteStream(stream);
          setViewerState("live");
        },
        onStateChange: (stateLabel) => {
          setViewerState(stateLabel);
        },
      });

      logService.record({
        category: "robot",
        severity: "success",
        actor: "Operator",
        title: "Direct robot viewer started",
        description: "The operator opened the direct live feed to the robot.",
      });
    } catch (viewerError) {
      setViewerState("error");
      setError(viewerError instanceof Error ? viewerError.message : "Unable to open the robot viewer.");
    }
  };

  const stopViewer = () => {
    viewerSessionRef.current?.stop();
    viewerSessionRef.current = null;
    stopMediaStream(remoteStream);
    setRemoteStream(null);
    setViewerState("idle");
  };

  const handleCommand = (command: RobotCommand) => {
    const timestamp = new Date().toLocaleTimeString();
    viewerSessionRef.current?.sendCommand(command);

    setCommandHistory((previous) => [`${timestamp} - ${command}`, ...previous].slice(0, 8));

    if (command !== "stop") {
      logService.record({
        category: "robot",
        severity: "info",
        actor: "Operator",
        title: "Robot movement command sent",
        description: `The live robot received the "${command}" command.`,
      });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="card-elevated p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Direct Robot Viewer</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                This screen connects straight to the robot. There is no room code and no robot ID step in the
                live viewer path anymore.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
              Viewer {viewerState}
            </span>
          </div>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="card-elevated overflow-hidden">
            <div className="border-b border-border/70 px-6 py-4">
              <h2 className="text-xl font-semibold text-foreground">Live Feed</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start the viewer after the robot connection page is open. The stream appears here as soon as the
                robot answers.
              </p>
            </div>

            <div className="bg-slate-950">
              {remoteStream ? null : (
                <div className="flex min-h-[360px] items-center justify-center px-6 text-center text-sm text-slate-300">
                  Open the robot connection page first, then click Start Viewer here.
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`h-[360px] w-full object-cover ${remoteStream ? "block" : "hidden"}`}
              />
            </div>

            <div className="flex flex-wrap gap-3 border-t border-border/70 px-6 py-4">
              <Button className="gap-2" onClick={() => void startViewer()}>
                <MonitorPlay className="h-4 w-4" />
                Start Viewer
              </Button>
              <Button variant="outline" className="gap-2" onClick={stopViewer}>
                <RotateCcw className="h-4 w-4" />
                Stop Viewer
              </Button>
              <Button variant="outline" className="gap-2" disabled>
                <Radio className="h-4 w-4" />
                State {viewerState}
              </Button>
            </div>
          </div>

          <div className="card-elevated p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Connection Notes</h2>
              <p className="text-sm text-muted-foreground">
                The direct path is now simple: robot opens its connection page first, then the admin starts the
                viewer.
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3">
                1. Open the robot page.
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3">
                2. Wait for the robot to report that it is connected.
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3">
                3. Click Start Viewer here to connect directly.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <ControlPad onCommand={handleCommand} disabled={!viewerSessionRef.current} />

          <div className="card-elevated p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Command History</h2>
              <p className="text-sm text-muted-foreground">
                Review the most recent movement instructions sent to the live robot connection.
              </p>
            </div>

            <div className="space-y-3">
              {commandHistory.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No commands sent yet. Start the viewer and use the control pad.
                </div>
              ) : (
                commandHistory.map((entry) => (
                  <div key={entry} className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3 text-sm text-foreground">
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default RobotControl;
