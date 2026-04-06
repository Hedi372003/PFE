const companyService = require("../services/company.service");
const notificationService = require("../services/notification.service");

exports.getCompanyProfile = async (req, res) => {
  try {
    const profile = await companyService.getCompanyProfile();
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch company profile" });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  try {
    const profile = await companyService.updateCompanyProfile(req.body);

    await notificationService.safeCreateNotification({
      title: "Company content updated",
      body: `${profile.name} CMS content was updated by an administrator.`,
      kind: "system",
      priority: "info",
      targetRole: "admin",
      metadata: {
        profileId: profile.id,
      },
    });

    return res.json(profile);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to update company profile" });
  }
};
