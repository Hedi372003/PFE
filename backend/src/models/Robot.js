const mongoose = require("mongoose");

const robotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  robotId: { type: String, required: true, unique: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: {
    type: String,
    enum: ["online", "offline", "maintenance"],
    default: "offline",
  },
}, { timestamps: true });

module.exports = mongoose.model("Robot", robotSchema);