const mongoose = require("mongoose");

// create a User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      default: null,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    photo: {
      type: String,
      trim: true,
      default: null,
    },
    role: {
      type: String,
      default: "user",
    },
    address: {
      type: String,
      default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    trash: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
      default: null,
    },
    reference: {
      type: String,
      trim: true,
    },
    commission: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commission",
      },
    ],
    deposit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deposit",
      },
    ],
    totalEarning: [
      {
        name: {
          type: String,
          trim: true,
        },
        amount: {
          type: String,
          trim: true,
        },
        date: {
          type: String,
          trim: true,
        },
      },
    ],
    cashOut: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CashOut",
      },
    ],
    support: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Support",
      },
    ],
    myBalance: {
      type: Number,
      trim: true,
      default: 0,
    },
    myPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
    },
    validityPlan: {
      type: String,
      trim: true,
    },
    PlanPurchaseHistory: [
      {
        name: {
          type: String,
          trim: true,
        },
        amount: {
          type: Number,
          trim: true,
        },
        date: {
          type: String,
          trim: true,
        },
      },
    ],
    refreshToken: {
      type: String,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      trim: true,
    },
    passwordResetToken: {
      type: String,
      default: null,
      trim: true,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// mongoose models
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
