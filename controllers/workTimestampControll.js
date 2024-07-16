const asyncHandler = require("express-async-handler");
const workTimestamp = require("../models/workTimestamp.js");
const Work = require("../models/Work.js");

// export
module.exports = {
  updateTimestamp,
  getTimestamp,
};
