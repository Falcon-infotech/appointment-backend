import Batch from '../models/batchModel.js';
import Inspector from '../models/inspectorModel.js';
import Course from '../models/courseModel.js';

// ✅ Get available inspectors for a course and date range
export const getAvailableInspectors = async (req, res) => {
  try {
    const { branchId, courseId, fromDate, toDate } = req.body;

    if (!courseId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "courseId, fromDate and toDate are required"
      });
    }

    // 1️⃣ Find all inspectors that have this course assigned
    let inspectorQuery = { courses: courseId };
    if (branchId) {
      inspectorQuery.branchId = branchId; // optional branch filter
    }

    const allInspectors = await Inspector.find(inspectorQuery);

    // 2️⃣ Find inspectors already booked in the date range
    const bookedInspectors = await Batch.find({
      $or: [
        {
          fromDate: { $lte: new Date(toDate) },
          toDate: { $gte: new Date(fromDate) }
        }
      ]
    }).distinct('inspectorId');

    // 3️⃣ Filter only available inspectors
    const availableInspectors = allInspectors.filter(
      i => !bookedInspectors.includes(i._id.toString())
    );

    res.status(200).json({
      success: true,
      availableInspectors
    });

  } catch (err) {
    console.error("Inspector availability check failed:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const bookBatch = async (req, res) => {
  try {
    const { branchId, courseId, inspectorId, fromDate, toDate } = req.body;

    if (!courseId || !inspectorId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "courseId, inspectorId, fromDate, toDate are required"
      });
    }

    // Check conflicts
    const conflict = await Batch.findOne({
      inspectorId,
      $or: [
        {
          fromDate: { $lte: new Date(toDate) },
          toDate: { $gte: new Date(fromDate) }
        }
      ]
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Inspector already booked in this range"
      });
    }

    const batch = new Batch({
      branchId: branchId || null, // can be null if not provided
      courseId,
      inspectorId,
      fromDate,
      toDate
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: "Batch booked successfully",
      batch
    });

  } catch (err) {
    console.error("Batch booking failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to book batch"
    });
  }
};


export const getBatchesByInspector = async (req, res) => {
  try {
    const { inspectorId } = req.params;

    if (!inspectorId) {
      return res.status(400).json({
        success: false,
        message: "Inspector ID is required"
      });
    }

    const batches = await Batch.find({ inspectorId })
      .populate('branchId', 'branchName country branchCode')
      .populate('courseId', 'name description duration');

    res.status(200).json({
      success: true,
      message: "Batches fetched successfully",
      batches
    });

  } catch (err) {
    console.error("Fetch Batches Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches"
    });
  }
};


export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('branchId', 'branchName country branchCode')
      .populate('courseId', 'name description duration')
      .populate('inspectorId', 'name email phone');

    res.status(200).json({
      success: true,
      message: "All batches fetched successfully",
      totalBatches: batches.length,
      batches
    });

  } catch (err) {
    console.error("Fetch All Batches Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all batches"
    });
  }
};

