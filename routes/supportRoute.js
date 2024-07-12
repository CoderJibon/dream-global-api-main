const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  getAllSupport,
  createSupport,
  updateSupportStatus,
} = require("../controllers/supportControllers.js");
const { supportMulter } = require("../utils/multer.js");

//express init
const supportRoute = express.Router();

//create routes
supportRoute.route("/").get(authMiddleware, getAllSupport);
supportRoute.route("/").post(authMiddleware, supportMulter, createSupport);
supportRoute.route("/status/:id").patch(authMiddleware, isAdmin, updateSupportStatus);

// export
module.exports = supportRoute;
