const mongoose = require("mongoose");

// create a cashOut Schema
const cashOutSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      trim: true,
      required: true,
    },
    method: {
      type: String,
      trim: true,
      required: true,
    },
    accountNumber: {
      type: String,
      trim: true,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      required: true,
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
  mongoose.models.CashOut || mongoose.model("CashOut", cashOutSchema);
