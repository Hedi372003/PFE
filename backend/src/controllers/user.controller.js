const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* =========================
   GET ALL USERS
========================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("robotAssigned")
      .select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET ONE USER
========================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("robotAssigned")
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   CREATE USER (ADMIN ONLY)
========================= */
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const { name, email, password, role, robotAssigned } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      robotAssigned
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   UPDATE USER
========================= */
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const updates = { ...req.body };

    // Si password est modifié → le re-hasher
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* =========================
   DELETE USER
========================= */
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
