const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  deposit,
  updateStatus,
  getAllDeposit,
} = require("../controllers/depositControllers.js");

//express init
const depositRoute = express.Router();

//create routes
depositRoute.route("/").get(authMiddleware, getAllDeposit);
depositRoute.route("/").post(authMiddleware, deposit);
depositRoute.route("/status/:id").patch(authMiddleware, isAdmin, updateStatus);

// export
module.exports = depositRoute;
