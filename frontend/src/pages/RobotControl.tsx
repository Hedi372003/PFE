import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wifi } from "lucide-react";

const RobotControl: React.FC = () => {

  const [videoOn, setVideoOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  /* SEND ROBOT COMMAND */

  const sendCommand = (command: string) => {

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {

      socketRef.current.send(
        JSON.stringify({
          type: "command",
          command: command
        })
      );

      console.log("Command sent:", command);

    }

  };

  /* START VIDEO */

  const startVideo = async () => {

    console.log("Starting WebRTC connection...");

    /* CLOSE OLD CONNECTION */

    if (socketRef.current) socketRef.current.close();
    if (pcRef.current) pcRef.current.close();

    /* CREATE SOCKET */

    const socket = new WebSocket("ws://localhost:5002");
    socketRef.current = socket;

    /* CREATE PEER */

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    pcRef.current = pc;

    /* RECEIVE VIDEO */

    pc.ontrack = (event) => {

      console.log("TRACK RECEIVED", event);

      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }

    };

    /* ICE */

    pc.onicecandidate = (event) => {

      if (event.candidate && socket.readyState === WebSocket.OPEN) {

        socket.send(
          JSON.stringify({
            type: "candidate",
            candidate: event.candidate
          })
        );

      }

    };

    /* SOCKET OPEN */

    socket.onopen = async () => {

      console.log("Operator connected");

      socket.send(JSON.stringify({
        type: "operator"
      }));

      /* IMPORTANT FOR RECEIVING VIDEO */

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      const offer = await pc.createOffer();

      await pc.setLocalDescription(offer);

      socket.send(JSON.stringify({
        type: "offer",
        offer: offer
      }));

    };

    /* RECEIVE SIGNALS */

    socket.onmessage = async (event) => {

      const data = JSON.parse(event.data);

      console.log("Signal message:", data.type);

      if (data.type === "answer") {

        await pc.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

      }

      if (data.type === "candidate") {

        try {

          await pc.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );

        } catch (err) {

          console.error("ICE error:", err);

        }

      }

    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    setVideoOn(true);

  };

  return (

    <AppLayout>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Robot Control
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Operate the telepresence robot in real time.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* VIDEO PANEL */}

          <div className="md:col-span-2 bg-white border rounded-lg shadow-sm flex flex-col">

            {/* STATUS */}

            <div className="flex justify-end p-4">

              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Wifi size={14}/>
                Connected
              </div>

            </div>

            {/* VIDEO */}

            <div className="h-72 flex items-center justify-center bg-black">

              {!videoOn && (
                <span className="text-gray-400">
                  Video stream is offline
                </span>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />

            </div>

            {/* BUTTONS */}

            <div className="border-t p-4 flex gap-3">

              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white"
                onClick={startVideo}
              >
                Start Video
              </Button>

              <Button variant="outline">
                Unmute
              </Button>

            </div>

          </div>

          {/* DIRECTION */}

          <div className="bg-white border rounded-lg shadow-sm p-6 flex flex-col items-center">

            <h3 className="font-semibold text-slate-700 mb-6">
              Directional Controls
            </h3>

            <div className="grid grid-cols-3 gap-4">

              <div/>

              <Button
                className="bg-slate-900 text-white hover:bg-slate-800"
                onMouseDown={() => sendCommand("forward")}
                onMouseUp={() => sendCommand("stop")}
              >
                <ArrowUp size={18}/>
              </Button>

              <div/>

              <Button
                className="bg-slate-900 text-white hover:bg-slate-800"
                onMouseDown={() => sendCommand("left")}
                onMouseUp={() => sendCommand("stop")}
              >
                <ArrowLeft size={18}/>
              </Button>

              <Button
                variant="secondary"
                className="bg-gray-200 text-gray-600"
                onClick={() => sendCommand("stop")}
              >
                ●
              </Button>

              <Button
                className="bg-slate-900 text-white hover:bg-slate-800"
                onMouseDown={() => sendCommand("right")}
                onMouseUp={() => sendCommand("stop")}
              >
                <ArrowRight size={18}/>
              </Button>

              <div/>

              <Button
                className="bg-slate-900 text-white hover:bg-slate-800"
                onMouseDown={() => sendCommand("back")}
                onMouseUp={() => sendCommand("stop")}
              >
                <ArrowDown size={18}/>
              </Button>

              <div/>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>

  );

};

export default RobotControl;