const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: String,
    enum: ["admin", "operator"],
    default: "operator"
  },
  robotAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Robot"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
