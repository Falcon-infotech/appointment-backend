import branchModel from "../models/branchModel.js";
import courseModel from "../models/courseModel.js";
import { syncRelation } from "../utils/relationSync.js";


// Create Branch
export const createBranch = async (req, res) => {
  try {
    const { branchName, country, branchCode, address, courseIds } = req.body;

    // Default: agar courseIds nahi diye to saare courses assign
    const finalCourseIds = courseIds?.length
      ? courseIds
      : (await courseModel.find({}, "_id")).map(c => c._id);

    // Create branch
    const branch = await branchModel.create({
      branchName,
      country,
      branchCode,
      address,
      courseIds: finalCourseIds
    });

    // ✅ Sync with courses
    await syncRelation({
      targetModel: courseModel,
      sourceId: branch._id,
      targetField: "branchIds",
      oldTargetIds: [], // create me purane IDs nahi hote
      newTargetIds: finalCourseIds
    });

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
    const { id } = req.params;
    const { branchName, country, branchCode, address, courseIds } = req.body;

    const branch = await branchModel.findById(id);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const oldCourseIds = branch.courseIds.map(c => c.toString());
    let finalCourseIds = courseIds?.length ? courseIds : (await courseModel.find({}, "_id")).map(c => c._id);

    // Update branch
    branch.branchName = branchName ?? branch.branchName;
    branch.country = country ?? branch.country;
    branch.branchCode = branchCode ?? branch.branchCode;
    branch.address = address ?? branch.address;
    branch.courseIds = finalCourseIds;
    await branch.save();

    // ✅ Use utility for syncing
    await syncRelation({
      targetModel: courseModel,
      sourceId: branch._id,
      targetField: "branchIds",
      oldTargetIds: oldCourseIds,
      newTargetIds: finalCourseIds
    });

    const populatedBranch = await branchModel
      .findById(branch._id)
      .populate("courseIds", "name description duration");

    res.json({ success: true, message: "Branch updated successfully", branch: populatedBranch });
  } catch (err) {
    console.error("Update Branch Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// Get All Branches
export const getAllBranches = async (req, res) => {
  try {
    const branches = await branchModel.find().populate("courseIds", "name description duration");
    res.status(200).json({ success: true, message: "Branches fetched successfully", totalBranches: branches.length, branches });
  } catch (err) {
    console.error("Fetch Branches Error:", err.message);
    res.status(500).json({ success: false, message: "Unable to fetch branches" });
  }
};

// Get Branch by ID
export const getBranchById = async (req, res) => {
  try {
    const branch = await branchModel.findById(req.params.id).populate("courseIds", "name description duration").populate("inspectorIds", "name email phone");
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
