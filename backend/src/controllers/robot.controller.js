const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const robotCommunication = require("../config/robot-communication");

const validStatuses = new Set(["online", "offline", "maintenance"]);
const validCommands = new Set([
  "start",
  "stop",
  "move_forward",
  "move_backward",
  "turn_left",
  "turn_right",
]);

const mapRobot = (robot) => ({
  _id: robot.id,
  id: robot.id,
  name: robot.name,
  robotId: robot.robotId,
  latitude: Number(robot.latitude),
  longitude: Number(robot.longitude),
  status: robot.status,
  createdAt: robot.createdAt,
  updatedAt: robot.updatedAt,
});

exports.getAllRobots = async (req, res) => {
  try {
    const robots = await prisma.robot.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json(robots.map(mapRobot));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createRobot = async (req, res) => {
  try {
    const { name, robotId, latitude, longitude, status } = req.body;

    if (name === undefined || robotId === undefined) {
      return res.status(400).json({ message: "Name and robotId required" });
    }

    const normalizedName = String(name).trim();
    const normalizedRobotId = String(robotId).trim();

    if (!normalizedName || !normalizedRobotId) {
      return res.status(400).json({ message: "Name and robotId required" });
    }

    const normalizedStatus = status && validStatuses.has(status) ? status : "offline";
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const normalizedLatitude = Number.isFinite(parsedLatitude) ? parsedLatitude : 0;
    const normalizedLongitude = Number.isFinite(parsedLongitude) ? parsedLongitude : 0;

    const existingRobot = await prisma.robot.findUnique({
      where: { robotId: normalizedRobotId },
      select: { id: true },
    });

    if (existingRobot) {
      return res.status(400).json({ message: "Robot ID already exists" });
    }

    const robot = await prisma.robot.create({
      data: {
        name: normalizedName,
        robotId: normalizedRobotId,
        latitude: normalizedLatitude,
        longitude: normalizedLongitude,
        status: normalizedStatus,
      },
    });

    return res.status(201).json(mapRobot(robot));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "Robot ID already exists" });
    }

    console.error("createRobot error:", error);
    return res.status(500).json({ message: "Failed to add robot" });
  }
};

exports.updateRobot = async (req, res) => {
  try {
    const { name, robotId, latitude, longitude, status } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (robotId !== undefined) data.robotId = robotId;
    if (latitude !== undefined) {
      const parsedLatitude = Number(latitude);
      if (!Number.isFinite(parsedLatitude)) {
        return res.status(400).json({ message: "Invalid latitude" });
      }
      data.latitude = parsedLatitude;
    }
    if (longitude !== undefined) {
      const parsedLongitude = Number(longitude);
      if (!Number.isFinite(parsedLongitude)) {
        return res.status(400).json({ message: "Invalid longitude" });
      }
      data.longitude = parsedLongitude;
    }

    if (status !== undefined) {
      if (!validStatuses.has(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const robot = await prisma.robot.update({
      where: { id: req.params.id },
      data,
    });

    return res.json(mapRobot(robot));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Robot ID already exists" });
      }

      if (error.code === "P2025") {
        return res.status(404).json({ message: "Robot not found" });
      }
    }

    return res.status(400).json({ message: error.message });
  }
};

exports.deleteRobot = async (req, res) => {
  try {
    await prisma.robot.delete({ where: { id: req.params.id } });
    return res.json({ message: "Robot deleted" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Robot not found" });
    }

    return res.status(500).json({ message: error.message });
  }
};

exports.getRobotControlStatus = async (req, res) => {
  try {
    const robot = await prisma.robot.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, robotId: true, status: true },
    });

    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    const telemetry = robotCommunication.getRuntimeState(robot);

    return res.json({
      robot: {
        id: robot.id,
        name: robot.name,
        robotId: robot.robotId,
        status: robot.status,
      },
      telemetry,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch robot status" });
  }
};

exports.sendRobotCommand = async (req, res) => {
  try {
    const robot = await prisma.robot.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, robotId: true, status: true },
    });

    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    if (robot.status !== "online") {
      return res.status(409).json({ message: "Robot is offline" });
    }

    const { command, parameters = {}, speed, direction } = req.body || {};
    const normalizedCommand = String(command || "").trim().toLowerCase();

    if (!validCommands.has(normalizedCommand)) {
      return res.status(400).json({
        message: "Invalid command",
        allowedCommands: Array.from(validCommands),
      });
    }

    const sanitizedParameters = {};
    const mergedParameters = {
      ...(parameters && typeof parameters === "object" ? parameters : {}),
      ...(speed !== undefined ? { speed } : {}),
      ...(direction !== undefined ? { direction } : {}),
    };

    if (mergedParameters && typeof mergedParameters === "object") {
      if (mergedParameters.speed !== undefined) {
        const parsedSpeed = Number(mergedParameters.speed);
        if (!Number.isFinite(parsedSpeed) || parsedSpeed < 0) {
          return res.status(400).json({ message: "Invalid speed parameter" });
        }
        sanitizedParameters.speed = parsedSpeed;
      }

      if (mergedParameters.direction !== undefined) {
        sanitizedParameters.direction = String(mergedParameters.direction).trim();
      }
    }

    const commandMessage = {
      type: "robot.command",
      command: normalizedCommand,
      parameters: sanitizedParameters,
      requestedAt: new Date().toISOString(),
      requestedBy: req.user
        ? { id: req.user.id || null, role: req.user.role || null }
        : null,
      robot: {
        id: robot.id,
        name: robot.name,
        robotId: robot.robotId,
      },
    };

    const publishResult = await robotCommunication.publishCommand(commandMessage);
    const telemetry = robotCommunication.updateRuntimeState(robot, normalizedCommand);

    return res.status(202).json({
      status: "queued",
      command: {
        name: normalizedCommand,
        parameters: sanitizedParameters,
      },
      robot: {
        id: robot.id,
        name: robot.name,
        robotId: robot.robotId,
        status: robot.status,
      },
      transport: publishResult.transport,
      topic: publishResult.topic,
      telemetry,
    });
  } catch (error) {
    console.error("sendRobotCommand error:", error);
    return res.status(500).json({ message: "Failed to dispatch command" });
  }
};
