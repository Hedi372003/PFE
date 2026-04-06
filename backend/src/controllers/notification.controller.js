const notificationService = require("../services/notification.service");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.listNotificationsForUser(req.user, {
      limit: req.query.limit,
      unreadOnly: req.query.unreadOnly,
    });

    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, body, kind, priority, targetRole, targetUserId, metadata } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "title and body are required" });
    }

    const notification = await notificationService.createNotification({
      title,
      body,
      kind,
      priority,
      targetRole,
      targetUserId,
      metadata,
    });

    return res.status(201).json(notification);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to create notification" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markNotificationAsRead(req.params.id, req.user.id);
    return res.json(notification);
  } catch (error) {
    return res.status(404).json({ message: "Notification not found" });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
