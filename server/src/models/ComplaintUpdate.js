import mongoose from 'mongoose';

const complaintUpdateSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Update message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ComplaintUpdate = mongoose.model('ComplaintUpdate', complaintUpdateSchema);
