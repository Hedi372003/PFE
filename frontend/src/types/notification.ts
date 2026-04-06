export type NotificationPriority = "info" | "success" | "warning" | "critical";
export type NotificationKind = "visitor" | "robot" | "communication" | "system";
export type SocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "mock"
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
}

export interface SocketSnapshot {
  status: SocketConnectionStatus;
  notifications: NotificationItem[];
}
