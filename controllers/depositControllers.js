const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const Deposit = require("../models/Deposit.js");

/**
 * @DESC Get All Deposit
 * @ROUTE api/v1/deposit
 * @METHOD GET
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const getAllDeposit = asyncHandler(async (req, res) => {
  // Get all deposits
  const deposits = await Deposit.find();

  if (deposits.length > 0) {
    return res.status(200).json({ deposits });
  }
  //response
  res.status(404).json([]);
});

/**
 * @DESC Deposit
 * @ROUTE api/v1/deposit
 * @METHOD POST
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const deposit = asyncHandler(async (req, res) => {
  const { email } = req.me; // Assuming req.me contains the authenticated user's details

  // Get deposit data from request body
  const { amount, transactionID } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new Deposit document
    const newDeposit = new Deposit({
      amount,
      transactionID,
      user: user._id, // Reference to the User document
    });

    // Save the new deposit document
    await newDeposit.save();

    // Update the user document to add the new deposit reference
    user.deposit.push(newDeposit._id);

    await user.save();
    // Optionally, you can respond with the updated user object or just a success message
    res.status(201).json({
      message: "Deposit successful . Waiting for approval",
      user: user,
    });
  } catch (error) {
    console.error("Error in deposit:", error);
    res.status(500).json({ message: "Server Error" });
  }
}); 

/**
 * @DESC Update Status
 * @ROUTE api/v1/deposit/status/:id
 * @METHOD patch
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find deposit by ID
    const deposit = await Deposit.findById(id);

    console.log(deposit);

    if (!deposit) {
      return res.status(404).json({ message: "Deposit not found" });
    }

    // Update status
    deposit.status = status;
    await deposit.save();

    res.status(200).json({ message: "Deposit status updated", deposit });
  } catch (error) {
    console.error("Error in updateStatus:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = { getAllDeposit, deposit, updateStatus };
