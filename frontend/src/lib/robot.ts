import { formatRelativeTime } from "@/lib/utils";
import type { RobotRecord, RobotTelemetry } from "@/types/robot";

function sumCharacterCodes(value: string): number {
  return value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function deriveRobotTelemetry(robot: RobotRecord): RobotTelemetry {
  const signalSeed = sumCharacterCodes(robot.robotId || robot.name);
  const batteryLevel =
    robot.status === "offline"
      ? 18
      : robot.status === "maintenance"
        ? 44 + (signalSeed % 12)
        : 72 + (signalSeed % 18);

  const networkQuality =
    robot.status === "offline"
      ? "offline"
      : robot.status === "maintenance"
        ? "unstable"
        : signalSeed % 3 === 0
          ? "excellent"
          : "good";

  return {
    batteryLevel: Math.min(99, batteryLevel),
    networkQuality,
    speedKph: robot.status === "online" ? 1.2 + ((signalSeed % 9) / 10) : 0,
    lastSeenLabel: formatRelativeTime(robot.updatedAt || robot.createdAt),
  };
}
