const mongoose = require("mongoose");

// create a Plan Schema
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    dailyAdvertisement: {
      type: Number,
      trim: true,
      required: true,
    },
    dailyIncome: {
      type: Number,
      trim: true,
      required: true,
    },
    validity: {
      type: Number,
      trim: true,
      required: true,
    },
    parAdsPrice: {
      type: Number,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// mongoose models
module.exports = mongoose.models.Plan || mongoose.model("Plan", planSchema);
