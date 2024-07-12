const asyncHandler = require("express-async-handler");
const Commission = require("../models/Commission.js");
const User = require("../models/User.js");

/**
 * @DESC Get all commissions
 * @ROUTE /api/v1/commission
 * @METHOD GET
 * @ACCESS public
 */

const getAllCommission = asyncHandler(async (req, res) => {
  // Get all commissions
  const commissions = await Commission.find();
  //if get all commissions
  if (commissions.length > 0) {
    return res.status(200).json({ commissions });
  }
  //response
  res.status(404).json([]);
});

/**
 * @DESC update commissions
 * @ROUTE /api/v1/commission
 * @METHOD PUT
 * @ACCESS public
 */

const updateCommission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reference, commission, status } = req.body;

  if (!reference || !commission) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find user by userName
    const users = await User.find({ userName: reference });

    // Check if user exists
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0]; // Assuming there is only one user with the given username

    // Update commission document
    const updatedCommission = await Commission.findByIdAndUpdate(id, {
      reference,
      commission,
      status,
    });


    // Update user's commission
    user.commission.push(updatedCommission._id); // Assuming `user.commission` is an array

    if (status == "success") {
      user.myBalance += updatedCommission.commission;
    }

    await user.save(); // Save the updated user document

    res.status(200).json({ message: "Commission Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//  export
module.exports = {
  getAllCommission,
  updateCommission,
};
