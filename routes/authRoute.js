const express = require("express");
const {
  userRegistration,
  accountVerificationByURL,
  userLogin,
  resendAccountVerification,
  userLogout,
  adminLogin,
  loggedInUser,
  loggedInAdmin,
  resetPassword,
  forgotPass,
} = require("../controllers/authControllers.js");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware.js");

//express init
const authRoute = express.Router();

//create routes
authRoute.route("/register").post(userRegistration);
authRoute.route("/register/:ref").post(userRegistration);
authRoute.route("/login").post(userLogin);
authRoute.route("/admin").post(adminLogin);
authRoute.route("/logOut").get(authMiddleware, userLogout);
authRoute.route("/login/:token").get(accountVerificationByURL);
authRoute.route("/resendToken").post(resendAccountVerification);
authRoute.route("/forgotPass").post(forgotPass);

authRoute.route("/resetPass/:token").post(resetPassword);


authRoute.route("/loggedInUser").get(authMiddleware, loggedInUser);
authRoute.route("/loggedInAdmin").get(authMiddleware, isAdmin, loggedInAdmin);

// export
module.exports = authRoute;
