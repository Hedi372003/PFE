export type LogCategory =
  | "visit"
  | "robot"
  | "communication"
  | "notification"
  | "cms"
  | "security";

export type LogSeverity = "info" | "success" | "warning" | "critical";

export interface ActivityLog {
  id: string;
  category: LogCategory;
  severity: LogSeverity;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}
