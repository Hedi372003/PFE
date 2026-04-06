const bcrypt = require("bcryptjs");
const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const notificationService = require("../services/notification.service");

const selectWithoutPassword = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  robotId: true,
  createdAt: true,
  updatedAt: true,
};

const mapUser = (user) => ({
  _id: user.id,
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  phone: user.phone,
  role: user.role,
  robotId: user.robotId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const parseNameFallback = (name) => {
  if (!name || typeof name !== "string") {
    return { firstName: "", lastName: "" };
  }
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

exports.createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      password,
      robotId,
      robotAssigned,
    } = req.body;

    const fallback = parseNameFallback(name);
    const normalizedFirstName = (firstName || fallback.firstName || "").trim();
    const normalizedLastName = (lastName || fallback.lastName || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").trim();

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmail ||
      !normalizedPhone ||
      !password
    ) {
      return res.status(400).json({
        message: "firstName, lastName, email, phone and password are required",
      });
    }

    const createdUser = await prisma.user.create({
      data: {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: await bcrypt.hash(password, 10),
        role: "user",
        robotId: (robotId || robotAssigned || "").trim() || null,
      },
      select: selectWithoutPassword,
    });

    await notificationService.safeCreateNotification({
      title: "User created",
      body: `${createdUser.firstName} ${createdUser.lastName} joined the administration platform.`,
      kind: "system",
      priority: "success",
      targetRole: "admin",
      metadata: {
        userId: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      },
    });

    return res.status(201).json(mapUser(createdUser));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }
    return res.status(400).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: selectWithoutPassword,
    });

    return res.json(users.map(mapUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id },
      select: selectWithoutPassword,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(mapUser(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, robotId, password, robotAssigned } = req.body;
    const data = {};

    if (firstName !== undefined) data.firstName = String(firstName).trim();
    if (lastName !== undefined) data.lastName = String(lastName).trim();
    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: "Email is required" });
      }
      data.email = normalizedEmail;
    }
    if (phone !== undefined) data.phone = String(phone).trim();
    if (robotId !== undefined || robotAssigned !== undefined) {
      data.robotId = String(robotId || robotAssigned || "").trim() || null;
    }
    if (password !== undefined && password !== "") {
      data.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const existing = await prisma.user.findFirst({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: selectWithoutPassword,
    });

    await notificationService.safeCreateNotification({
      title: "User updated",
      body: `${updatedUser.firstName} ${updatedUser.lastName} profile was updated.`,
      kind: "system",
      priority: "info",
      targetRole: "admin",
      metadata: {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

    return res.json(mapUser(updatedUser));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: req.params.id },
    });

    await notificationService.safeCreateNotification({
      title: "User deleted",
      body: `${deletedUser.firstName} ${deletedUser.lastName} account was removed.`,
      kind: "system",
      priority: "info",
      targetRole: "admin",
      metadata: {
        userId: deletedUser.id,
        email: deletedUser.email,
      },
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(500).json({ message: "Failed to delete user" });
  }
};
