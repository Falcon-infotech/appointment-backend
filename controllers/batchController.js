import Batch from "../models/batchModel.js";
import Inspector from "../models/inspectorModel.js";
import Course from "../models/courseModel.js";
import branchModel from "../models/branchModel.js";
import { updateBatchStatus } from "../utils/commonUtils.js";

export const getAvailableInspectors = async (req, res) => {
  try {
    const { branchId, courseId, fromDate, toDate } = req.body;

    if (!courseId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "courseId, fromDate and toDate are required",
      });
    }

    let inspectorQuery = { courseIds: courseId };
    if (branchId) {
      inspectorQuery.branchId = branchId;
    }

    const allInspectors = await Inspector.find(
      inspectorQuery,
      "_id name email"
    );

    const bookedInspectors = await Batch.find({
      $or: [
        {
          fromDate: { $lte: new Date(toDate) },
          toDate: { $gte: new Date(fromDate) },
        },
      ],
    }).distinct("inspectorId");

    // Convert to string for safe comparison
    const bookedIds = bookedInspectors.map((id) => id.toString());

    // 3️⃣ Filter
    const availableInspectors = allInspectors.filter(
      (i) => !bookedIds.includes(i._id.toString())
    );

    res.status(200).json({
      success: true,
      availableInspectors,
    });
  } catch (err) {
    console.error("Inspector availability check failed:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const bookBatch = async (req, res) => {
  try {
    const {
      branchId,
      courseId,
      inspectorId,
      fromDate,
      toDate,
      code,
      name,
      scheduledBy,
    } = req.body;

    if (
      !courseId ||
      !inspectorId ||
      !fromDate ||
      !toDate ||
      !code ||
      !name ||
      !scheduledBy
    ) {
      return res.status(400).json({
        success: false,
        message:
          "courseId, inspectorId, fromDate, toDate, code, name, and scheduledBy are required",
      });
    }

    // 1️⃣ Check conflicts (overlap)
    const conflict = await Batch.findOne({
      inspectorId,
      ...(branchId && { branchId }),
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
        message: "Inspector already booked in this range",
      });
    }

    // 2️⃣ Create new batch
    const batch = new Batch({
      branchId: branchId || null,
      courseId,
      inspectorId,
      fromDate,
      toDate,
      code,
      name,
      scheduledBy: req.user._id,
    });

    await batch.save();

    // 3️⃣ Increment inspector's totalBatches
    await Inspector.findByIdAndUpdate(inspectorId, {
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

export const getBatchesByInspector = async (req, res) => {
  try {
    const { inspectorId } = req.params;
    if (!inspectorId) {
      return res.status(400).json({
        success: false,
        message: "Inspector ID is required",
      });
    }

    const batches = await Batch.find({ inspectorId })
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
      .populate("inspectorId", "name email phone")
      .populate("scheduledBy", "first_name last_name email");

    const totalInspectors = await Inspector.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalBranches = await branchModel.countDocuments();

    if (!batches || batches.length === 0) {
      return res.status(404).json({
        success: false,
        totalBatches: 0,
        totalInspectors,
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
      totalInspectors,
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
      inspectorId,
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

    // Optional conflict check (only if inspectorId or dates are updated)
    if (inspectorId || fromDate || toDate) {
      const conflict = await Batch.findOne({
        _id: { $ne: id }, // exclude current batch
        inspectorId: inspectorId || batch.inspectorId,
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
          message: "Inspector already booked in this range",
        });
      }
    }

    // Update batch
    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      {
        branchId,
        courseId,
        inspectorId,
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

    // Decrement inspector's totalBatches
    if (deleted.inspectorId) {
      await Inspector.findByIdAndUpdate(deleted.inspectorId, {
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
