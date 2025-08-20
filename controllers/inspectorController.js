import Inspector from '../models/inspectorModel.js';
import Course from '../models/courseModel.js';
import { syncRelation } from '../utils/relationSync.js';
import courseModel from '../models/courseModel.js';


// ✅ Create Inspector
export const createInspector = async (req, res) => {
  try {
    const { name, email, phone, courseIds } = req.body;

    const existingInspector = await Inspector.findOne({ email: email.trim().toLowerCase() });
    if (existingInspector) {
      return res.status(409).json({
        success: false,
        message: "Inspector with this email already exists"
      });
    }

    const finalCourseIds = courseIds?.length
      ? courseIds
      : (await Course.find({}, "_id")).map(c => c._id);

    const inspector = await Inspector.create({
      name,
      email,
      phone,
      courseIds: finalCourseIds
    });

    // ✅ Sync with courses
    await syncRelation({
      targetModel: Course,
      sourceId: inspector._id,
      targetField: "inspectorIds",
      oldTargetIds: [],
      newTargetIds: finalCourseIds
    });

    const populatedInspector = await Inspector.findById(inspector._id)
      .populate("courseIds", "name description duration");

    res.status(201).json({
      success: true,
      message: "Inspector created successfully",
      inspector: populatedInspector
    });
  } catch (err) {
    console.error("Create Inspector Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const updateInspector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, courseIds } = req.body;

    const inspector = await Inspector.findById(id);
    if (!inspector) {
      return res.status(404).json({ success: false, message: "Inspector not found" });
    }

    const oldCourseIds = inspector.courseIds.map(c => c.toString());
    let finalCourseIds = courseIds?.length ? courseIds : (await Course.find({}, "_id")).map(c => c._id);

    inspector.name = name ?? inspector.name;
    inspector.email = email ?? inspector.email;
    inspector.phone = phone ?? inspector.phone;
    inspector.courseIds = finalCourseIds;
    await inspector.save();

    // ✅ Sync courses
    await syncRelation({
      targetModel: courseModel,
      sourceId: inspector._id,
      targetField: "inspectorIds",
      oldTargetIds: oldCourseIds,
      newTargetIds: finalCourseIds
    });

    const populatedInspector = await Inspector.findById(inspector._id)
      .populate("courseIds", "name description duration");

    res.json({ success: true, message: "Inspector updated successfully", inspector: populatedInspector });
  } catch (err) {
    console.error("Update Inspector Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const getAllInspectors = async (req, res) => {
  try {
    const inspectors = await Inspector.find()
      .populate("courseIds", "name description duration"); 

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
