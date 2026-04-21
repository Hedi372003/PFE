import { MonitorPlay, Radio, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPad } from "@/components/robot/ControlPad";
import { Button } from "@/components/ui/button";

import type { RobotCommand } from "@/types/robot";

const SOCKET_URL = "https://circulate-crested-unmoved.ngrok-free.dev";
const ROOM_ID = "robot-1";

const RobotControl: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [viewerState, setViewerState] = useState("idle");
  const [error, setError] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  // attach video
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ================= STOP =================
  const stopViewer = () => {
    console.log("🛑 stop viewer");

    pcRef.current?.close();
    socketRef.current?.disconnect();

    pcRef.current = null;
    socketRef.current = null;

    setRemoteStream(null);
    setViewerState("idle");
  };

  // ================= START =================
  const startViewer = async () => {
    if (viewerState !== "idle") return;

    stopViewer();

    console.log("🚀 start viewer");

    setViewerState("connecting");
    setError("");

    try {
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: false // 🔥 important
      });

      socketRef.current = socket;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject"
          }
        ]
      });

      pcRef.current = pc;

      // 🔥 IMPORTANT (sinon pas de stream)
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      // 🎥 recevoir stream
      pc.ontrack = (e) => {
        console.log("🎥 STREAM REÇU !");
        setRemoteStream(e.streams[0]);
        setViewerState("live");
      };

      // ICE SEND
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("candidate", {
            roomId: ROOM_ID,
            candidate: e.candidate
          });
        }
      };

      // CONNECT
      socket.on("connect", async () => {
        console.log("✅ socket connecté");

        socket.emit("join-room", ROOM_ID);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          roomId: ROOM_ID,
          offer
        });

        console.log("📡 OFFER envoyée");
      });

      // ANSWER
      socket.once("answer", async (answer: any) => {
        console.log("📩 ANSWER reçu");

        if (!pc.currentRemoteDescription) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        }
      });

      // ICE RECEIVE (corrigé)
      socket.on("candidate", async (candidate: any) => {
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } else {
            console.log("⏳ ICE ignoré (pas encore prêt)");
          }
        } catch (err) {
          console.error("ICE error", err);
        }
      });

    } catch (err: any) {
      console.error(err);
      setViewerState("error");
      setError(err.message);
    }
  };

  // ================= COMMAND =================
  const handleCommand = (command: RobotCommand) => {
    const timestamp = new Date().toLocaleTimeString();

    setCommandHistory((prev) =>
      [`${timestamp} - ${command}`, ...prev].slice(0, 8)
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <section className="card-elevated p-6">
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Robot Viewer</h1>
              <p className="text-sm text-muted-foreground">
                Live camera from robot via WebRTC
              </p>
            </div>

            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs">
              {viewerState}
            </span>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        {/* VIDEO */}
        <section className="card-elevated overflow-hidden">
          <div className="bg-slate-950">
            {!remoteStream && (
              <div className="h-[360px] flex items-center justify-center text-gray-400">
                Waiting robot connection...
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`h-[360px] w-full object-cover ${
                remoteStream ? "block" : "hidden"
              }`}
            />
          </div>

          <div className="flex gap-3 p-4">
            <Button onClick={startViewer}>
              <MonitorPlay className="w-4 h-4" /> Start
            </Button>

            <Button variant="outline" onClick={stopViewer}>
              <RotateCcw className="w-4 h-4" /> Stop
            </Button>

            <Button variant="outline" disabled>
              <Radio className="w-4 h-4" /> {viewerState}
            </Button>
          </div>
        </section>

        {/* CONTROL */}
        <section className="grid grid-cols-2 gap-6">
          <ControlPad onCommand={handleCommand} disabled={!remoteStream} />

          <div className="card-elevated p-4">
            <h2 className="font-semibold mb-3">Command History</h2>

            {commandHistory.length === 0 ? (
              <p className="text-sm text-gray-400">No commands yet</p>
            ) : (
              commandHistory.map((c) => (
                <div key={c} className="text-sm bg-gray-100 p-2 rounded mb-2">
                  {c}
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </AppLayout>
  );
};

export default RobotControl;