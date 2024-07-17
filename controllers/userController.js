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
const ClickAd = require("../models/ClickAd.js");
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
      } catch (err) {}
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
  if (myBalance < findPlan.price) {
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
  try {
    const { email, myBalance } = req.me;
    const { name, id } = req.body;

    const user = await User.findOne({ email }).populate("myPlan");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Verify the validity of the plan
    jwt.verify(user.validityPlan, ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        user.myPlan = null;
        user.validityPlan = null;
      }
    });

    // Check if user has a plan
    if (!user.myPlan) {
      return res.status(400).json({ message: "Opps! You have no plan." });
    }

    // Check if plan has ads price
    if (!user.myPlan.parAdsPrice) {
      return res.status(500).json({ message: "Server Error try again!" });
    }

    const work = await Work.findById(id);
    if (!work) {
      return res.status(404).json({ message: "No work found" });
    }

    // Check if ad is a valid token
    const findAds = await ClickAd.findOne({
      adID: { $eq: id },
      Email: { $eq: email },
    });

    if (findAds) {
      // Verify the validity of the plan
      jwt.verify(findAds.token24h, ACCESS_TOKEN, async (err, decoded) => {
        if (err) {
          await ClickAd.deleteOne({
            adID: { $eq: id },
            Email: { $eq: email },
          });
        }
        if (decoded) {
          return res
            .status(400)
            .json({ message: "You have already taken in!" });
        }
      });
    }

    // Generate new expiration token
    const token24 = jwt.sign({ email }, ACCESS_TOKEN, { expiresIn: "24h" });

    // Create new ad token entry
    const ads = await ClickAd.create({
      adID: work.id,
      name: work.name,
      token24h: token24,
      Email: email,
    });

    // Update user balance
    user.myBalance = myBalance + user.myPlan.parAdsPrice;

    // Add to total earning history
    user.totalEarning.push({
      name: name,
      amount: user.myPlan.parAdsPrice,
      date: new Date(),
    });

    // Save user data
    await user.save();

    res.status(200).json({
      message: `Congratulations! You earned ${user.myPlan.parAdsPrice}`,
      earn: user.myPlan.parAdsPrice,
      totalEarning: user.totalEarning,
      ads: ads,
    });
  } catch (error) {
    throw new Error("Server error");
  }
});

/**
 * @DESC get all ClickAd
 * @ROUTE api/v1/user/getAllClickAd
 * @METHOD get
 * @ACCESS private
 */

const getAllClickAd = asyncHandler(async (req, res) => {
  try {
    const { email } = req.me;
    const findAds = await ClickAd.find({ Email: email });
    //if get all users
    if (findAds.length > 0) {
      return res.status(200).json({ clickAds: findAds });
    }
    //response
    res.status(200).json({ clickAds: [] });
  } catch (error) {
    throw new Error("Server error");
  }
});

/**
 * @DESC checkClickAdToken
 * @ROUTE api/v1/user/checkClickAdToken
 * @METHOD put
 * @ACCESS private
 */
const checkClickAdToken = asyncHandler(async (req, res) => {
  try {
    const { email } = req.me;
    const { data } = req.body;
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let deleteData = null;
    // check valid token
    if (data.length > 0) {
      for (const ad of data) {
        const dataAd = await ClickAd.findOne({
          adID: { $eq: ad.adID },
          Email: { $eq: email },
        });
        if (dataAd) {
          // Verify the validity of the plan
          jwt.verify(dataAd.token24h, ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
              deleteData = await ClickAd.findOneAndDelete({
                adID: { $eq: dataAd.adID },
                Email: { $eq: email },
              });
            }
          });
        }
      }
    }

    // Token valid, return success message
    if (deleteData) {
      return res.status(200).json({
        message: "delete data",
        ads: deleteData,
      });
    }
    return res.status(404).json({
      message: "Not found",
    });
  } catch (error) {
    throw new Error("Server error");
  }
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
  checkClickAdToken,
  getAllClickAd,
};
