const prisma = require("../config/prisma");
const notificationService = require("../services/notification.service");

const mapRequest = (request) => ({
    id: request.id,
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    phone: request.phone,
    message: request.message || request.robotId || "",
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
});

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    return res.json(requests.map(mapRequest));
  } catch (error) {
    console.error("getPendingRequests error:", error);
    return res.status(500).json({ message: "Failed to fetch requests" });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    const normalizedMessage = String(message || "").trim();

    if (!firstName || !lastName || !email || !phone || !normalizedMessage) {
      return res.status(400).json({
        message: "firstName, lastName, email, phone and message are required",
      });
    }

    const request = await prisma.request.create({
      data: {
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        message: normalizedMessage,
        status: "approved",
      },
    });

    await notificationService.safeCreateNotification({
      title: "Visitor request auto-approved",
      body: `${request.firstName} ${request.lastName} submitted a telepresence access request and it was approved automatically.`,
      kind: "visitor",
      priority: "success",
      targetRole: "admin",
      metadata: {
        requestId: request.id,
        email: request.email,
      },
    });

    return res.status(201).json(mapRequest(request));
  } catch (error) {
    console.error("createRequest error:", error);
    return res.status(500).json({ message: "Failed to create request" });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status === "approved") {
      return res.status(200).json({
        message: "Request already approved",
        request: mapRequest(request),
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: request.id },
      data: { status: "approved" },
    });

    await notificationService.safeCreateNotification({
      title: "Visitor request approved",
      body: `${updatedRequest.firstName} ${updatedRequest.lastName} is now approved for telepresence access.`,
      kind: "visitor",
      priority: "success",
      targetRole: "admin",
      metadata: {
        requestId: updatedRequest.id,
        email: updatedRequest.email,
      },
    });

    return res.status(200).json({
      message: "Request approved",
      request: mapRequest(updatedRequest),
    });
  } catch (error) {
    console.error("approveRequest error:", error);
    return res.status(500).json({ message: "Failed to approve request" });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: req.params.id },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const updatedRequest = await prisma.request.update({
      where: { id: req.params.id },
      data: { status: "rejected" },
    });

    await notificationService.safeCreateNotification({
      title: "Visitor request rejected",
      body: `${updatedRequest.firstName} ${updatedRequest.lastName} request was rejected.`,
      kind: "visitor",
      priority: "info",
      targetRole: "admin",
      metadata: {
        requestId: updatedRequest.id,
        email: updatedRequest.email,
      },
    });

    return res.status(200).json(mapRequest(updatedRequest));
  } catch (error) {
    console.error("rejectRequest error:", error);
    return res.status(500).json({ message: "Failed to reject request" });
  }
};
