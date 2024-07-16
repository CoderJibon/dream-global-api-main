const express = require("express");

const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");
const {
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  userChangePassword,
  userBuyAPlan,
  userEarning,
  checkClickAdToken,
  getAllClickAd,
} = require("../controllers/userController.js");
const { userMulter } = require("../utils/multer.js");

//express init
const userRoute = express.Router();

//create routes
userRoute.route("/all").get(authMiddleware, isAdmin, getAllUsers);
userRoute.route("/getAllClickAd").get(authMiddleware, getAllClickAd);
userRoute.route("/changeUserPassword").put(authMiddleware, userChangePassword);
userRoute.route("/buyPlan").post(authMiddleware, userBuyAPlan);
userRoute.route("/userEarning").post(authMiddleware, userEarning);
userRoute.route("/checkClickAdToken").put(authMiddleware, checkClickAdToken);
userRoute.route("/:id").get(authMiddleware, getSingleUser);
userRoute.route("/:id").delete(authMiddleware, isAdmin, deleteSingleUser);
userRoute.route("/:id").put(authMiddleware, userMulter, updateSingleUser);

// export
module.exports = userRoute;
