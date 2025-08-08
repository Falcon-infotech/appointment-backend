import branchModel from "../models/branchModel.js";
import courseModel from "../models/courseModel.js";


// Create Branch
export const createBranch = async (req, res) => {
  try {
    const { branchName, country, branchCode, address, courseIds } = req.body;

    // Branch code unique check
    const existing = await branchModel.findOne({ branchCode });
    if (existing) {
      return res.status(400).json({ success: false, message: "Branch code already exists" });
    }

    // If no courseIds provided → assign all courses
    let finalCourseIds = courseIds;
    if (!courseIds || courseIds.length === 0) {
      const allCourses = await courseModel.find({}, "_id");
      finalCourseIds = allCourses.map(course => course._id);
    }

    // Create branch first
    const branch = new branchModel({
      branchName,
      country,
      branchCode,
      address,
      courseIds: finalCourseIds
    });

    await branch.save();

    // Update courses to include this branch in branchIds
    await courseModel.updateMany(
      { _id: { $in: finalCourseIds } },
      { $addToSet: { branchIds: branch._id } }
    );

    // Populate for response
    const populatedBranch = await branchModel
      .findById(branch._id)
      .populate("courseIds", "name description duration");

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      branch: populatedBranch
    });
  } catch (err) {
    console.error("Create Branch Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const updateBranch = async (req, res) => {
  try {
    const { branchName, country, branchCode, address, courseIds } = req.body;

    // Fetch branch first to know old courseIds
    const branch = await branchModel.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    // Decide final courseIds
    let finalCourseIds = courseIds;
    if (!courseIds || courseIds.length === 0) {
      const allCourses = await courseModel.find({}, "_id");
      finalCourseIds = allCourses.map(course => course._id);
    }

    // Update branch document
    branch.branchName = branchName ?? branch.branchName;
    branch.country = country ?? branch.country;
    branch.branchCode = branchCode ?? branch.branchCode;
    branch.address = address ?? branch.address;
    branch.courseIds = finalCourseIds;

    await branch.save();

    // Remove this branch from old courses' branchIds
    await courseModel.updateMany(
      { _id: { $in: branch.courseIds } },
      { $pull: { branchIds: branch._id } }
    );

    // Add this branch to new courses' branchIds
    await courseModel.updateMany(
      { _id: { $in: finalCourseIds } },
      { $addToSet: { branchIds: branch._id } }
    );

    const populatedBranch = await branchModel
      .findById(branch._id)
      .populate("courseIds", "name duration");

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      branch: populatedBranch
    });
  } catch (err) {
    console.error("Update Branch Error:", err);
    res.status(500).json({ success: false, message: "Error updating branch" });
  }
};



// Get All Branches
export const getAllBranches = async (req, res) => {
  try {
    const branches = await branchModel.find();
    res.status(200).json({ success: true, message: "Branches fetched successfully", totalBranches: branches.length, branches });
  } catch (err) {
    console.error("Fetch Branches Error:", err.message);
    res.status(500).json({ success: false, message: "Unable to fetch branches" });
  }
};

// Get Branch by ID
export const getBranchById = async (req, res) => {
  try {
    const branch = await branchModel.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    res.status(200).json({ success: true, message: "Branch fetched successfully", branch });
  } catch (err) {
    console.error("Get Branch Error:", err.message);
    res.status(500).json({ success: false, message: "Error fetching branch" });
  }
};

// Update Branch

// Delete Branch
export const deleteBranch = async (req, res) => {
  try {
    const deleted = await branchModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Branch not found" });

    res.status(200).json({ success: true, message: "Branch deleted successfully" });
  } catch (err) {
    console.error("Delete Branch Error:", err.message);
    res.status(500).json({ success: false, message: "Error deleting branch" });
  }
};
