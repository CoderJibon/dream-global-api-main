const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  getAllPlan,
  createPlan,
  deletePlan,
  updateSinglePlan,
} = require("../controllers/planController.js");

//express init
const planRoute = express.Router();

//create routes
planRoute.route("/").get(authMiddleware, getAllPlan);
planRoute.route("/").post(authMiddleware, isAdmin, createPlan);
planRoute.route("/:id").delete(authMiddleware, isAdmin, deletePlan);
planRoute.route("/:id").put(authMiddleware, isAdmin, updateSinglePlan);

// export
module.exports = planRoute;
