const mongoose = require("mongoose");

const hisaabSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  encryption: {
    type: Boolean,
    default: false,
  },
  passcode: {
    type: String,
    default: "",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    // required: true, // User ID is required
  },
  shareable: {
    type: Boolean,
    default: false,
  },
  available: {
    type: Boolean,
    default: true,
  },
  editpermissions: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Hisaab = mongoose.model("Hisaab", hisaabSchema);

module.exports = Hisaab;
