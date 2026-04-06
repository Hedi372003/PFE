const prisma = require("../config/prisma");
const realtimeHub = require("../realtime/realtime-hub");

const DEFAULT_LIMIT = 50;

const mapNotification = (notification, userId) => {
  const readReceipt = Array.isArray(notification.readReceipts)
    ? notification.readReceipts.find((receipt) => receipt.userId === userId)
    : null;

  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    kind: notification.kind,
    priority: notification.priority,
    targetRole: notification.targetRole || null,
    targetUserId: notification.targetUserId || null,
    metadata: notification.metadata || null,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    read: Boolean(readReceipt),
    readAt: readReceipt?.readAt || null,
  };
};

function buildAudienceFilter(user) {
  return {
    OR: [
      { targetUserId: user.id },
      { targetRole: user.role },
      {
        AND: [
          { targetUserId: null },
          { targetRole: null },
        ],
      },
    ],
  };
}

async function createNotification(input) {
  const title = String(input.title || "").trim();
  const body = String(input.body || "").trim();

  if (!title || !body) {
    throw new Error("title and body are required");
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      body,
      kind: String(input.kind || "system").trim(),
      priority: String(input.priority || "info").trim(),
      targetRole: input.targetRole ? String(input.targetRole).trim() : null,
      targetUserId: input.targetUserId ? String(input.targetUserId).trim() : null,
      metadata: input.metadata || null,
    },
    include: {
      readReceipts: true,
    },
  });

  const mappedNotification = mapNotification(notification, null);
  realtimeHub.broadcastNotification(mappedNotification);
  return mappedNotification;
}

async function safeCreateNotification(input) {
  try {
    return await createNotification(input);
  } catch (error) {
    console.error("safeCreateNotification error:", error);
    return null;
  }
}

async function listNotificationsForUser(user, options = {}) {
  const limit = Number(options.limit) > 0 ? Number(options.limit) : DEFAULT_LIMIT;
  const unreadOnly = options.unreadOnly === true || options.unreadOnly === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      ...buildAudienceFilter(user),
      ...(unreadOnly
        ? {
            readReceipts: {
              none: {
                userId: user.id,
              },
            },
          }
        : {}),
    },
    include: {
      readReceipts: {
        where: { userId: user.id },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications.map((notification) => mapNotification(notification, user.id));
}

async function markNotificationAsRead(notificationId, userId) {
  await prisma.notification.findUniqueOrThrow({
    where: { id: notificationId },
    select: { id: true },
  });

  await prisma.notificationReadReceipt.upsert({
    where: {
      notificationId_userId: {
        notificationId,
        userId,
      },
    },
    update: {
      readAt: new Date(),
    },
    create: {
      notificationId,
      userId,
    },
  });

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      readReceipts: {
        where: { userId },
      },
    },
  });

  return mapNotification(notification, userId);
}

async function markAllNotificationsAsRead(user) {
  const notifications = await prisma.notification.findMany({
    where: buildAudienceFilter(user),
    select: { id: true },
  });

  if (notifications.length === 0) {
    return { updatedCount: 0 };
  }

  await prisma.$transaction(
    notifications.map((notification) =>
      prisma.notificationReadReceipt.upsert({
        where: {
          notificationId_userId: {
            notificationId: notification.id,
            userId: user.id,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          notificationId: notification.id,
          userId: user.id,
        },
      }),
    ),
  );

  return { updatedCount: notifications.length };
}

module.exports = {
  createNotification,
  safeCreateNotification,
  listNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
