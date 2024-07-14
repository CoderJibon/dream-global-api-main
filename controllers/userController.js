const User = require("../models/User.js");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Plan = require("../models/Plan.js");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN } = require("../utils/secret.js");
const { validationCheck } = require("../middlewares/authMiddleware.js");

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
        console.log(`Successfully deleted previous photo ${user.photo}`);
      } catch (err) {
        console.error(`Error deleting previous photo ${user.photo}:`, err);
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

  console.log(req.me);

  const { newPassword, confPassword } = req.body;

  console.log(req.body);

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User Not Found");
  }

  // Check if new password and confirm password match

  if (newPassword != confPassword) {
    throw new Error("New password and confirm password do not match");
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

//   export
module.exports = {
  getAllUsers,
  getSingleUser,
  deleteSingleUser,
  updateSingleUser,
  userChangePassword,
  userBuyAPlan,
  userEarning,
};
