const User = require("../models/User.js");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Plan = require("../models/Plan.js");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("../utils/secret.js");
// const { validationCheck } = require("../middlewares/authMiddleware.js");
const Work = require("../models/Work.js");
const { default: mongoose } = require("mongoose");
/**
 * @DESC Get all users
 * @ROUTE /api/v1/user/all
 * @METHOD GET
 * @ACCESS public
 */

const getAllUsers = asyncHandler(async (req, res) => {
  // Get all users
  const users = await User.find()
    .select("-password")
    .populate("deposit")
    .populate("cashOut")
    .populate("support")
    .populate("myPlan");
  //if get all users
  if (users.length > 0) {
    return res.status(200).json({ users });
  }
  //response
  res.status(404).json([]);
});

/**
 * @DESC Get Single User
 * @ROUTE api/v1/user/:id
 * @METHOD Get
 * @ACCESS public
 */

const getSingleUser = asyncHandler(async (req, res) => {
  //get params
  const { id } = req.params;
  //find user
  const user = await User.findById(id)
    .populate("deposit")
    .populate("cashOut")
    .populate("support")
    .populate("myPlan");
  //if user not available
  if (!user) {
    throw new Error("User Not Found");
  }
  //response
  res.status(200).json({ user });
});

/**
 * @DESC Delete Single User
 * @ROUTE api/v1/user/:id
 * @METHOD Delete
 * @ACCESS public
 */

const deleteSingleUser = asyncHandler(async (req, res) => {
  //get params
  const { id } = req.params;
  //find user
  const user = await User.findById(id);
  //if user not available
  if (!user) {
    throw new Error("User Not Found");
  }
  //delate user
  const userId = await User.findByIdAndDelete(id);

  //response
  res.status(200).json({ user: userId, message: "User delete successfully" });
});

/**
 * @DESC Update Single User
 * @ROUTE api/v1/user/:id
 * @METHOD PUT
 * @ACCESS public
 */

const updateSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name, address, mobile } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User Not Found");
  }

  // Update user details
  const updateUser = await User.findByIdAndUpdate(
    id,
    {
      name,
      mobile,
      address,
    },
    {
      new: true,
    }
  );

  // Handle photo upload if any
  if (req.file) {
    // Delete previous photo if exists
    if (user.photo) {
      const imagePath = path.join(
        __dirname,
        `../public/UsersPhoto/${user.photo}`
      );
      try {
        fs.unlinkSync(imagePath);
        //console.log(`Successfully deleted previous photo ${user.photo}`);
      } catch (err) {
        //console.error(`Error deleting previous photo ${user.photo}:`, err);
      }
    }
    // Update user with new photo filename
    updateUser.photo = req.file.filename;
    await updateUser.save();
  }

  res
    .status(200)
    .json({ user: updateUser, message: "User updated successfully" });
});

/**
 * @DESC change password
 * @ROUTE api/v1/user/changeUserPassword
 * @METHOD PUT
 * @ACCESS public
 */

const userChangePassword = asyncHandler(async (req, res) => {
  const { email } = req.me;

  const { oldPassword, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User Not Found");
  }

  // password check
  const passwordCheck = await bcrypt.compare(oldPassword, user?.password);

  // password check
  if (!passwordCheck) {
    return res.status(404).json({ message: "Old Password is Wrong" });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password
  user.password = hashedPassword;

  await user.save();

  res.status(200).json({ message: "Password updated" });
});

/**
 * @DESC buy a plan
 * @ROUTE api/v1/user/buyPlan
 * @METHOD POST
 * @ACCESS public
 */

const userBuyAPlan = asyncHandler(async (req, res) => {
  const { email, myBalance } = req.me;
  const { plan } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  // Plan validation check
  if (user.validityPlan) {
    jwt.verify(user.validityPlan, ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        // Plan has expired or verification failed
        user.myPlan = null;
        user.validityPlan = null;
      }
    });
  }

  // Check if user already has a plan assigned
  if (user.myPlan) {
    res.status(400);
    throw new Error("You Have Already Purchased a Plan");
  }

  const findPlan = await Plan.findById({ _id: plan });
  if (!findPlan) {
    res.status(404);
    throw new Error("Plan Is Not Available");
  }

  // Check if user has enough balance
  if (myBalance <= findPlan.price) {
    res.status(404);
    throw new Error("Insufficient Balance");
  }

  // Update user balance
  user.myBalance = myBalance - findPlan.price;

  //Assign the plan to the user
  user.myPlan = findPlan._id;

  const validityDays = user.myPlan?.validity || 1;
  const expirationSeconds = validityDays * 24 * 60 * 60;

  // Check validity
  const validation = jwt.sign({ email: email }, ACCESS_TOKEN, {
    expiresIn: expirationSeconds,
  });

  user.validityPlan = validation;

  // Save user with updated balance and assigned plan
  await user.save();

  // Prepare response object with populated plan information
  const updateUser = await User.findById(user._id).populate("myPlan");

  // Add plan to user's purchase history
  const newPurchaseHistory = {
    name: findPlan?.name,
    amount: findPlan?.price,
    date: new Date(),
  };

  // Add purchase history to user's purchase history array
  user.PlanPurchaseHistory.push(newPurchaseHistory);
  await user.save();

  res
    .status(200)
    .json({ message: "Plan bought successfully", plan: updateUser });
});

