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
        me = await User.findOne({ email: decode.email }).select("-password");
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

// buy plan validation check

// const validationCheck = async (req, res, next) => {
//   try {
//     const user = req.me;

//     if (!user) {
//       throw new Error("You are not Authorized");
//     }

//     if (user.validityPlan) {
//       // Verify the validity of the plan
//       jwt.verify(user.validityPlan, ACCESS_TOKEN, async (err, decoded) => {
//         if (err) {
//           // Plan has expired or verification failed
//           user.myPlan = null;
//           user.validityPlan = null;
//           await user.save();
//         }
//         // Continue to next middleware or route handler
//         next();
//       });
//     } else {
//       // If no validityPlan exists, continue to next middleware or route handler
//       next();
//     }
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// };

// export
module.exports = {
  authMiddleware,
  isAdmin,
};
