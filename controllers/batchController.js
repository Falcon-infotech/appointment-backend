import Batch from "../models/batchModel.js";
import branchModel from "../models/branchModel.js";
import { updateBatchStatus } from "../utils/commonUtils.js";
import mongoose from "mongoose";
import courseModel from "../models/courseModel.js";
import instructorModel from "../models/instructorModel.js";


export const getAvailableInstructors = async (req, res) => {
  try {
    const { branchId, courseId, fromDate, toDate } = req.body;

    if (!courseId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "courseId, fromDate and toDate are required",
      });
    }

    // ✅ Find booked instructor IDs within date range
    const bookedInstructorIds = await Batch.find({
      fromDate: { $lte: new Date(toDate) },
      toDate: { $gte: new Date(fromDate) },
    }).distinct("instructorId");

    // ✅ Build query
    let instructorQuery = {
      courseIds: new mongoose.Types.ObjectId(courseId),
      _id: { $nin: bookedInstructorIds },
    };

    // if (branchId) {
    //   instructorQuery.branchIds = new mongoose.Types.ObjectId(branchId);
    // }

    // ✅ Get only available instructors
    const availableInstructors = await instructor.find(
      instructorQuery,
      "_id name email"
    );

    res.status(200).json({
      success: true,
      availableInstructors,
    });
  } catch (err) {
    console.error("instructor availability check failed:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const bookBatch = async (req, res) => {
  try {
    const { branchId, courseId, instructorId, fromDate, toDate, code, name } =
      req.body;

    if (!courseId || !instructorId || !fromDate || !toDate || !code || !name) {
      return res.status(400).json({
        success: false,
        message:
          "courseId, instructorId, fromDate, toDate, code, and name are required",
      });
    }

    // 1️⃣ Check conflicts (overlap)
    const conflict = await Batch.findOne({
      instructorId,
      // ...(branchId && { branchId }),
      courseId,
      $or: [
        {
          fromDate: { $lte: new Date(toDate) },
          toDate: { $gte: new Date(fromDate) },
        },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "instructor already booked in this range",
      });
    }

    // 2️⃣ Create new batch
    const batch = new Batch({
      branchId: branchId || null,
      courseId,
      instructorId,
      fromDate,
      toDate,
      code,
      name,
      scheduledBy: req.user._id,
    });

    await batch.save();

    // 3️⃣ Increment instructor's totalBatches
    await instructor.findByIdAndUpdate(instructorId, {
      $inc: { totalBatches: 1 },
    });

    res.status(201).json({
      success: true,
      message: "Batch booked successfully",
      batch,
    });
  } catch (err) {
    console.error("Batch booking failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to book batch",
    });
  }
};

export const getBatchesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "instructor ID is required",
      });
    }

    const batches = await Batch.find({ instructorId })
      .populate("branchId", "branchName country branchCode")
      .populate("courseId", "name description");

    const today = new Date();

    const updatedBatches = await Promise.all(
      batches.map((batch) => updateBatchStatus(batch, today))
    );

    res.status(200).json({
      success: true,
      message: "Batches fetched and statuses updated successfully",
      batches: updatedBatches,
    });
  } catch (err) {
    console.error("Fetch Batches Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
    });
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("branchId", "branchName country branchCode")
      .populate("courseId", "name description duration")
      .populate("instructorId", "name email phone")
      .populate("scheduledBy", "first_name last_name email");

    const totalInstructors = await instructorModel.countDocuments();
    const totalCourses = await courseModel.countDocuments();
    const totalBranches = await branchModel.countDocuments();

    if (!batches || batches.length === 0) {
      return res.status(404).json({
        success: false,
        totalBatches: 0,
        totalInstructors,
        totalCourses,
        totalBranches,
        message: "No batches found",
      });
    }

    const today = new Date();

    const updatedBatches = await Promise.all(
      batches.map((batch) => updateBatchStatus(batch, today))
    );

    res.status(200).json({
      success: true,
      message: "All batches fetched and statuses updated successfully",
      totalBatches: updatedBatches.length,
      totalInstructors,
      totalCourses,
      totalBranches,
      batches: updatedBatches,
    });
  } catch (err) {
    console.error("Fetch All Batches Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all batches",
    });
  }
};

// ✅ Update Batch
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params; // Batch Id
    const {
      branchId,
      courseId,
      instructorId,
      fromDate,
      toDate,
      code,
      name,
      scheduledBy,
    } = req.body;

    // Check if batch exists
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Optional conflict check (only if instructorId or dates are updated)
    if (instructorId || fromDate || toDate) {
      const conflict = await Batch.findOne({
        _id: { $ne: id }, // exclude current batch
        instructorId: instructorId || batch.instructorId,
        ...(branchId && { branchId }),
        courseId: courseId || batch.courseId,
        $or: [
          {
            fromDate: { $lte: new Date(toDate || batch.toDate) },
            toDate: { $gte: new Date(fromDate || batch.fromDate) },
          },
        ],
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "instructor already booked in this range",
        });
      }
    }

    // Update batch
    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      {
        branchId,
        courseId,
        instructorId,
        fromDate,
        toDate,
        code,
        name,
        scheduledBy,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      batch: updatedBatch,
    });
  } catch (err) {
    console.error("Update Batch Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update batch",
    });
  }
};

// ✅ Delete Batch
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Batch.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Decrement instructor's totalBatches
    if (deleted.instructorId) {
      await instructor.findByIdAndUpdate(deleted.instructorId, {
        $inc: { totalBatches: -1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (err) {
    console.error("Delete Batch Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete batch",
    });
  }
};