/**
 * @DESC USER EARNING
 * @ROUTE api/v1/user/userEarning
 * @METHOD POST
 * @ACCESS public
 */

const userEarning = asyncHandler(async (req, res) => {
  const { email, myBalance } = req.me;

  const { name } = req.body;

  const user = await User.findOne({ email }).populate("myPlan");

  if (!user) {
    throw new Error("User Not Found");
  }

  jwt.verify(user.validityPlan, ACCESS_TOKEN, async (err, decoded) => {
    if (err) {
      // Plan has expired or verification failed
      user.myPlan = null;
      user.validityPlan = null;
    }
  });

  // check if plan is not available
  if (!user.myPlan) {
    throw new Error("Opps! You have no plan.");
  }
  if (!user.myPlan?.parAdsPrice) {
    throw new Error("Server Error try to again!");
  }
  // amount update
  user.myBalance = myBalance + user.myPlan?.parAdsPrice;

  // total earning history
  user.totalEarning.push({
    name: name,
    amount: user.myPlan?.parAdsPrice,
    date: new Date(),
  });

  await user.save();

  res.status(200).json({
    message: `Congratulation You Earn ${user.myPlan?.parAdsPrice}`,
    earn: user.myPlan?.parAdsPrice,
    totalEarning: user.totalEarning,
  });
});

const getAllTimestamp = asyncHandler(async (req, res) => {
  const { email } = req.me;
  // Get all users
  const user = await User.findOne({ email: email });
  //if get all users
  if (user.Timestamp24.length > 0) {
    return res.status(200).json({ Timestamp24: user.Timestamp24 });
  }
  //response
  res.status(404).json({ Timestamp24: [] });
});

/**
 * @DESC updateTimestamp
 * @ROUTE api/v1/user/updateTimestamp
 * @METHOD put
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */
const updateTimestamp = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    const { email } = req.me;

    const work = await Work.findById(id);
    if (!work) {
      return res.status(404).json({ message: "No work found" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    //is have to
    if (user.Timestamp24.length > 0) {
      const findAdId = user.Timestamp24.find((ad) => ad.adID == id);
      if (findAdId) {
        try {
          const havetoken = jwt.verify(findAdId.token24h, ACCESS_TOKEN);
          if (havetoken) {
            return res
              .status(400)
              .json({ message: "You have already taken in" });
          }
        } catch (error) {
          if (error) {
            user.Timestamp24 = user.Timestamp24.filter((ad) => ad.adID !== id);
            await user.save();
          }
        }
      }
    }
    const token24 = jwt.sign({ email }, ACCESS_TOKEN, {
      expiresIn: "1m",
    });

    const time = {
      adID: work.id,
      addName: work.name,
      token24h: token24,
    };

    user.Timestamp24.push(time);
    await user.save();

    res.status(200).json({ time });
  } catch (error) {
    if (error instanceof mongoose.Error.VersionError) {
      // Handle version error (optional retry logic)
      throw new Error("Server error");
    }

    throw new Error("Server error");
  }
});

/**
 * @DESC getTimestamp
 * @ROUTE api/v1/getTimestamp/:token
 * @METHOD GET
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */
const getTimestamp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.me;
    const { token } = req.params;
    console.log(token);
    // Find the user
    const user = await User.findOne({ email });
    const getUser = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    jwt.verify(token, ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          // Token expired, remove it from user's Timestamp24
          user.Timestamp24 = user.Timestamp24.filter(
            (ad) => ad.token24h !== token
          );

          // Save the updated user document
          await User.findByIdAndUpdate(
            user._id,
            {
              Timestamp24: user.Timestamp24,
            },
            {
              new: true,
            }
          );

          // Return the updated Timestamp24
          return res.status(200).json({ Timestamp24: getUser.Timestamp24 });
        }
      }
    });
    // Token valid, return success message or additional data if needed
    return res.status(200).json({
      message: "Timestamp verified",
      Timestamp24: user.Timestamp24,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = {
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  userChangePassword,
  userBuyAPlan,
  userEarning,
  updateTimestamp,
  getTimestamp,
};

//   export
module.exports = {
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  userChangePassword,
  userBuyAPlan,
  userEarning,
  updateTimestamp,
  getTimestamp,
  getAllTimestamp,
};
