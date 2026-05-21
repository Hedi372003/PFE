const { URL } = require("url");
const { WebSocketServer, WebSocket } = require("ws");
const jwt = require("jsonwebtoken");

const callService = require("../services/call.service");

const DEFAULT_HTTP_PATH = "/ws";
const HUMAN_ROLES = new Set(["admin", "operator", "user"]);

function safeParseMessage(rawMessage) {
  try {
    const content = typeof rawMessage === "string" ? rawMessage : rawMessage.toString();
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeParticipantType(value) {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (normalizedValue === "robot") {
    return "robot";
  }

  if (["viewer", "operator", "admin"].includes(normalizedValue)) {
    return "viewer";
  }

  return null;
}

function buildUrl(request, fallbackHost = "localhost") {
  return new URL(request.url || "/", `http://${request.headers.host || fallbackHost}`);
}

class RealtimeHub {
  constructor() {
    this.connections = new Map();
    this.socketLookup = new Map();
    this.connectionCounter = 0;
    this.httpServer = null;
    this.httpWss = null;
    this.httpUpgradeHandler = null;
    this.standaloneWss = null;
  }

  attachHttpServer(server, options = {}) {
    if (this.httpWss) {
      return this.httpWss;
    }

    const path = options.path || DEFAULT_HTTP_PATH;
    const wss = new WebSocketServer({ noServer: true });

    this.httpUpgradeHandler = (request, socket, head) => {
      const requestUrl = buildUrl(request);

      if (requestUrl.pathname !== path) {
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    };

    server.on("upgrade", this.httpUpgradeHandler);
    wss.on("connection", (ws, request) => {
      this.handleConnection(ws, request, { transport: "http", path });
    });

    this.httpServer = server;
    this.httpWss = wss;
    return wss;
  }

  startStandalone(options = {}) {
    if (this.standaloneWss) {
      return this.standaloneWss;
    }

    const port = Number(options.port || 5002);
    const host = options.host || "0.0.0.0";
    const wss = new WebSocketServer({ port, host });

    wss.on("connection", (ws, request) => {
      this.handleConnection(ws, request, { transport: "standalone", port });
    });

    this.standaloneWss = wss;
    return wss;
  }

  async close() {
    if (this.httpServer && this.httpUpgradeHandler) {
      this.httpServer.off("upgrade", this.httpUpgradeHandler);
    }

    const closeServer = (server) =>
      new Promise((resolve) => {
        if (!server) {
          resolve();
          return;
        }

        server.close(() => resolve());
      });

    await Promise.all([
      closeServer(this.httpWss),
      closeServer(this.standaloneWss),
    ]);

    this.connections.clear();
    this.socketLookup.clear();
    this.httpWss = null;
    this.standaloneWss = null;
    this.httpServer = null;
    this.httpUpgradeHandler = null;
    callService.resetCallState();
  }

  handleConnection(ws, request, origin) {
    const connectionId = `conn-${++this.connectionCounter}`;
    const requestUrl = buildUrl(request);
    const participantType = normalizeParticipantType(
      requestUrl.searchParams.get("participantType") || requestUrl.searchParams.get("role"),
    );

    const connection = {
      id: connectionId,
      ws,
      origin,
      authenticated: false,
      userId: null,
      role: normalizeText(requestUrl.searchParams.get("role")) || null,
      participantType,
      label: normalizeText(requestUrl.searchParams.get("label")) || null,
      wantsNotifications: true,
    };

    this.connections.set(connectionId, connection);
    this.socketLookup.set(ws, connectionId);

    const token = normalizeText(requestUrl.searchParams.get("token"));
    if (token) {
      this.authenticateConnection(connection, token);
    }

    this.sendToConnection(connectionId, {
      type: "connected",
      connectionId,
      authenticated: connection.authenticated,
      role: connection.role,
      state: callService.getCallState(),
    });

    if (participantType) {
      this.registerParticipant(connectionId, participantType, { label: connection.label }).catch((error) => {
        console.error("registerParticipant on connect error:", error);
      });
    }

    ws.on("message", async (message, isBinary) => {
      if (isBinary) {
        this.sendToConnection(connectionId, {
          type: "error",
          message: "Binary websocket frames are not supported.",
        });
        return;
      }

      try {
        await this.handleMessage(connectionId, message);
      } catch (error) {
        console.error("WebSocket message handling error:", error);
        this.sendToConnection(connectionId, {
          type: "error",
          message: "The realtime server failed to process the message.",
        });
      }
    });

    ws.on("close", () => {
      this.handleDisconnect(connectionId);
    });

    ws.on("error", (error) => {
      console.error("WebSocket connection error:", error);
    });
  }

  authenticateConnection(connection, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      connection.authenticated = true;
      connection.userId = decoded.id || null;
      connection.role = decoded.role || connection.role || "user";

      this.sendToConnection(connection.id, {
        type: "auth.success",
        userId: connection.userId,
        role: connection.role,
      });

      return true;
    } catch (error) {
      this.sendToConnection(connection.id, {
        type: "auth.error",
        message: "Invalid token",
      });

      return false;
    }
  }

  async handleMessage(connectionId, rawMessage) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return;
    }

    const payload = safeParseMessage(rawMessage);

    if (!payload || typeof payload !== "object") {
      this.sendToConnection(connectionId, {
        type: "error",
        message: "Invalid JSON payload",
      });
      return;
    }

    const type = normalizeText(payload.type);

    switch (type) {
      case "ping":
        this.sendToConnection(connectionId, {
          type: "pong",
          timestamp: new Date().toISOString(),
        });
        return;
      case "authenticate":
        if (!payload.token) {
          this.sendToConnection(connectionId, {
            type: "auth.error",
            message: "token is required",
          });
          return;
        }
        this.authenticateConnection(connection, payload.token);
        return;
      case "subscribe.notifications":
        connection.wantsNotifications = payload.enabled !== false;
        this.sendToConnection(connectionId, {
          type: "notifications.subscription",
          enabled: connection.wantsNotifications,
        });
        return;
      case "robot":
        await this.registerParticipant(connectionId, "robot", payload);
        return;
      case "viewer":
      case "operator":
      case "admin":
        await this.registerParticipant(connectionId, "viewer", payload);
        return;
      case "offer":
      case "answer":
      case "candidate":
      case "command":
        await this.forwardDirectPayload(connectionId, type, payload);
        return;
      case "call.reset":
        callService.resetCallState();
        this.broadcastDirectState();
        return;
      default:
        this.sendToConnection(connectionId, {
          type: "error",
          message: `Unsupported realtime message type: ${type || "unknown"}`,
        });
    }
  }

  async registerParticipant(connectionId, participantType, payload = {}) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return;
    }

    const normalizedParticipantType = normalizeParticipantType(participantType);

    if (!normalizedParticipantType) {
      this.sendToConnection(connectionId, {
        type: "error",
        message: "Unsupported participant type",
      });
      return;
    }

    connection.participantType = normalizedParticipantType;
    connection.role = connection.role || (normalizedParticipantType === "robot" ? "robot" : "admin");
    connection.label = normalizeText(payload.label) || connection.label;

    this.replaceActiveParticipant(normalizedParticipantType, connectionId);

    if (normalizedParticipantType === "robot") {
      callService.registerRobotConnection(connectionId);
    } else {
      callService.registerViewerConnection(connectionId);
    }

    this.sendToConnection(connectionId, {
      type: "participant.registered",
      participantType: normalizedParticipantType,
      state: callService.getCallState(),
    });

    this.broadcastDirectState();
    this.notifyPeerReadiness();
  }

  replaceActiveParticipant(participantType, nextConnectionId) {
    const state = callService.getCallState();
    const currentConnectionId =
      participantType === "robot" ? state.robotConnectionId : state.viewerConnectionId;

    if (!currentConnectionId || currentConnectionId === nextConnectionId) {
      return;
    }

    this.sendToConnection(currentConnectionId, {
      type: "session.replaced",
      participantType,
      message: `A new ${participantType} connection replaced this session.`,
    });

    const currentConnection = this.connections.get(currentConnectionId);
    currentConnection?.ws.close();
  }

  async forwardDirectPayload(connectionId, type, payload = {}) {
    const connection = this.connections.get(connectionId);

    if (!connection?.participantType) {
      this.sendToConnection(connectionId, {
        type: "error",
        message: "Register as robot or viewer before signaling.",
      });
      return;
    }

    const state = callService.getCallState();
    const targetConnectionId =
      connection.participantType === "robot" ? state.viewerConnectionId : state.robotConnectionId;

    if (!targetConnectionId) {
      this.sendToConnection(connectionId, {
        type: "peer.unavailable",
        message: "The other side is not connected yet.",
        state,
      });
      return;
    }

    this.sendToConnection(targetConnectionId, {
      type,
      fromConnectionId: connectionId,
      fromUserId: connection.userId,
      fromRole: connection.role || connection.participantType,
      offer: payload.offer || null,
      answer: payload.answer || null,
      candidate: payload.candidate || null,
      command: payload.command || null,
      timestamp: new Date().toISOString(),
    });

    if (type === "offer") {
      callService.setCallState("connecting");
    }

    if (type === "answer") {
      callService.setCallState("live");
    }

    this.broadcastDirectState();
  }

  handleDisconnect(connectionId) {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      return;
    }

    if (connection.participantType === "robot") {
      callService.clearRobotConnection(connectionId);
      this.notifyPeerLeft("robot");
    }

    if (connection.participantType === "viewer") {
      callService.clearViewerConnection(connectionId);
      this.notifyPeerLeft("viewer");
    }

    this.socketLookup.delete(connection.ws);
    this.connections.delete(connectionId);
    this.broadcastDirectState();
  }

  notifyPeerReadiness() {
    const state = callService.getCallState();

    if (state.robotConnectionId) {
      this.sendToConnection(state.robotConnectionId, {
        type: "session.status",
        state,
      });
    }

    if (state.viewerConnectionId) {
      this.sendToConnection(state.viewerConnectionId, {
        type: "session.status",
        state,
      });
    }

    if (!state.robotConnected || !state.viewerConnected) {
      return;
    }

    this.sendToConnection(state.robotConnectionId, {
      type: "peer.ready",
      peer: "viewer",
      state,
    });

    this.sendToConnection(state.viewerConnectionId, {
      type: "peer.ready",
      peer: "robot",
      state,
    });
  }

  notifyPeerLeft(peer) {
    const state = callService.getCallState();

    if (state.robotConnectionId) {
      this.sendToConnection(state.robotConnectionId, {
        type: "peer.left",
        peer,
        state,
      });
    }

    if (state.viewerConnectionId) {
      this.sendToConnection(state.viewerConnectionId, {
        type: "peer.left",
        peer,
        state,
      });
    }
  }

  broadcastDirectState() {
    const state = callService.getCallState();

    if (state.robotConnectionId) {
      this.sendToConnection(state.robotConnectionId, {
        type: "session.status",
        state,
      });
    }

    if (state.viewerConnectionId) {
      this.sendToConnection(state.viewerConnectionId, {
        type: "session.status",
        state,
      });
    }
  }

  broadcastNotification(notification) {
    const outboundNotification = {
      type: "notification",
      ...notification,
    };

    for (const [connectionId, connection] of this.connections.entries()) {
      if (!connection.wantsNotifications) {
        continue;
      }

      if (!this.connectionMatchesNotification(connection, notification)) {
        continue;
      }

      this.sendToConnection(connectionId, outboundNotification);
    }
  }

  sendToConnection(connectionId, payload) {
    const connection = this.connections.get(connectionId);

    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    connection.ws.send(JSON.stringify(payload));
    return true;
  }

  connectionMatchesNotification(connection, notification) {
    if (!connection.authenticated && !HUMAN_ROLES.has(connection.role)) {
      return false;
    }

    if (notification.targetUserId && connection.userId !== notification.targetUserId) {
      return false;
    }

    if (notification.targetRole && connection.role !== notification.targetRole) {
      return false;
    }

    return true;
  }
}

module.exports = new RealtimeHub();