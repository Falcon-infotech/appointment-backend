import mongoose from "mongoose";
import Branch from "../models/branchModel.js";
import Course from "../models/courseModel.js";
import branchModel from "../models/branchModel.js";
import inspectorModel from "../models/inspectorModel.js";

// ✅ Create Course
export const createCourse = async (req, res) => {
  try {
    const { name, description, duration, branchIds, inspectorIds } = req.body;

    if (!name || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, duration) are required",
      });
    }

    // 🔹 Auto-fill branchIds if missing/empty
    let finalBranchIds = branchIds;
    if (!branchIds || branchIds.length === 0) {
      const allBranches = await branchModel.find({}, "_id");
      finalBranchIds = allBranches.map(b => b._id);
    }

    // 🔹 Auto-fill inspectorIds if missing/empty
    let finalInspectorIds = inspectorIds;
    if (!inspectorIds || inspectorIds.length === 0) {
      const allInspectors = await inspectorModel.find({}, "_id");
      finalInspectorIds = allInspectors.map(i => i._id);
    }

    const newCourse = new Course({
      name,
      description,
      duration,
      branchIds: finalBranchIds,
      inspectorIds: finalInspectorIds
    });

    await newCourse.save();

    // Populate before sending response
    const populatedCourse = await Course.findById(newCourse._id)
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name email phone");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse,
    });

  } catch (err) {
    console.error("Create Course Error:", err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error while creating course" });
  }
};

// ✅ Get All Courses (Populated)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name email phone");

    res.status(200).json({ success: true, courses });
  } catch (err) {
    console.error("Fetch Courses Error:", err);
    res.status(500).json({ success: false, message: "Unable to fetch courses" });
  }
};

// ✅ Get Course by ID (Populated)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name email phone");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found with given ID",
      });
    }

    res.status(200).json({ success: true, course });

  } catch (err) {
    console.error("Get Course Error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve course" });
  }
};

// ✅ Update Course
export const updateCourse = async (req, res) => {
  try {
    const { name, description, duration, branchIds, inspectorIds } = req.body;

    let updatedData = { name, description, duration };

    // 🔹 Auto-fill branchIds if missing/empty
    if (!branchIds || branchIds.length === 0) {
      const allBranches = await branchModel.find({}, "_id");
      updatedData.branchIds = allBranches.map(b => b._id);
    } else {
      updatedData.branchIds = branchIds;
    }

    // 🔹 Auto-fill inspectorIds if missing/empty
    if (!inspectorIds || inspectorIds.length === 0) {
      const allInspectors = await inspectorModel.find({}, "_id");
      updatedData.inspectorIds = allInspectors.map(i => i._id);
    } else {
      updatedData.inspectorIds = inspectorIds;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    )
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name email phone");

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated", course: updatedCourse });

  } catch (err) {
    console.error("Update Course Error:", err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Failed to update course" });
  }
};

export const getCoursesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ success: false, message: "Invalid branchId format" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const courses = await Course.find({ _id: { $in: branch.courseIds } })
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name");

    res.status(200).json({
      success: true,
      message: `Courses for branch ${branchId} fetched successfully`,
      courses
    });
  } catch (err) {
    console.error("Fetch Courses Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
};


// ✅ Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found or already deleted",
      });
    }

    res.status(200).json({ success: true, message: "Course deleted successfully" });

  } catch (err) {
    console.error("Delete Course Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete course" });
  }
};
 