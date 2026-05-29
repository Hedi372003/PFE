const dashboardService = require("../services/dashboard.service");

exports.getCommunicationStats = async (req, res) => {
  try {
    const stats = await dashboardService.getCommunicationStats(req.query.period);
    return res.json(stats);
  } catch (error) {
    console.error("getCommunicationStats error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};
