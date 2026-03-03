const express = require("express");
const router = express.Router();

const {
  getPendingRequests,
  createRequest,
  approveRequest,
  rejectRequest,
} = require("../controllers/request.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

router.post("/", createRequest);
router.get("/", protect, adminOnly, getPendingRequests);
router.put("/:id/approve", protect, adminOnly, approveRequest);
router.put("/:id/reject", protect, adminOnly, rejectRequest);

module.exports = router;