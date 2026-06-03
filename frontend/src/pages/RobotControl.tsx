// ==============================
// IMPORTS
// ==============================
import { MonitorPlay, RotateCcw, User, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ControlPad } from "@/components/robot/ControlPad";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "@/components/communication/ChatPanel";
import type { RobotCommand } from "@/types/robot";
import type { VisitorRequest } from "@/types/request";
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




const ignoredRequestDetailPatterns = [
  /guided intake/i,
  /technologies/i,
  /project process/i,
  /admin handoff/i,
  /request details/i,
  /smart request/i,
  /admin notified/i,
  /these fields follow/i,
  /full chat transcript/i,
  /contact admin/i,
  /request sent/i,
  /click/i,
  /system/i,
];

function getVisitorRequestDetails(visitor?: VisitorRequest) {
  if (!visitor) {
    return "";
  }

  const lines = visitor.message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !ignoredRequestDetailPatterns.some((pattern) => pattern.test(line)));

  const visitorLines = lines
    .map((line) => {
      const speakerMatch = line.match(/^(visitor|user|guest)\s*[:\-]\s*(.*)$/i);
      if (speakerMatch) {
        return speakerMatch[2].trim();
      }

      if (/^(bot|chatbot|assistant|agent)\s*[:\-]/i.test(line)) {
        return "";
      }

      return line;
    })
    .filter(Boolean);

  return visitorLines.join("\n") || visitor.message.trim();
}

