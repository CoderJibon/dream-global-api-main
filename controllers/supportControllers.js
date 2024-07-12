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
  const { email } = req.me; 

  // Get support data from request body
  const { subject, Priority, Message } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Handle photo upload if any
    let supportPhotoPath = null;

    if (req.file) {
      // Delete previous photo if exists in user's support document
      if (user.support.photo) {
        const imagePath = path.join(
          __dirname,
          `../public/SupportPhoto/${user.support.photo}`
        );
        try {
          fs.unlinkSync(imagePath);
          console.log(
            `Successfully deleted previous photo ${user.support.photo}`
          );
        } catch (err) {
          console.error(
            `Error deleting previous photo ${user.support.photo}:`,
            err
          );
        }
      }

      // Assign new support photo path
      supportPhotoPath = req.file.path;
    }

    // Create a new support document
    const newSupport = new Support({
      subject,
      Priority,
      Message,
      user: user._id,
      photo: supportPhotoPath,
    });

    // Save the new support document
    await newSupport.save();

    // Update the user document to add the new support reference
    user.support.push(newSupport._id);

    await user.save();
    // Optionally, you can respond with the updated user object or just a success message
    res.status(201).json({
      message: "support successful . Waiting for approval",
      user: user,
    });
  } catch (error) {
    console.error("Error in support:", error);
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
    console.error("Error in updateStatus:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// export
module.exports = { getAllSupport, createSupport, updateSupportStatus };
