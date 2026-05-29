const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const robotRoutes = require("./routes/robot.routes");
const requestRoutes = require("./routes/request.routes");
const cmsRoutes = require("./routes/cms.routes");
const notificationRoutes = require("./routes/notification.routes");
const callRoutes = require("./routes/call.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllCorsOrigins = corsOrigins.includes("*");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowAllCorsOrigins || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/robots", robotRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