// ==============================
// COMPONENT
// ==============================
const RobotControl: React.FC = () => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const location = useLocation();
  const visitor = (location.state as { visitor?: VisitorRequest })?.visitor;
  const visitorRequestDetails = getVisitorRequestDetails(visitor);

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
  const [viewerState, setViewerState] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [error, setError] = useState("");
  const [robotPosition, setRobotPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Chat State
  const [messages, setMessages] = useState<any[]>([
    {
      id: "welcome",
      sender: "system",
      message: visitor
        ? `Session started with ${visitor.firstName} ${visitor.lastName}`
        : "Robot Control Ready",
      timestamp: new Date().toISOString(),
    },
  ]);

  // ==========================
  // VIDEO STREAM
  // ==========================
  useEffect(() => {

  if (videoRef.current && remoteStream) {

    videoRef.current.srcObject = remoteStream;

    // ✅ force autoplay audio
    videoRef.current
      .play()
      .then(() => {
        console.log("🔊 AUDIO PLAYING");
      })
      .catch((err) => {
        console.log("AUTOPLAY ERROR:", err);
      });
  }

}, [remoteStream]);
  // ==========================
  // REAL-TIME CHAT
  // ==========================
  const handleSendMessage = (text: string) => {
    if (!socketRef.current || !text.trim()) return;

    const messageData = {
      id: Date.now().toString(),
      sender: "operator",
      message: text.trim(),
      timestamp: new Date().toISOString(),
      roomId: ROOM_ID,
    };

    socketRef.current.emit("chat-message", messageData);
    setMessages(prev => [...prev, messageData]);
  };

  // Listen for messages from Robot
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleChatMessage = (data: any) => {
      console.log("📨 Chat from Robot:", data);
      setMessages(prev => [...prev, {
        id: data.id || Date.now().toString(),
        sender: "visitor",
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
      }]);
    };

    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, []);

  // ==========================
  // STOP VIEWER
  // ==========================
  const stopViewer = () => {
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
    setViewerState("connecting");
    setError("");
    localStreamRef.current =
  await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

console.log(
  "🎤 ADMIN AUDIO:",
  localStreamRef.current.getAudioTracks()
);


    try {
      const socket = io(SOCKET_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;
      localStreamRef.current
  ?.getTracks()
  .forEach((track) => {

    console.log("🎤 SENDING:", track.kind);

    pc.addTrack(
      track,
      localStreamRef.current!
    );
  });





      pc.onconnectionstatechange = () => {
        console.log("🟡 PC state:", pc.connectionState);
        if (pc.connectionState === "connected") setViewerState("live");
      };

     pc.ontrack = (event) => {

  console.log("🎥 STREAM REÇU");

  const stream =
    event.streams[0];

  console.log(
    "🎤 AUDIO TRACKS:",
    stream.getAudioTracks()
  );

  console.log(
    "📷 VIDEO TRACKS:",
    stream.getVideoTracks()
  );

  setRemoteStream(stream);

  setViewerState("live");
};

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "sendrecv" });

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("candidate", { roomId: ROOM_ID, candidate: event.candidate });
        }
      };

      socket.on("connect", async () => {
        console.log("✅ Socket connecté:", socket.id);
        socket.emit("join-room", ROOM_ID);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId: ROOM_ID, offer: pc.localDescription });
      });

      socket.on("answer", async (answer) => {
        console.log("📩 Answer reçu");
        await pc.setRemoteDescription(answer);
      });

      socket.on("candidate", async (candidate) => {
  try {

    if (!candidate) return;

    console.log("ICE RECEIVED:", candidate);

    await pc.addIceCandidate(
      new RTCIceCandidate(candidate)
    );

  } catch (err) {
    console.error("ICE error:", err);
  }
});

      socket.on("position", (data) => {
        setRobotPosition({ lat: data.lat, lng: data.lng });
      });

    } catch (err) {
      console.error(err);
      setError("Failed to connect to robot");
      setViewerState("error");
    }
  };

  // Command Handler (Fixed)
  const handleCommand = (command: RobotCommand) => {
    console.log("🎮 Command sent to Robot:", command);
    if (socketRef.current) {
      socketRef.current.emit("command", { roomId: ROOM_ID, command });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <section className="card-elevated p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold">Robot Control Center</h1>
              {visitor && (
                <p className="text-muted-foreground mt-1">
                  Visitor: <strong>{visitor.firstName} {visitor.lastName}</strong>
                </p>
              )}
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              viewerState === "live" ? "bg-green-600 text-white" :
              viewerState === "connecting" ? "bg-yellow-500" : "bg-gray-500"
            }`}>
              {viewerState.toUpperCase()}
            </span>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* VIDEO + CONTROLS */}
          <div className="lg:col-span-8 space-y-6">
            <section className="card-elevated">
              {!remoteStream && (
                <div className="h-[480px] flex items-center justify-center text-gray-400 bg-black rounded-xl">
                  Click "Start Call" to begin session
                </div>
              )}
             <video
  ref={videoRef}
  autoPlay
  playsInline
  controls
  muted={false}
  className={`w-full rounded-xl ${
    remoteStream ? "block" : "hidden"
  }`}
  onLoadedMetadata={() => {

    if (videoRef.current) {

      videoRef.current.volume = 1;

      videoRef.current.muted = false;

      videoRef.current
        .play()
        .then(() => {

          console.log(
            "🔊 ADMIN AUDIO PLAYING"
          );

        })
        .catch((err) => {

          console.error(
            "AUTOPLAY ERROR:",
            err
          );
        });
    }
  }}
/>
              <div className="p-4 flex gap-3">
                <Button onClick={startViewer} disabled={viewerState !== "idle"}>
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Start Call
                </Button>
                <Button onClick={stopViewer} variant="outline" disabled={viewerState === "idle"}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            </section>
            <ControlPad onCommand={handleCommand} disabled={!remoteStream} />
          </div>

          {/* SIDE PANEL */}
          <div className="lg:col-span-4 space-y-6">
            {/* VISITOR INFO */}
            {visitor && (
              <section className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="font-semibold">Request Information</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-2xl border border-border/70 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visitor</p>
                    <p className="mt-1 font-medium text-foreground">
                      {visitor.firstName} {visitor.lastName}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                      <p className="mt-1 break-words text-foreground">{visitor.email}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                      <p className="mt-1 text-foreground">{visitor.phone}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Visitor request
                    </p>
                    <p className="mt-2 whitespace-pre-line leading-6 text-foreground">
                      {visitorRequestDetails || "No request details supplied."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* LIVE CHAT */}
            <section className="card-elevated p-6 flex flex-col" style={{ height: "520px" }}>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold">Live Chat</h2>
              </div>
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
              />
            </section>
          </div>
        </div>

        {/* MAP */}
        <section className="card-elevated p-6">
          <h2 className="text-xl mb-4">Robot Position</h2>
          {!robotPosition ? (
            <div className="h-80 flex items-center justify-center text-gray-400 border rounded-xl">
              Robot position will appear when connected
            </div>
          ) : (
            <MapContainer
              center={[robotPosition.lat, robotPosition.lng]}
              zoom={15}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[robotPosition.lat, robotPosition.lng]}>
                <Popup>Robot Location 📍</Popup>
              </Marker>
            </MapContainer>
          )}
        </section>

        {/* ================= MAP SECTION ================= */}
<div className="mt-16 space-y-6 text-center">

  <div>
    <h3 className="text-2xl font-bold">
      Our Location
    </h3>

    <p className="text-gray-500 mt-2">
      Novation City, Sousse — Tunisia
    </p>
  </div>

  <div className="rounded-2xl overflow-hidden shadow-2xl border">

    <iframe
      title="Enova Robotics Location"
      src="https://www.google.com/maps?q=Novation+City+Sousse+Tunisia&output=embed"
      width="100%"
      height="350"
      style={{ border: 0 }}
      loading="lazy"
    ></iframe>

  </div>

  <a
    href="https://www.google.com/maps?q=Novation+City+Sousse+Tunisia"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block text-blue-600 font-semibold hover:underline"
  >
    Open in Google Maps →
  </a>

</div>
      </div>
    </AppLayout>
  );
};


export default RobotControl;
