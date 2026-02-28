const bcrypt = require("bcryptjs");
const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

const validRoles = new Set(["admin", "operator"]);

const mapRobot = (robot) => {
  if (!robot) return null;

  return {
    _id: robot.id,
    id: robot.id,
    name: robot.name,
    robotId: robot.robotId,
    latitude: robot.latitude,
    longitude: robot.longitude,
    status: robot.status,
    createdAt: robot.createdAt,
    updatedAt: robot.updatedAt,
  };
};

const mapUser = (user) => ({
  _id: user.id,
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  robotAssigned: mapRobot(user.robotAssigned),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  robotAssigned: {
    select: {
      id: true,
      name: true,
      robotId: true,
      latitude: true,
      longitude: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });

    return res.json(users.map(mapUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(mapUser(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, password, role, robotAssigned } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = validRoles.has(role) ? role : "operator";

    const createdUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        role: normalizedRole,
        robotAssignedId: robotAssigned || null,
      },
      select: userSelect,
    });

    return res.status(201).json(mapUser(createdUser));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }

      if (error.code === "P2003") {
        return res.status(400).json({ message: "Invalid robot assignment" });
      }
    }

    return res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, password, role, robotAssigned } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = String(email).trim().toLowerCase();

    if (role !== undefined) {
      if (!validRoles.has(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      data.role = role;
    }

    if (robotAssigned !== undefined) data.robotAssignedId = robotAssigned || null;
    if (password !== undefined && password !== "") data.password = await bcrypt.hash(password, 10);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: userSelect,
    });

    return res.json(mapUser(updatedUser));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }

      if (error.code === "P2003") {
        return res.status(400).json({ message: "Invalid robot assignment" });
      }

      if (error.code === "P2025") {
        return res.status(404).json({ message: "User not found" });
      }
    }

    return res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(500).json({ message: error.message });
  }
};
