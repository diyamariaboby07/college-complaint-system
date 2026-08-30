import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    complaintFormattedId: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: [
        'complaint_submitted',
        'complaint_assigned',
        'status_changed',
        'priority_changed',
        'admin_comment',
        'complaint_resolved',
        'complaint_closed',
        'complaint_escalated',
        'feedback_received',
      ],
      default: 'status_changed',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
