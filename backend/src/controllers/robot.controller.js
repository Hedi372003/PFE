const notificationService = require("../services/notification.service");
const robotService = require("../services/robot.service");

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
    const robots = await robotService.listRobots();
    return res.json(robots.map(mapRobot));
  } catch (error) {
    console.error("getAllRobots error:", error);
    return res.status(500).json({ message: "Failed to fetch robots" });
  }
};

exports.createRobot = async (req, res) => {
  try {
    const { name, robotId, latitude, longitude, status } = req.body;

    const normalizedName = String(name || "").trim();
    const normalizedRobotId = String(robotId || "").trim();

    if (!normalizedName || !normalizedRobotId) {
      return res.status(400).json({ message: "name and robotId are required" });
    }

    const existingRobot = await robotService.getRobotByRobotId(normalizedRobotId);

    if (existingRobot) {
      return res.status(400).json({ message: "Robot ID already exists" });
    }

    const robot = await robotService.createRobot({
      name: normalizedName,
      robotId: normalizedRobotId,
      latitude,
      longitude,
      status,
    });

    await notificationService.safeCreateNotification({
      title: "Robot added",
      body: `${robot.name} was added to the telepresence fleet.`,
      kind: "robot",
      priority: "success",
      targetRole: "admin",
      metadata: {
        robotId: robot.id,
        fleetId: robot.robotId,
      },
    });

    return res.status(201).json(mapRobot(robot));
  } catch (error) {
    if (robotService.isUniqueViolation(error)) {
      return res.status(400).json({ message: "Robot ID already exists" });
    }

    console.error("createRobot error:", error);
    return res.status(500).json({ message: "Failed to add robot" });
  }
};

exports.updateRobot = async (req, res) => {
  try {
    const { name, robotId, latitude, longitude, status } = req.body;
    const updates = {};

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (!normalizedName) {
        return res.status(400).json({ message: "Invalid name" });
      }
      updates.name = normalizedName;
    }

    if (robotId !== undefined) {
      const normalizedRobotId = String(robotId).trim();
      if (!normalizedRobotId) {
        return res.status(400).json({ message: "Invalid robotId" });
      }

      const existingRobot = await robotService.getRobotByRobotId(normalizedRobotId);
      if (existingRobot && existingRobot.id !== req.params.id) {
        return res.status(400).json({ message: "Robot ID already exists" });
      }

      updates.robotId = normalizedRobotId;
    }

    if (latitude !== undefined) {
      const parsedLatitude = Number(latitude);
      if (!Number.isFinite(parsedLatitude)) {
        return res.status(400).json({ message: "Invalid latitude" });
      }
      updates.latitude = parsedLatitude;
    }

    if (longitude !== undefined) {
      const parsedLongitude = Number(longitude);
      if (!Number.isFinite(parsedLongitude)) {
        return res.status(400).json({ message: "Invalid longitude" });
      }
      updates.longitude = parsedLongitude;
    }

    if (status !== undefined) {
      if (!robotService.VALID_STATUSES.has(String(status).trim().toLowerCase())) {
        return res.status(400).json({ message: "Invalid status" });
      }
      updates.status = String(status).trim().toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const robot = await robotService.updateRobot(req.params.id, updates);

    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    await notificationService.safeCreateNotification({
      title: "Robot updated",
      body: `${robot.name} configuration was updated.`,
      kind: "robot",
      priority: "info",
      targetRole: "admin",
      metadata: {
        robotId: robot.id,
        fleetId: robot.robotId,
        status: robot.status,
      },
    });

    return res.json(mapRobot(robot));
  } catch (error) {
    if (robotService.isUniqueViolation(error)) {
      return res.status(400).json({ message: "Robot ID already exists" });
    }

    console.error("updateRobot error:", error);
    return res.status(500).json({ message: "Failed to update robot" });
  }
};

exports.deleteRobot = async (req, res) => {
  try {
    const deletedRobot = await robotService.deleteRobot(req.params.id);

    if (!deletedRobot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    await notificationService.safeCreateNotification({
      title: "Robot removed",
      body: `${deletedRobot.name} was removed from the telepresence fleet.`,
      kind: "robot",
      priority: "info",
      targetRole: "admin",
      metadata: {
        robotId: deletedRobot.id,
        fleetId: deletedRobot.robotId,
      },
    });

    return res.json({ message: "Robot deleted" });
  } catch (error) {
    console.error("deleteRobot error:", error);
    return res.status(500).json({ message: "Failed to delete robot" });
  }
};
