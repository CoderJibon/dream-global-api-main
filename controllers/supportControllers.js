const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const Support = require("../models/Support.js");

/**
 * @DESC Get All supports
 * @ROUTE api/v1/supports
 * @METHOD GET
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const getAllSupport = asyncHandler(async (req, res) => {
  // Get all supports
  const supports = await Support.find();

  if (supports.length > 0) {
    return res.status(200).json({ supports });
  }
  //response
  res.status(404).json([]);
});

/**
 * @DESC create a support
 * @ROUTE api/v1/support
 * @METHOD POST
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const createSupport = asyncHandler(async (req, res) => {
  const { _id } = req.me;

  // Get support data from request body
  const { name, email, subject, Priority, Message } = req.body;
  try {
    // Find user by email
    const user = await User.findById({ _id });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new support document
    const newSupport = new Support({
      name,
      email,
      subject,
      Priority,
      Message,
      user: user._id,
    });

    // Save the new support document
    await newSupport.save();

    // Update the user document to add the new support reference
    user.support.push(newSupport._id);

    await user.save();

    // updated user object or just a success message
    res.status(201).json({
      message: "support successful . Waiting for Replay",
      support: newSupport,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @DESC Update Status
 * @ROUTE api/v1/support/status/:id
 * @METHOD patch
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const updateSupportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Find deposit by ID
    const support = await Support.findById(id);

    if (!support) {
      return res.status(404).json({ message: "Support not found" });
    }

    // Update status
    support.status = status;
    await support.save();

    res.status(200).json({ message: "Support status updated", support });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// export
module.exports = { getAllSupport, createSupport, updateSupportStatus };
