const asyncHandler = require("express-async-handler");
const User = require("../models/User.js");
const Work = require("../models/Work.js");

/**
 * @DESC Get All works
 * @ROUTE api/v1/works
 * @METHOD GET
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const getAllWork = asyncHandler(async (req, res) => {
  // Get all works
  const works = await Work.find();

  if (works.length > 0) {
    return res.status(200).json({ works });
  }
  //response
  res.status(404).json([]);
});

/**
 * @DESC get single work
 * @ROUTE api/v1/work/:id
 * @METHOD GET
 * @ACCESS private
 */

const getSingleWork = asyncHandler(async (req, res) => {
  // get work id from params

  const { id } = req.params;

  try {
    // find single work by id

    const work = await Work.findById(id);

    //  get single work response

    res.status(200).json(work);
  } catch (error) {
    res.status(400).json({ message: "Work not found" });
  }
});

/**
 * @DESC create a work
 * @ROUTE api/v1/work
 * @METHOD POST
 * @ACCESS private (assuming it requires authentication based on authMiddleware)
 */

const createWork = asyncHandler(async (req, res) => {
  const { email } = req.me;

  // Get work data from request body
  const { name } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new work document
    const newWork = new Work({
      name,
    });

    // Save the new work document
    await newWork.save();

    // updated user object or just a success message
    res.status(201).json({
      message: "Work create successful",
      work: newWork,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @DESC Delete Single work
 * @ROUTE api/v1/work/:id
 * @METHOD Delete
 * @ACCESS public
 */

const deleteWork = asyncHandler(async (req, res) => {
  //get params
  const { id } = req.params;
  //find work
  const work = await Work.findById(id);
  //if work not available
  if (!work) {
    throw new Error("Work Not Found");
  }
  //delate work
  const workId = await Work.findByIdAndDelete(id);

  //response
  res.status(200).json({ work: workId, message: "Work delete successfully" });
});

/**
 * @DESC Update work
 * @ROUTE api/v1/work/:id
 * @METHOD PUT
 * @ACCESS public
 */

const updateSingleWork = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name } = req.body;

  const work = await Work.findById(id);

  if (!work) {
    throw new Error("Work Not Found");
  }

  // Update work details
  const updateWork = await Work.findByIdAndUpdate(
    id,
    {
      name,
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .json({ work: updateWork, message: "Work updated successfully" });
});

// export
module.exports = {
  getAllWork,
  createWork,
  deleteWork,
  updateSingleWork,
  getSingleWork,
};
