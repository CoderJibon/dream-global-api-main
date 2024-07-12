const mongoose = require("mongoose");

// create a Deposit Schema
const DepositSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      trim: true,
      required: true,
    },
    transactionID: {
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
  mongoose.models.Deposit || mongoose.model("Deposit", DepositSchema);
