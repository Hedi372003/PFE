const express = require("express");
const router = express.Router();
const robotController = require("../controllers/robot.controller");

router.get("/", robotController.getAllRobots);
router.post("/", robotController.createRobot);
router.put("/:id", robotController.updateRobot);
router.delete("/:id", robotController.deleteRobot);

module.exports = router;