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
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'instructor',
    required: [true, 'instructor is required']
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required']
  },
    code: {
    type: String,
    required: [true, 'Batch code is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming scheduler is a user
    required: [true, 'Scheduled by is required']
  },
  status: {
    type: String,
    enum: ['Up Coming', 'On Going', 'Completed'],
    default: 'Up Coming'
  }
}, {
  timestamps: true
});

const batchModel = mongoose.model('Batch', batchSchema);
export default batchModel;
