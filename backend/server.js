require("dotenv").config();
const http = require("http");

const app = require("./src/app");
const prisma = require("./src/config/prisma");
const realtimeHub = require("./src/realtime/realtime-hub");
const { ensureCompanyProfile } = require("./src/services/company.service");

const PORT = process.env.PORT || 5000;
const WS_PATH = process.env.WS_PATH || "/ws";
const SIGNALING_PORT = Number(process.env.SIGNALING_PORT || 5002);
const SIGNALING_HOST = process.env.SIGNALING_HOST || "0.0.0.0";

const server = http.createServer(app);

realtimeHub.attachHttpServer(server, { path: WS_PATH });

prisma.$connect()
  .then(() => {
    return ensureCompanyProfile();
  })
  .then(() => {
    console.log("PostgreSQL connected");
    if (SIGNALING_PORT > 0) {
      realtimeHub.startStandalone({
        port: SIGNALING_PORT,
        host: SIGNALING_HOST,
      });
      console.log(`Realtime signaling server running on ws://${SIGNALING_HOST}:${SIGNALING_PORT}`);
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Integrated websocket path available on ${WS_PATH}`);
    });
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  });

const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);

  try {
    await realtimeHub.close();
    await prisma.$disconnect();
  } catch (error) {
    console.error("Shutdown error:", error);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
