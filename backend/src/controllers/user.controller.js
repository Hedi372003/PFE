const bcrypt = require("bcryptjs");
const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");

const selectWithoutPassword = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  robotId: true,
  isActive: true,
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
  isActive: user.isActive,
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

const buildDeletedEmail = (email) => `deleted_${Date.now()}_${email}`;

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

    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      select: { id: true, isActive: true, email: true },
    });

    if (existingUser && existingUser.isActive) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Backward-compatible fix: archive inactive duplicate email before create.
    if (existingUser && !existingUser.isActive) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { email: buildDeletedEmail(existingUser.email) },
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
        isActive: true,
      },
      select: selectWithoutPassword,
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
      where: { isActive: true },
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
      where: { id: req.params.id, isActive: true },
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
    const { firstName, lastName, phone, robotId, password, robotAssigned } = req.body;
    const data = {};

    if (firstName !== undefined) data.firstName = String(firstName).trim();
    if (lastName !== undefined) data.lastName = String(lastName).trim();
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
      where: { id: req.params.id, isActive: true },
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
    const existing = await prisma.user.findFirst({
      where: { id: req.params.id, isActive: true },
      select: { id: true, email: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const archivedEmail = buildDeletedEmail(existing.email);

    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email: archivedEmail,
        isActive: false,
      },
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
