import { createId } from "@/lib/utils";
import type {
  NotificationItem,
  SocketConnectionStatus,
  SocketSnapshot,
} from "@/types/notification";

const STORAGE_KEY = "telebot.notifications";
const MAX_NOTIFICATIONS = 20;

const defaultNotifications: NotificationItem[] = [
  {
    id: createId("notification"),
    title: "Robot fleet check complete",
    body: "All registered telepresence robots finished the latest status sync.",
    priority: "success",
    kind: "robot",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
  },
  {
    id: createId("notification"),
    title: "Pending visitor approval",
    body: "A new visitor request is waiting for admin validation.",
    priority: "warning",
    kind: "visitor",
    createdAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    read: false,
  },
  {
    id: createId("notification"),
    title: "Communication room ready",
    body: "Audio and video channels are configured for the next call.",
    priority: "info",
    kind: "communication",
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read: true,
  },
];

type SnapshotListener = (snapshot: SocketSnapshot) => void;

function readNotifications(): NotificationItem[] {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return defaultNotifications;
    }

    return JSON.parse(rawValue) as NotificationItem[];
  } catch {
    return defaultNotifications;
  }
}

function persistNotifications(notifications: NotificationItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function buildMockNotification(): NotificationItem {
  const templates: Array<Omit<NotificationItem, "id" | "createdAt" | "read">> = [
    {
      title: "Robot battery alert",
      body: "Robot R-204 dropped below the recommended battery threshold.",
      priority: "warning",
      kind: "robot",
    },
    {
      title: "Visitor arrived in queue",
      body: "A visitor requested a live telepresence check-in from reception.",
      priority: "info",
      kind: "visitor",
    },
    {
      title: "Call room handover",
      body: "The current communication room is free for the next operator.",
      priority: "success",
      kind: "communication",
    },
    {
      title: "System reminder",
      body: "Review the company welcome instructions before the next demo.",
      priority: "info",
      kind: "system",
    },
  ];

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)] || templates[0];

  return {
    id: createId("notification"),
    createdAt: new Date().toISOString(),
    read: false,
    ...randomTemplate,
  };
}

class WebSocketService {
  private socket: WebSocket | null = null;

  private listeners = new Set<SnapshotListener>();

  private notifications = readNotifications();

  private status: SocketConnectionStatus = "idle";

  private mockTimer: number | null = null;

  private connectionRefs = 0;

  connect(): () => void {
    this.connectionRefs += 1;

    if (this.connectionRefs === 1) {
      this.start();
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

  markAsRead(id: string): void {
    this.notifications = this.notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item,
    );
    persistNotifications(this.notifications);
    this.emit();
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map((item) => ({ ...item, read: true }));
    persistNotifications(this.notifications);
    this.emit();
  }

  pushNotification(item: Omit<NotificationItem, "id" | "createdAt" | "read">): void {
    this.notifications = [
      {
        id: createId("notification"),
        createdAt: new Date().toISOString(),
        read: false,
        ...item,
      },
      ...this.notifications,
    ].slice(0, MAX_NOTIFICATIONS);

    persistNotifications(this.notifications);
    this.emit();
  }

  send(payload: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  private start(): void {
    const websocketUrl =
      import.meta.env.VITE_WS_URL?.trim() ||
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.hostname}:5000/ws?role=admin`;

    if (!websocketUrl) {
      this.startMockStream();
      return;
    }

    this.status = "connecting";
    this.emit();

    try {
      this.socket = new WebSocket(websocketUrl);
      this.socket.onopen = () => {
        this.status = "connected";
        this.emit();
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as Partial<NotificationItem> & { type?: string };

          if (parsed.type === "notification" || parsed.title) {
            this.pushNotification({
              title: parsed.title || "Live update",
              body: parsed.body || "A new real-time event was received.",
              priority: parsed.priority || "info",
              kind: parsed.kind || "system",
            });
          }
        } catch {
          this.pushNotification({
            title: "Live update received",
            body: "A WebSocket event arrived but could not be parsed cleanly.",
            priority: "warning",
            kind: "system",
          });
        }
      };

      this.socket.onerror = () => {
        this.status = "error";
        this.emit();
        this.startMockStream();
      };

      this.socket.onclose = () => {
        this.status = "disconnected";
        this.emit();
      };
    } catch {
      this.startMockStream();
    }
  }

  private stop(): void {
    if (this.mockTimer) {
      window.clearInterval(this.mockTimer);
      this.mockTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.status = "idle";
    this.emit();
  }

  private startMockStream(): void {
    if (this.mockTimer) {
      return;
    }

    this.status = "mock";
    this.emit();

    this.mockTimer = window.setInterval(() => {
      this.notifications = [buildMockNotification(), ...this.notifications].slice(0, MAX_NOTIFICATIONS);
      persistNotifications(this.notifications);
      this.emit();
    }, 25000);
  }

  private emit(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}

export const websocketService = new WebSocketService();
