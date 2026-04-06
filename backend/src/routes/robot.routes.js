const express = require("express");
const router = express.Router();
const robotController = require("../controllers/robot.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.get("/", robotController.getAllRobots);
router.post("/", protect, adminOnly, robotController.createRobot);
router.put("/:id", protect, adminOnly, robotController.updateRobot);
router.delete("/:id", protect, adminOnly, robotController.deleteRobot);

module.exports = router;
