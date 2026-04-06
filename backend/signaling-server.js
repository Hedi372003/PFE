require("dotenv").config();

const realtimeHub = require("./src/realtime/realtime-hub");

const SIGNALING_PORT = Number(process.env.SIGNALING_PORT || 5002);
const SIGNALING_HOST = process.env.SIGNALING_HOST || "0.0.0.0";

realtimeHub.startStandalone({
  port: SIGNALING_PORT,
  host: SIGNALING_HOST,
});

console.log(`Standalone signaling server running on ws://${SIGNALING_HOST}:${SIGNALING_PORT}`);
