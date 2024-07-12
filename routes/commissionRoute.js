const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  getAllCommission,
  updateCommission,
} = require("../controllers/commissionController.js");

//express init
const commissionRoute = express.Router();

//create routes

commissionRoute.route("/").get(authMiddleware, isAdmin, getAllCommission);
commissionRoute.route("/:id").put(authMiddleware, isAdmin, updateCommission);

// export
module.exports = commissionRoute;
