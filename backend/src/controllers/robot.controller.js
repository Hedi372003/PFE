const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

const validStatuses = new Set(["online", "offline", "maintenance"]);

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
      return res.status(400).json({ message: "name and robotId are required" });
    }

    const normalizedName = String(name).trim();
    const normalizedRobotId = String(robotId).trim();

    if (!normalizedName || !normalizedRobotId) {
      return res.status(400).json({ message: "name and robotId are required" });
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
