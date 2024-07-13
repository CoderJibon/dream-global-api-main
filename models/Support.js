const mongoose = require("mongoose");

// create a Plan Schema
const supportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    subject: {
      type: String,
      trim: true,
      required: true,
    },
    Priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "High",
    },
    Message: {
      type: String,
      trim: true,
      required: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// mongoose models
module.exports =
  mongoose.models.Support || mongoose.model("Support", supportSchema);
