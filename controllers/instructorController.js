import Instructor from '../models/instructorModel.js';
import Course from '../models/courseModel.js';
import { syncRelation } from '../utils/relationSync.js';
import courseModel from '../models/courseModel.js';


// ✅ Create instructor
export const createInstructor = async (req, res) => {
  try {
    const { name, email, phone, courseIds } = req.body;

    const existingInstructor = await Instructor.findOne({ email: email.trim().toLowerCase() });
    if (existingInstructor) {
      return res.status(409).json({
        success: false,
        message: "instructor with this email already exists"
      });
    }

    const finalCourseIds = courseIds?.length
      ? courseIds
      : (await Course.find({}, "_id")).map(c => c._id);

    const instructor = await Instructor.create({
      name,
      email,
      phone,
      courseIds: finalCourseIds
    });

    // ✅ Sync with courses
    await syncRelation({
      targetModel: Course,
      sourceId: instructor._id,
      targetField: "instructorIds",
      oldTargetIds: [],
      newTargetIds: finalCourseIds
    });

    const populatedInstructor = await Instructor.findById(instructor._id)
      .populate("courseIds", "name description duration");

    res.status(201).json({
      success: true,
      message: "instructor created successfully",
      instructor: populatedInstructor
    });
  } catch (err) {
    console.error("Create instructor Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, courseIds } = req.body;

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({ success: false, message: "instructor not found" });
    }

    const oldCourseIds = instructor.courseIds.map(c => c.toString());
    let finalCourseIds = courseIds?.length ? courseIds : (await Course.find({}, "_id")).map(c => c._id);

    instructor.name = name ?? instructor.name;
    instructor.email = email ?? instructor.email;
    instructor.phone = phone ?? instructor.phone;
    instructor.courseIds = finalCourseIds;
    await instructor.save();

    // ✅ Sync courses
    await syncRelation({
      targetModel: courseModel,
      sourceId: instructor._id,
      targetField: "instructorIds",
      oldTargetIds: oldCourseIds,
      newTargetIds: finalCourseIds
    });

    const populatedInstructor = await Instructor.findById(instructor._id)
      .populate("courseIds", "name description duration");

    res.json({ success: true, message: "instructor updated successfully", instructor: populatedInstructor });
  } catch (err) {
    console.error("Update instructor Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find()
      .populate("courseIds", "name description duration");

    res.status(200).json({
      success: true,
      message: "instructors fetched successfully",
      totalInstructors: instructors.length,
      instructors
    });
  } catch (err) {
    console.error("Fetch instructors Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructors",
    });
  }
};


export const getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id)
      .populate("courseIds", "name description duration"); // ✅ Populate full course details

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "instructor not found with given ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "instructor fetched successfully",
      instructor
    });

  } catch (err) {
    console.error("Get instructor Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor",
    });
  }
};



export const deleteInstructor = async (req, res) => {
  try {
    const deleted = await Instructor.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "instructor not found or already deleted",
      });
    }

    res.status(200).json({ success: true, message: "instructor deleted successfully" });

  } catch (err) {
    console.error("Delete instructor Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete instructor" });
  }
};
