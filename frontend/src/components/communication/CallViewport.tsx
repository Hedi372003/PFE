import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useRef } from "react";

import type { CallMode } from "@/types/communication";

interface CallViewportProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callMode: CallMode;
  localMuted: boolean;
  videoEnabled: boolean;
  remoteLabel: string;
}

function MediaTile({
  label,
  stream,
  muted,
  placeholder,
}: {
  label: string;
  stream: MediaStream | null;
  muted?: boolean;
  placeholder: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-slate-950">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          playsInline
          className="h-full min-h-[220px] w-full object-cover"
        />
      ) : (
        <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-sm text-slate-300">
          {placeholder}
        </div>
      )}

      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-black/50 px-3 py-2 text-xs text-white">
        <span>{label}</span>
      </div>
    </div>
  );
}

export function CallViewport({
  localStream,
  remoteStream,
  callMode,
  localMuted,
  videoEnabled,
  remoteLabel,
}: CallViewportProps) {
  return (
    <div className="card-elevated p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Call Room</h2>
          <p className="text-sm text-muted-foreground">
            WebRTC-ready operator workspace for video, audio, and visitor support.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {callMode === "video" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
              {videoEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
              Video
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            {localMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            Audio
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <MediaTile
          label={remoteLabel}
          stream={remoteStream}
          placeholder="Remote video will appear here once the visitor joins the live session."
        />
        <MediaTile
          label="Operator preview"
          stream={localStream}
          muted
          placeholder="Start audio or video to open the local operator preview."
        />
      </div>
    </div>
  );
}
