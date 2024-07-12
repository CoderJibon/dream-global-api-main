const mongoose = require("mongoose");

// create a User Schema
const commissionSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      trim: true,
    },
    newUser: {
      type: String,
      trim: true,
    },
    commission: {
      type: Number,
      trim: true,
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
  mongoose.models.Commission || mongoose.model("Commission", commissionSchema);
