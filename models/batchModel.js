import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  inspectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspector',
    required: [true, 'Inspector is required']
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required']
  },
//   status: {
//     type: String,
//     enum: ['Booked', 'Pending', 'Cancelled'],
//     default: 'Booked'
//   }
}, {
  timestamps: true
});

const batchModel = mongoose.model('Batch', batchSchema);
export default batchModel;
