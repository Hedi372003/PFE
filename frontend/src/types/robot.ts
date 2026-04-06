export type RobotStatus = "online" | "offline" | "maintenance";
export type RobotCommand = "forward" | "left" | "stop" | "right" | "back";

export interface RobotRecord {
  id: string;
  _id?: string;
  name: string;
  robotId: string;
  latitude: number;
  longitude: number;
  status: RobotStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RobotDraft {
  name: string;
  robotId: string;
  latitude: number;
  longitude: number;
  status: RobotStatus;
}

export interface RobotTelemetry {
  batteryLevel: number;
  networkQuality: "excellent" | "good" | "unstable" | "offline";
  speedKph: number;
  lastSeenLabel: string;
}
