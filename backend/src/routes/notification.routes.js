const express = require("express");

const { protect, adminOnly } = require("../middlewares/auth.middleware");
const {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", protect, getNotifications);
router.post("/", protect, adminOnly, createNotification);
router.post("/read-all", protect, markAllNotificationsAsRead);
router.post("/:id/read", protect, markNotificationAsRead);

module.exports = router;
