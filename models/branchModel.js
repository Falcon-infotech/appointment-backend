import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  branchName: { type: String, required: true },
  country: { type: String, required: true },
  branchCode: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
}, { timestamps: true });

const branchModel = mongoose.model('Branch', branchSchema)

export default branchModel;
