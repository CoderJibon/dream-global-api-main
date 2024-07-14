const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const CashOut = require("../models/UserCashOut.js");

/**
 * @DESC Deposit
 * @ROUTE api/v1/deposit
 * @METHOD POST
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const getAllCashOut = asyncHandler(async (req, res) => {
  // Get all users
  const cashOuts = await CashOut.find().populate("user");
  //if get all users
  if (cashOuts.length > 0) {
    return res.status(200).json({ cashOuts });
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

const cashOut = asyncHandler(async (req, res) => {
  const { email } = req.me; // Assuming req.me contains the authenticated user's details

  // Get deposit data from request body
  const { amount, method, accountNumber, note } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new Deposit document
    const newCashOut = new CashOut({
      amount,
      method,
      accountNumber,
      note,
      user: user._id, // Reference to the User document
    });

    // Save the new deposit document
    await newCashOut.save();

    // Update the user document to add the new deposit reference
    user.cashOut.push(newCashOut._id);

    await user.save();
    // Optionally, you can respond with the updated user object or just a success message
    res.status(201).json({
      message: "CashOut successful . Waiting for approval",
      cashout: newCashOut,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @DESC Update Status
 * @ROUTE api/v1/deposit/status/:id
 * @METHOD patch
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const updateCashOutStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find deposit by ID
    const cashOut = await CashOut.findById(id).populate("user");

    if (!cashOut) {
      return res
        .status(404)
        .json({ message: "CashOut not found" })
        .populate("user");
    }

    // Find user by email
    const user = await User.findById({ _id: cashOut.user._id });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //user amount updated
    if (status === "success") {
      if (user.myBalance >= cashOut.amount) {
        user.myBalance -= cashOut.amount;
      } else {
        return res.status(404).json({ message: "Insufficient balance." });
      }
    }
    // Update status
    cashOut.status = status;
    await cashOut.save();
    await user.save();

    res.status(200).json({ message: "CashOut status updated", cashOut, user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error", cashOut });
  }
});

module.exports = { getAllCashOut, cashOut, updateCashOutStatus };
