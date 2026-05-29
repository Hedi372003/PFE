const express = require("express");

const { getCommunicationStats } = require("../controllers/dashboard.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/communication-stats", protect, adminOnly, getCommunicationStats);

module.exports = router;
