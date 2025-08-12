import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: false }, // in days
    branchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    inspectorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Inspector" }]
});

const courseModel = mongoose.model('Course', courseSchema);
export default courseModel;