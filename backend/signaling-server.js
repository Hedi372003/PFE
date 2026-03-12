const WebSocket = require("ws");

const PORT = 5002;

/* WebSocket server accessible depuis le réseau */

const wss = new WebSocket.Server({
  port: PORT,
  host: "0.0.0.0"
});

console.log(`WebRTC Signaling Server running on port ${PORT}`);

let operator = null;
let robot = null;

wss.on("connection", (ws) => {

  console.log("New client connected");

  ws.on("message", (message) => {

    try {

      const data = JSON.parse(message);

      /* REGISTER CLIENT TYPE */

      if (data.type === "operator") {

        operator = ws;
        console.log("Operator connected");

        return;

      }

      if (data.type === "robot") {

        robot = ws;
        console.log("Robot connected");

        return;

      }

      /* WEBRTC OFFER */

      if (data.type === "offer" && robot) {

        console.log("Forwarding offer to robot");

        robot.send(JSON.stringify(data));

        return;

      }

      /* WEBRTC ANSWER */

      if (data.type === "answer" && operator) {

        console.log("Forwarding answer to operator");

        operator.send(JSON.stringify(data));

        return;

      }

      /* ICE CANDIDATES */

      if (data.type === "candidate") {

        if (ws === operator && robot) {

          robot.send(JSON.stringify(data));

        }

        else if (ws === robot && operator) {

          operator.send(JSON.stringify(data));

        }

        return;

      }

      /* ROBOT COMMANDS */

      if (data.type === "command" && robot) {

        console.log("Robot command:", data.command);

        robot.send(JSON.stringify(data));

        return;

      }

    } catch (err) {

      console.error("Invalid message received:", err);

    }

  });

  ws.on("close", () => {

    console.log("Client disconnected");

    if (ws === operator) {

      operator = null;
      console.log("Operator disconnected");

    }

    if (ws === robot) {

      robot = null;
      console.log("Robot disconnected");

    }

  });

  ws.on("error", (error) => {

    console.error("WebSocket error:", error);

  });

});