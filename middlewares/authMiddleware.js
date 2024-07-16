const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("../utils/secret.js");
const { isEmail } = require("../helpers/helpers.js");

// create a auth middleware
const authMiddleware = (req, res, next) => {
  // const authHeader = req.headers.authorization || req.headers.Authorization;

  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(400).json({ message: "Unauthorized" });
  }

  // user varifications
  jwt.verify(
    accessToken,
    ACCESS_TOKEN,
    asyncHandler(async (err, decode) => {
      if (err) {
        return res.status(400).json({ message: "Invalid Token" });
      }

      let me = null;

      if (isEmail(decode.email)) {
        me = await User.findOne({ email: decode.email })
          .populate("deposit")
          .populate("commission")
          .populate("cashOut")
          .populate("support")
          .select("-password");
      }

      req.me = me;

      next();
    })
  );
};

//is admin middleware
const isAdmin = (req, res, next) => {
  try {
    //get valid user
    const user = req.me;

    if (!user) {
      throw new Error("Your are not Authorized");
    }
    //check admin
    if (user.role !== "admin") {
      throw new Error("Your Are Not An Admin!");
    } else {
      next();
    }
  } catch (error) {
    // throw new Error(error.message);
    return res.status(400).json({ message: error.message });
  }
};
// export
module.exports = {
  authMiddleware,
  isAdmin,
};
