import Inspector from '../models/inspectorModel.js';
import Course from '../models/courseModel.js';

// ✅ Create Inspector
export const createInspector = async (req, res) => {
  try {
    let { name, email, phone, courseIds } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "All fields (name, email, phone) are required" });
    }

    // 🔄 If courseIds is missing or empty → get all courses
    if (!courseIds || courseIds.length === 0) {
      const allCourses = await Course.find({}, "_id");
      courseIds = allCourses.map(c => c._id);
    }

    const newInspector = new Inspector({ name, email, phone,  courseIds });
    await newInspector.save();

    const populatedInspector = await Inspector.findById(newInspector._id)
      .populate("courseIds", "name description duration");

    res.status(201).json({ success: true, message: "Inspector created successfully", inspector: populatedInspector });

  } catch (err) {
    console.error("Create Inspector Error:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(", ") });
    }
    if (err.code === 11000 && err.keyValue?.email) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Something went wrong while creating inspector" });
  }
};


export const getAllInspectors = async (req, res) => {
  try {
    const inspectors = await Inspector.find()
      .populate("courseIds", "name description duration"); // ✅ Populate courses for all

    res.status(200).json({
      success: true,
      message: "Inspectors fetched successfully",
      totalInspector: inspectors.length,
      inspectors
    });
  } catch (err) {
    console.error("Fetch Inspectors Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inspectors",
    });
  }
};



export const getInspectorById = async (req, res) => {
  try {
    const inspector = await Inspector.findById(req.params.id)
      .populate("courseIds", "name description duration"); // ✅ Populate full course details

    if (!inspector) {
      return res.status(404).json({
        success: false,
        message: "Inspector not found with given ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inspector fetched successfully",
      inspector
    });

  } catch (err) {
    console.error("Get Inspector Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve inspector",
    });
  }
};



export const updateInspector = async (req, res) => {
  try {
    let { name, email, phone, courseIds } = req.body;

    // 🔄 If no courseIds passed, fill with all courses
    if (!courseIds || courseIds.length === 0) {
      const allCourses = await Course.find({}, "_id");
      courseIds = allCourses.map(c => c._id);
    }

    const updated = await Inspector.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, courseIds },
      { new: true, runValidators: true }
    ).populate("courseIds", "name description duration"); // ✅ Populate course details

    if (!updated) {
      return res.status(404).json({ success: false, message: "Inspector not found" });
    }

    res.status(200).json({ success: true, message: "Inspector updated", inspector: updated });

  } catch (err) {
    console.error("Update Inspector Error:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(", ") });
    }
    if (err.code === 11000 && err.keyValue?.email) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    res.status(500).json({ success: false, message: "Failed to update inspector" });
  }
};



export const deleteInspector = async (req, res) => {
  try {
    const deleted = await Inspector.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Inspector not found or already deleted",
      });
    }

    res.status(200).json({ success: true, message: "Inspector deleted successfully" });

  } catch (err) {
    console.error("Delete Inspector Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete inspector" });
  }
};
