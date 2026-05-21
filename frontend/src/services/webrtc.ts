export interface LocalPreviewOptions {
  audio: boolean;
  video: boolean;
}

export interface RobotViewerOptions {
  signalingUrl?: string;
  onRemoteStream?: (stream: MediaStream) => void;
  onStateChange?: (state: RTCPeerConnectionState | "socket-open" | "socket-closed" | "waiting") => void;
}

export interface RobotViewerSession {
  sendCommand: (command: string) => void;
  stop: () => void;
}

interface SignalingMessage {
  type?: string;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

function buildDefaultSignalingUrl(): string {
  const configuredUrl = import.meta.env.VITE_ROBOT_SIGNALING_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const browserProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${browserProtocol}//${window.location.hostname}:5002`;
}

const DEFAULT_ROBOT_SIGNALING_URL = buildDefaultSignalingUrl();

function createPeerConnection(options: RobotViewerOptions) {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.ontrack = (event) => {
    const remoteStream = event.streams[0] || new MediaStream([event.track]);
    options.onRemoteStream?.(remoteStream);
  };

  peerConnection.onconnectionstatechange = () => {
    options.onStateChange?.(peerConnection.connectionState);
  };

  return peerConnection;
}

async function createAndSendOffer(peerConnection: RTCPeerConnection, socket: WebSocket) {
  peerConnection.addTransceiver("video", { direction: "recvonly" });
  peerConnection.addTransceiver("audio", { direction: "recvonly" });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.send(JSON.stringify({ type: "offer", offer }));
}

export async function startLocalPreview(options: LocalPreviewOptions): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Media devices are not available in this browser.");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: options.audio,
    video: options.video,
  });
}

export function stopMediaStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export async function startRobotViewer(options: RobotViewerOptions = {}): Promise<RobotViewerSession> {
  const signalingUrl = options.signalingUrl || DEFAULT_ROBOT_SIGNALING_URL;
  const socket = new WebSocket(signalingUrl);
  const peerConnection = createPeerConnection(options);
  const pendingCandidates: RTCIceCandidateInit[] = [];
  let remoteDescriptionReady = false;
  let offerStarted = false;

  peerConnection.onicecandidate = (event) => {
    if (event.candidate && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
    }
  };

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data) as SignalingMessage & {
      peer?: string;
      state?: { robotConnected?: boolean };
      message?: string;
    };

    if (data.type === "session.status" && data.state?.robotConnected === false) {
      options.onStateChange?.("waiting");
      return;
    }

    if (data.type === "peer.unavailable") {
      options.onStateChange?.("waiting");
      return;
    }

    if (data.type === "peer.ready" && data.peer === "robot" && !offerStarted) {
      offerStarted = true;
      await createAndSendOffer(peerConnection, socket);
      return;
    }

    if (data.type === "answer" && data.answer) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      remoteDescriptionReady = true;

      while (pendingCandidates.length > 0) {
        const nextCandidate = pendingCandidates.shift();
        if (nextCandidate) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(nextCandidate));
        }
      }

      return;
    }

    if (data.type === "candidate" && data.candidate) {
      if (!remoteDescriptionReady) {
        pendingCandidates.push(data.candidate);
        return;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch {
        // Ignore late ICE candidates after teardown.
      }
    }
  };

  socket.onclose = () => {
    options.onStateChange?.("socket-closed");
  };

  await new Promise<void>((resolve, reject) => {
    socket.onopen = () => {
      options.onStateChange?.("socket-open");
      socket.send(JSON.stringify({ type: "viewer" }));
      resolve();
    };

    socket.onerror = () => {
      reject(new Error("Unable to connect to the robot signaling server."));
    };
  });

  return {
    sendCommand(command: string) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "command", command }));
      }
    },

    stop() {
      socket.close();
      peerConnection.close();
    },
  };
}