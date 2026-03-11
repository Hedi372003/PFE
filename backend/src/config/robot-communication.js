const runtimeByRobotId = new Map();

const movementCommands = new Set([
  "move_forward",
  "move_backward",
  "turn_left",
  "turn_right",
]);

const getTransport = () => {
  const raw = String(process.env.ROBOT_COMMAND_TRANSPORT || "websocket").toLowerCase();
  if (raw === "mqtt") return "mqtt";
  if (raw === "websocket") return "websocket";
  return "websocket";
};

const getRuntimeState = (robot) => {
  const existing = runtimeByRobotId.get(robot.id);
  const nowIso = new Date().toISOString();

  if (existing) {
    return {
      robotStatus: robot.status,
      batteryLevel: existing.batteryLevel,
      currentCommand: existing.currentCommand,
      lastUpdate: existing.lastUpdate,
    };
  }

  return {
    robotStatus: robot.status,
    batteryLevel: 100,
    currentCommand: "idle",
    lastUpdate: nowIso,
  };
};

const updateRuntimeState = (robot, command) => {
  const current = getRuntimeState(robot);
  const nextBattery = movementCommands.has(command)
    ? Math.max(0, current.batteryLevel - 1)
    : current.batteryLevel;

  const next = {
    robotStatus: robot.status,
    batteryLevel: nextBattery,
    currentCommand: command,
    lastUpdate: new Date().toISOString(),
  };

  runtimeByRobotId.set(robot.id, next);
  return next;
};

const publishCommand = async (payload) => {
  const transport = getTransport();

  // Optional adapter hook. External WS/MQTT integration can provide this at runtime.
  if (global.robotCommandPublisher && typeof global.robotCommandPublisher.publish === "function") {
    await global.robotCommandPublisher.publish({
      transport,
      topic: `robots/${payload.robot.robotId}/commands`,
      payload,
    });
  }

  return {
    accepted: true,
    transport,
    topic: `robots/${payload.robot.robotId}/commands`,
  };
};

module.exports = {
  getRuntimeState,
  updateRuntimeState,
  publishCommand,
};
