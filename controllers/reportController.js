import batchModel from "../models/batchModel.js";




export const getInstructorReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    const reports = await batchModel.aggregate([
      {
        $match: {
          fromDate: { $lte: new Date(toDate) },
          toDate: { $gte: new Date(fromDate) },
        },
      },
      {
        $group: {
          _id: "$instructorId",
          totalBatches: { $sum: 1 },
          totalDays: {
            $sum: {
              $add: [
                {
                  $divide: [
                    { $subtract: ["$toDate", "$fromDate"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
                1,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "instructors",
          localField: "_id",
          foreignField: "_id",
          as: "instructor",
        },
      },
      { $unwind: "$instructor" },
      {
        $project: {
          _id: 0,
          instructorId: "$_id",
          instructorName: "$instructor.name",
          email: "$instructor.email",
          totalBatches: 1,
          totalDays: { $round: ["$totalDays", 0] }, // round to nearest day
        },
      },
    ]);

    res.status(200).json({
      success: true,
      reports,
    });
  } catch (err) {
    console.error("instructor report generation failed:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getInstructorBatches = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    const { instructorId } = req.params;

    if (!instructorId || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "instructorId, fromDate, and toDate are required",
      });
    }

    const batches = await batchModel.find({
      instructorId,
      fromDate: { $lte: new Date(toDate) },
      toDate: { $gte: new Date(fromDate) },
    })
      .populate("branchId", "branchName country branchCode")
      .populate("courseId", "name description");

    res.status(200).json({
      success: true,
      totalBatches: batches.length,
      batches,
    });
  } catch (err) {
    console.error("Fetching instructor batches failed:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllBatchesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "instructorId is required",
      });
    }

    const batches = await Batch.find({ instructorId })
      .populate("branchId", "branchName country branchCode")
      .populate("courseId", "name description")
      .sort({ fromDate: -1 }); // latest first

    res.status(200).json({
      success: true,
      totalBatches: batches.length,
      batches,
    });
  } catch (err) {
    console.error("Fetching all instructor batches failed:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

