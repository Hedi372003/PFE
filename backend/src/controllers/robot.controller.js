const Robot = require("../models/Robot");

/* ================= GET ALL ================= */
exports.getAllRobots = async (req, res) => {
  try {
    const robots = await Robot.find();
    res.json(robots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CREATE ================= */
exports.createRobot = async (req, res) => {
  try {
    const robot = await Robot.create(req.body);
    res.status(201).json(robot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */
exports.updateRobot = async (req, res) => {
  try {
    const robot = await Robot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(robot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
exports.deleteRobot = async (req, res) => {
  try {
    await Robot.findByIdAndDelete(req.params.id);
    res.json({ message: "Robot deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};