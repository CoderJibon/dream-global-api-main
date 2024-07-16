const mongoose = require("mongoose");

// create a ClickAd Schema
const clickAdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    adID: {
      type: String,
      trim: true,
      required: true,
    },
    Email: {
      type: String,
      trim: true,
      required: true,
    },
    token24h: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// mongoose models
module.exports =
  mongoose.models.ClickAd || mongoose.model("ClickAd", clickAdSchema);
