const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const Plan = require("../models/Plan.js");

/**
 * @DESC Plan
 * @ROUTE api/v1/plan
 * @METHOD GET
 * @ACCESS private
 */

const getAllPlan = asyncHandler(async (req, res) => {
  // Get all plans
  const plans = await Plan.find();

  if (plans.length > 0) {
    return res.status(200).json({ plans });
  }
  //response
  res.status(404).json([]);
});

/**
 * @DESC create a new plan
 * @ROUTE api/v1/plan
 * @METHOD POST
 * @ACCESS private
 */

const createPlan = asyncHandler(async (req, res) => {
  const { email } = req.me;

  // Get plan data from request body
  const {
    name,
    price,
    dailyAdvertisement,
    dailyIncome,
    validity,
    parAdsPrice,
  } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new plan document
    const newPlan = new Plan({
      name,
      price,
      dailyAdvertisement,
      dailyIncome,
      validity,
      parAdsPrice,
    });

    // Save the new plan document
    await newPlan.save();

    // // Update the user document to add the new plan reference
    // user.myPlan.push(newPlan._id);

    // await user.save();

    // Optionally, you can respond with the updated user object or just a success message
    res.status(201).json({
      message: "Plan create successful",
      user: user,
    });
  } catch (error) {
    console.error("Error in deposit:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @DESC Delete Single plan
 * @ROUTE api/v1/plan/:id
 * @METHOD Delete
 * @ACCESS public
 */

const deletePlan = asyncHandler(async (req, res) => {
  //get params
  const { id } = req.params;
  //find plan
  const plan = await Plan.findById(id);
  //if plan not available
  if (!plan) {
    throw new Error("Plan Not Found");
  }
  //delate plan
  const planId = await Plan.findByIdAndDelete(id);

  //response
  res.status(200).json({ plan: planId, message: "Plan delete successfully" });
});

/**
 * @DESC Update plan
 * @ROUTE api/v1/plan/:id
 * @METHOD PUT
 * @ACCESS public
 */

const updateSinglePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    name,
    price,
    dailyAdvertisement,
    dailyIncome,
    validity,
    parAdsPrice,
  } = req.body;

  // find plan by id
  const plan = await Plan.findById(id);

  if (!plan) {
    throw new Error("Plan Not Found");
  }

  // Update plan details
  const updatePlan = await Plan.findByIdAndUpdate(
    id,
    {
      name,
      price,
      dailyAdvertisement,
      dailyIncome,
      validity,
      parAdsPrice,
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json({ user: updatePlan, message: "Plan updated successfully" });
});

// export
module.exports = { getAllPlan, createPlan, deletePlan, updateSinglePlan };
