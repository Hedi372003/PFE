import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://10.68.33.180:5001"; // ← Make sure this matches your socket server
const ROOM_ID = "robot-1";

export const useRobotCall = () => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<"idle" | "connecting" | "live" | "ended" | "error">("idle");
  const [error, setError] = useState<string>("");

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const startCall = async () => {
    if (callState !== "idle") return;

    setCallState("connecting");
    setError("");

    try {
      // 1. Connect to Socket.IO
      const socket = io(SOCKET_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      // 2. Create Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // Receive video/audio from robot
      pc.ontrack = (event) => {
        console.log("🎥 Remote stream from robot received");
        setRemoteStream(event.streams[0]);
        setCallState("live");
      };

      pc.onconnectionstatechange = () => {
        console.log("🔄 Connection state:", pc.connectionState);
        if (pc.connectionState === "connected") setCallState("live");
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setCallState("error");
        }
      };

      // Send ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("candidate", {
            roomId: ROOM_ID,
            candidate: event.candidate,
          });
        }
      };

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      // Socket events
      socket.on("connect", async () => {
        console.log("✅ Socket connected to robot room");
        socket.emit("join-room", ROOM_ID);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("offer", {
          roomId: ROOM_ID,
          offer: pc.localDescription,
        });
      });

      socket.on("answer", async (answer) => {
        console.log("📩 Answer received from robot");
        await pc.setRemoteDescription(answer);
      });

      socket.on("candidate", async (data) => {
        if (data?.candidate && pc) {
          await pc.addIceCandidate(data.candidate);
        }
      });

    } catch (err: any) {
      console.error("Start call error:", err);
      setError(err.message || "Failed to start call");
      setCallState("error");
    }
  };

  const endCall = () => {
    if (pcRef.current) pcRef.current.close();
    if (socketRef.current) socketRef.current.disconnect();

    setRemoteStream(null);
    setCallState("ended");
    pcRef.current = null;
    socketRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => endCall();
  }, []);

  return {
    remoteStream,
    callState,
    error,
    startCall,
    endCall,
  };
};