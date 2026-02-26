const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
// 1. AJOUTE CETTE LIGNE ICI
const robotRoutes = require("./routes/robot.routes"); 

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Vérifie que ton Vite tourne bien sur ce port
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// 2. AJOUTE CETTE LIGNE ICI
app.use("/api/robots", robotRoutes); 

module.exports = app;