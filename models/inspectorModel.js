import mongoose from 'mongoose';

const inspectorSchema= new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^(\+[1-9][0-9]{1,3}\s?)?[1-9][0-9]{9,13}$/, 
        "Invalid international phone number",
      ],
    },
  totalBatches: { type: Number, default: 0 },
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  branchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
}, { timestamps: true });

const inspectorModel = mongoose.model('Inspector', inspectorSchema);

export default inspectorModel;
