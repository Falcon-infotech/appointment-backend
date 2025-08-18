import mongoose from "mongoose";
import Branch from "../models/branchModel.js";
import Course from "../models/courseModel.js";
import branchModel from "../models/branchModel.js";
import inspectorModel from "../models/inspectorModel.js";
import { syncRelation } from "../utils/relationSync.js";

// ✅ Create Course
export const createCourse = async (req, res) => {
  try {
    const { name, description, duration, branchIds, inspectorIds } = req.body;

    const finalBranchIds = branchIds?.length
      ? branchIds
      : (await branchModel.find({}, "_id")).map(b => b._id);

    const finalInspectorIds = inspectorIds?.length
      ? inspectorIds
      : (await inspectorModel.find({}, "_id")).map(i => i._id);

    const course = await Course.create({
      name,
      description,
      duration,
      branchIds: finalBranchIds,
      inspectorIds: finalInspectorIds
    });

    // ✅ Sync with branches
    await syncRelation({
      targetModel: branchModel,
      sourceId: course._id,
      targetField: "courseIds",
      oldTargetIds: [],
      newTargetIds: finalBranchIds
    });

    // ✅ Sync with inspectors
    await syncRelation({
      targetModel: inspectorModel,
      sourceId: course._id,
      targetField: "courseIds",
      oldTargetIds: [],
      newTargetIds: finalInspectorIds
    });

    const populatedCourse = await Course.findById(course._id)
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name email phone");

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: populatedCourse
    });
  } catch (err) {
    console.error("Create Course Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// ✅ Update Course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, branchIds, inspectorIds } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const oldBranchIds = course.branchIds.map(b => b.toString());
    const oldInspectorIds = course.inspectorIds.map(i => i.toString());

    let finalBranchIds = branchIds?.length ? branchIds : (await branchModel.find({}, "_id")).map(b => b._id);
    let finalInspectorIds = inspectorIds?.length ? inspectorIds : (await inspectorModel.find({}, "_id")).map(i => i._id);

    course.name = name ?? course.name;
    course.description = description ?? course.description;
    course.duration = duration ?? course.duration;
    course.branchIds = finalBranchIds;
    course.inspectorIds = finalInspectorIds;
    await course.save();

    // ✅ Sync branches
    await syncRelation({
      targetModel: branchModel,
      sourceId: course._id,
      targetField: "courseIds",
      oldTargetIds: oldBranchIds,
      newTargetIds: finalBranchIds
    });

    // ✅ Sync inspectors
    await syncRelation({
      targetModel: inspectorModel,
      sourceId: course._id,
      targetField: "courseIds",
      oldTargetIds: oldInspectorIds,
      newTargetIds: finalInspectorIds
    });

    const populatedCourse = await Course.findById(course._id)
      .populate("branchIds", "branchName country branchCode")
      .populate("inspectorIds", "name email phone");

    res.json({ success: true, message: "Course updated successfully", course: populatedCourse });
  } catch (err) {
    console.error("Update Course Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// ✅ Get All Courses (Populated)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}, "name description")
      // .populate("branchIds", "branchName country branchCode")
      // .populate("inspectorIds", "name email phone");

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

    const courses = await Course.find({ _id: { $in: branch.courseIds } },'_id name description')
      // .populate("branchIds", "branchName country branchCode")
      // .populate("inspectorIds", "name");

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
 