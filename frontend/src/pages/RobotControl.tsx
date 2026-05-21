// ==============================
// IMPORTS
// ==============================
import { MonitorPlay, Radio, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPad } from "@/components/robot/ControlPad";
import { Button } from "@/components/ui/button";

import type { RobotCommand } from "@/types/robot";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";


// ==============================
// CONFIG
// ==============================
const SOCKET_URL = "http://10.68.33.180:5001";
const ROOM_ID = "robot-1";


// ==============================
// COMPONENT
// ==============================
const RobotControl: React.FC = () => {
  
  // ==========================
  // REFS
  // ==========================
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // ==========================
  // STATE
  // ==========================
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [viewerState, setViewerState] = useState("idle");
  const [error, setError] = useState("");
  const [robotPosition, setRobotPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);


  // ==========================
  // VIDEO STREAM
  // ==========================
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


  // ==========================
  // STOP VIEWER
  // ==========================
  const stopViewer = () => {
    console.log("🛑 stop viewer");

    pcRef.current?.close();
    socketRef.current?.disconnect();

    pcRef.current = null;
    socketRef.current = null;

    setRemoteStream(null);
    setViewerState("idle");
  };


  // ==========================
  // START VIEWER
  // ==========================
  const startViewer = async () => {
    if (viewerState !== "idle") return;

    stopViewer();

    console.log("🚀 start viewer");

    setViewerState("connecting");
    setError("");

    try {
      // SOCKET
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
      });

      socketRef.current = socket;

      // WEBRTC
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pcRef.current = pc;

      // ======================
      // CONNECTION STATE
      // ======================
      pc.onconnectionstatechange = () => {
        console.log("🟡 PC state:", pc.connectionState);
        if (pc.connectionState === "connected") {
          setViewerState("live");
        }
      };

      // ======================
      // STREAM
      // ======================
      pc.ontrack = (event) => {
        console.log("🎥 STREAM REÇU");
        setRemoteStream(event.streams[0]);
        setViewerState("live");
      };

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      // ======================
      // ICE
      // ======================
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", {
            roomId: ROOM_ID,
            candidate: event.candidate,
          });
        }
      };

      // ======================
      // SOCKET CONNECT
      // ======================
      socket.on("connect", async () => {
        console.log("✅ Socket connecté:", socket.id);

        socket.emit("join-room", ROOM_ID);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          roomId: ROOM_ID,
          offer: pc.localDescription,
        });
      });

      // ======================
      // ANSWER
      // ======================
      socket.on("answer", async (answer) => {
        console.log("📩 Answer reçu");
        await pc.setRemoteDescription(answer);
      });

      // ======================
      // ICE RECEIVED
      // ======================
      socket.on("candidate", async (candidate) => {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error("ICE error:", err);
        }
      });

      // ======================
      // 📍 POSITION ROBOT
      // ======================
      socket.on("position", (data) => {
        console.log("📍 Position reçue:", data);

        setRobotPosition({
          lat: data.lat,
          lng: data.lng,
        });
      });

      // ======================
      // ERROR
      // ======================
      socket.on("connect_error", (err) => {
        console.error("❌ Socket error:", err.message);
        setError(err.message);
        setViewerState("error");
      });

      // ======================
      // TIMEOUT
      // ======================
      setTimeout(() => {
        if (pc.connectionState !== "connected") {
          console.log("⛔ Timeout");
          setError("Robot non connecté");
          setViewerState("error");
          stopViewer();
        }
      }, 15000);

    } catch (err) {
      console.error(err);
      setError("Erreur inconnue");
      setViewerState("error");
    }
  };


  // ==========================
  // COMMANDS
  // ==========================
  const handleCommand = (command: RobotCommand) => {
    console.log("🎮 Command:", command);

    if (!socketRef.current) return;

    socketRef.current.emit("command", {
      roomId: ROOM_ID,
      command,
    });
  };


  // ==========================
  // UI
  // ==========================
  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <section className="card-elevated p-6">
          <h1 className="text-2xl">Robot Viewer</h1>
          <p>Status: {viewerState}</p>
        </section>

        {/* ERROR */}
        {error && (
          <div className="bg-red-100 text-red-600 p-3">
            {error}
          </div>
        )}

        {/* VIDEO */}
        <section className="card-elevated">
          {!remoteStream && (
            <div className="h-[360px] flex items-center justify-center text-gray-400">
              Waiting robot connection...
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-[360px] w-full ${
              remoteStream ? "block" : "hidden"
            }`}
          />

          <div className="p-4 flex gap-3">
            <Button onClick={startViewer}>
              <MonitorPlay className="w-4 h-4 mr-1" />
              Start
            </Button>

            <Button onClick={stopViewer}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Stop
            </Button>

            <Button disabled>
              <Radio className="w-4 h-4 mr-1" />
              {viewerState}
            </Button>
          </div>
        </section>

        {/* CONTROL */}
        <ControlPad onCommand={handleCommand} disabled={!remoteStream} />

        {/* MAP */}
        <section className="card-elevated p-6">
          <h2 className="text-xl mb-2">Robot Position</h2>

          {!robotPosition ? (
            <div className="text-gray-400">
              Position indisponible...
            </div>
          ) : (
            <MapContainer
              center={[robotPosition.lat, robotPosition.lng]}
              zoom={15}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {/* MARKER */}
              <Marker position={[robotPosition.lat, robotPosition.lng]}>
                <Popup>Robot ici 📍</Popup>
              </Marker>

              {/* CERCLE */}
              <Circle
                center={[robotPosition.lat, robotPosition.lng]}
                radius={500}
                pathOptions={{
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.2,
                }}
              />
            </MapContainer>
          )}
        </section>

      </div>
    </AppLayout>
  );
};

export default RobotControl;