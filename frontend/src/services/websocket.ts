import { authService, notificationService } from "@/services/api";
import type { NotificationItem, SocketConnectionStatus, SocketSnapshot } from "@/types/notification";

const MAX_NOTIFICATIONS = 50;

type SnapshotListener = (snapshot: SocketSnapshot) => void;

class WebSocketService {
  private socket: WebSocket | null = null;

  private listeners = new Set<SnapshotListener>();

  private notifications: NotificationItem[] = [];

  private status: SocketConnectionStatus = "idle";

  private connectionRefs = 0;

  connect(): () => void {
    this.connectionRefs += 1;

    if (this.connectionRefs === 1) {
      void this.start();
    } else {
      this.emit();
    }

    return () => {
      this.connectionRefs = Math.max(0, this.connectionRefs - 1);
      if (this.connectionRefs === 0) {
        this.stop();
      }
    };
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): SocketSnapshot {
    return {
      status: this.status,
      notifications: [...this.notifications].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    };
  }

  async markAsRead(id: string): Promise<void> {
    const updatedNotification = await notificationService.markAsRead(id);
    this.upsertNotification(updatedNotification);
  }

  async markAllAsRead(): Promise<void> {
    await notificationService.markAllAsRead();
    this.notifications = this.notifications.map((item) => ({
      ...item,
      read: true,
      readAt: item.readAt || new Date().toISOString(),
    }));
    this.emit();
  }

  send(payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  private async start(): Promise<void> {
    const token = authService.getStoredToken();

    if (!token) {
      this.notifications = [];
      this.status = "idle";
      this.emit();
      return;
    }

    await this.syncNotifications();

    this.status = "connecting";
    this.emit();

    try {
      this.socket = new WebSocket(this.buildWebSocketUrl());

      this.socket.onopen = () => {
        this.status = "connected";
        this.send({
          type: "authenticate",
          token,
        });
        this.send({
          type: "subscribe.notifications",
          enabled: true,
        });
        this.emit();
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as Partial<NotificationItem> & { type?: string };

          if (parsed.type === "notification" && parsed.id && parsed.title && parsed.body && parsed.createdAt) {
            this.upsertNotification({
              id: parsed.id,
              title: parsed.title,
              body: parsed.body,
              priority: parsed.priority || "info",
              kind: parsed.kind || "system",
              createdAt: parsed.createdAt,
              updatedAt: parsed.updatedAt,
              read: Boolean(parsed.read),
              readAt: parsed.readAt || null,
            });
          }

          if (parsed.type === "auth.error") {
            this.status = "error";
            this.emit();
          }
        } catch {
          this.status = "error";
          this.emit();
        }
      };

      this.socket.onerror = () => {
        this.status = "error";
        this.emit();
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.status = this.connectionRefs > 0 ? "disconnected" : "idle";
        this.emit();
      };
    } catch {
      this.status = "error";
      this.emit();
    }
  }

  private stop(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.status = "idle";
    this.emit();
  }

  private buildWebSocketUrl(): string {
    const configuredUrl = import.meta.env.VITE_WS_URL?.trim();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

    if (configuredUrl) {
      return configuredUrl;
    }

    if (apiBaseUrl) {
      const resolvedApiUrl = new URL(apiBaseUrl, window.location.origin);
      resolvedApiUrl.protocol = resolvedApiUrl.protocol === "https:" ? "wss:" : "ws:";
      resolvedApiUrl.pathname = "/ws";
      resolvedApiUrl.search = "";
      return resolvedApiUrl.toString();
    }

    return `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:5000/ws`;
  }

  private async syncNotifications(): Promise<void> {
    try {
      this.notifications = await notificationService.list({ limit: MAX_NOTIFICATIONS });
    } catch {
      this.notifications = [];
    }

    this.emit();
  }

  private upsertNotification(notification: NotificationItem): void {
    this.notifications = [notification, ...this.notifications.filter((item) => item.id !== notification.id)]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, MAX_NOTIFICATIONS);
    this.emit();
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const websocketService = new WebSocketService();
