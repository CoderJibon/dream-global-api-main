const mongoose = require("mongoose");

// create a Plan Schema
const workSchema = new mongoose.Schema(
  {
    name: {
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
module.exports = mongoose.models.Work || mongoose.model("Work", workSchema);
