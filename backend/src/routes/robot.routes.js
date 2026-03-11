const express = require("express");
const router = express.Router();
const robotController = require("../controllers/robot.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/", robotController.getAllRobots);
router.get("/:id/status", protect, robotController.getRobotControlStatus);
router.post("/", protect, adminOnly, robotController.createRobot);
router.post("/:id/command", protect, robotController.sendRobotCommand);
router.put("/:id", robotController.updateRobot);
router.delete("/:id", robotController.deleteRobot);

module.exports = router;
