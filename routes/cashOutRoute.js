const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const { getAllCashOut, cashOut, updateCashOutStatus } = require("../controllers/cashOutControllers.js");

//express init
const cashOutRoute = express.Router();

//create routes
cashOutRoute.route("/").get(authMiddleware, getAllCashOut);
cashOutRoute.route("/").post(authMiddleware, cashOut);
cashOutRoute.route("/status/:id").patch(authMiddleware, isAdmin, updateCashOutStatus);

// export
module.exports = cashOutRoute;
