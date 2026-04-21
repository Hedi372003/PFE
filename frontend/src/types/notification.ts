export type NotificationPriority = "info" | "success" | "warning" | "critical";
export type NotificationKind = "visitor" | "robot" | "communication" | "system";
export type SocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  updatedAt?: string;
  readAt?: string | null;
}

export interface SocketSnapshot {
  status: SocketConnectionStatus;
  notifications: NotificationItem[];
}
