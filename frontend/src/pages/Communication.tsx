import { Mic, MicOff, Phone, PhoneCall, Video, VideoOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChatPanel } from "@/components/communication/ChatPanel";
import { CallViewport } from "@/components/communication/CallViewport";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/useSocket";
import { createId } from "@/lib/utils";
import { getApiErrorMessage, logService } from "@/services/api";
import { startLocalPreview, stopMediaStream } from "@/services/webrtc";
import type { CallMode, CallState, ChatMessage } from "@/types/communication";
import type { VisitorRequest } from "@/types/request";

import { useRobotCall } from "@/hooks/useRobotCall";

interface CommunicationLocationState {
  visitor?: VisitorRequest;
  mode?: CallMode;
}

const initialMessages: ChatMessage[] = [
  {
    id: createId("chat"),
    sender: "system",
    message: "Communication workspace ready. Start an audio or video session when the visitor is available.",
    timestamp: new Date().toISOString(),
  },
];

const Communication: React.FC = () => {
  const location = useLocation();
  const { status } = useSocket();
  const state = (location.state as CommunicationLocationState | null) || null;

  const [callMode, setCallMode] = useState<CallMode>(state?.mode || "video");
  const [callState, setCallState] = useState<CallState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [localMuted, setLocalMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(callMode === "video");
  const [error, setError] = useState("");

  // === REAL ROBOT CALL INTEGRATION ===
  const { remoteStream, callState: robotCallState, error: robotError, startCall, endCall } = useRobotCall();

  const visitorLabel = useMemo(() => {
    if (!state?.visitor) return "Visitor not connected";
    return `${state.visitor.firstName} ${state.visitor.lastName}`;
  }, [state?.visitor]);

  useEffect(() => {
    return () => {
      stopMediaStream(localStream);
    };
  }, [localStream]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((previous) => [...previous, message]);
  };

  // Updated startSession - Now starts real call to robot
  const startSession = async (mode: CallMode) => {
    setCallMode(mode);
    setVideoEnabled(mode === "video");
    setError("");
    setCallState("connecting");

    try {
      // Start real WebRTC call to robot
      await startCall();

      // Optional: local preview for operator
      const stream = await startLocalPreview({ audio: true, video: mode === "video" });
      setLocalStream(stream);

      setCallState("live");

      appendMessage({
        id: createId("chat"),
        sender: "system",
        message: `Real ${mode === "video" ? "Video" : "Audio"} session started with robot for ${visitorLabel}.`,
        timestamp: new Date().toISOString(),
      });

      logService.record({
        category: "communication",
        severity: "success",
        actor: "Operator",
        title: `Real ${mode} call started`,
        description: `Communication session opened for ${visitorLabel}.`,
      });
    } catch (sessionError) {
      setCallState("error");
      setError(getApiErrorMessage(sessionError, "Failed to start call with robot."));
    }
  };

  const endSession = () => {
    endCall();                    // Real robot call end
    stopMediaStream(localStream);
    setLocalStream(null);
    setCallState("ended");
    setLocalMuted(false);
    setVideoEnabled(false);

    appendMessage({
      id: createId("chat"),
      sender: "system",
      message: "Communication session closed by the operator.",
      timestamp: new Date().toISOString(),
    });

    logService.record({
      category: "communication",
      severity: "info",
      actor: "Operator",
      title: "Communication session ended",
      description: `The active session for ${visitorLabel} was closed.`,
    });
  };

  const toggleMute = () => {
    const nextMuted = !localMuted;
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setLocalMuted(nextMuted);
  };

  const toggleVideo = () => {
    const nextEnabled = !videoEnabled;
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = nextEnabled;
    });
    setVideoEnabled(nextEnabled);
  };

  const handleSendMessage = (message: string) => {
    appendMessage({
      id: createId("chat"),
      sender: "operator",
      message,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="card-elevated p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Communication Center</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Run audio and video support sessions, manage chat context, and keep the telepresence
                experience smooth from one operator workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Socket status</p>
              <p className="mt-1 capitalize">{status}</p>
            </div>
          </div>
        </section>

        {(error || robotError) && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error || robotError}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <CallViewport
            localStream={localStream}
            remoteStream={remoteStream}           // ← Now shows robot camera
            callMode={callMode}
            localMuted={localMuted}
            videoEnabled={videoEnabled}
            remoteLabel={visitorLabel}
          />
          <div className="card-elevated space-y-5 p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Session Controls</h2>
              <p className="text-sm text-muted-foreground">
                {state?.visitor
                  ? `Connected workflow for ${visitorLabel}.`
                  : "Open a session first, then coordinate the visitor experience."}
              </p>
            </div>
            <div className="grid gap-3">
              <Button className="gap-2" onClick={() => void startSession("video")}>
                <Video className="h-4 w-4" />
                Start Video Call (Robot)
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => void startSession("audio")}>
                <PhoneCall className="h-4 w-4" />
                Start Audio Call (Robot)
              </Button>
              <Button variant="outline" className="gap-2" onClick={toggleMute} disabled={!localStream}>
                {localMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {localMuted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={toggleVideo}
                disabled={!localStream || callMode !== "video"}
              >
                {videoEnabled ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {videoEnabled ? "Disable Camera" : "Enable Camera"}
              </Button>
              <Button variant="destructive" className="gap-2" onClick={endSession} disabled={callState !== "live"}>
                <Phone className="h-4 w-4" />
                End Session
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground">Visitor Context</h2>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="font-medium text-foreground">Participant</p>
                <p className="mt-1">{visitorLabel}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="font-medium text-foreground">Session mode</p>
                <p className="mt-1 capitalize">{callMode}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-slate-50 p-4">
                <p className="font-medium text-foreground">Visit note</p>
                <p className="mt-1">{state?.visitor?.message || "No visitor request attached to this call."}</p>
              </div>
            </div>
          </div>
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
        </section>
      </div>
    </AppLayout>
  );
};

export default Communication;