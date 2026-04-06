const express = require("express");

const { protect } = require("../middlewares/auth.middleware");
const callService = require("../services/call.service");

const router = express.Router();

router.get("/state", (req, res) => {
  return res.json(callService.getCallState());
});

router.post("/reset", protect, (req, res) => {
  return res.json(callService.resetCallState());
});

module.exports = router;
