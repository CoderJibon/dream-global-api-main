const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  getAllWork,
  createWork,
  deleteWork,
  updateSingleWork,
} = require("../controllers/workController.js");

//express init
const workRoute = express.Router();

//create routes
workRoute.route("/").get(authMiddleware, getAllWork);
workRoute.route("/").post(authMiddleware, isAdmin, createWork);
workRoute.route("/:id").delete(authMiddleware, isAdmin, deleteWork);
workRoute.route("/:id").put(authMiddleware, isAdmin, updateSingleWork);

// export
module.exports = workRoute;
