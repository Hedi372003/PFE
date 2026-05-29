const prisma = require("../config/prisma");

const VALID_PERIODS = new Set(["day", "week", "month", "year"]);

function getPeriodStart(period) {
  const now = new Date();
  const normalizedPeriod = VALID_PERIODS.has(period) ? period : "week";

  if (normalizedPeriod === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (normalizedPeriod === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (normalizedPeriod === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

async function getCommunicationStats(period) {
  const createdAtFilter = {
    gte: getPeriodStart(period),
  };

  const [calls, conversations, requests] = await Promise.all([
    prisma.callSession.count({
      where: {
        createdAt: createdAtFilter,
      },
    }),
    prisma.callMessage.count({
      where: {
        createdAt: createdAtFilter,
      },
    }),
    prisma.request.count({
      where: {
        createdAt: createdAtFilter,
      },
    }),
  ]);

  return {
    calls,
    conversations,
    requests,
  };
}

module.exports = {
  getCommunicationStats,
};
