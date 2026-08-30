import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Classroom',
        'Laboratory',
        'Hostel',
        'Wi-Fi / Internet',
        'Infrastructure',
        'Transportation',
        'Cleanliness',
        'Other',
      ],
      default: 'Other',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Submitted',
    },
    department: {
      type: String,
      enum: [
        'Administration',
        'IT Department',
        'Maintenance',
        'Hostel',
        'Transportation',
        'Housekeeping',
        'Laboratory',
        'Unassigned',
      ],
      default: 'Unassigned',
    },
    assignedStaff: {
      type: String,
      default: '',
      trim: true,
    },
    adminComment: {
      type: String,
      default: '',
      trim: true,
    },
    resolutionDetails: {
      type: String,
      default: '',
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    isEscalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    imageClassification: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate complaint ID helper pre-save if not existing
complaintSchema.pre('validate', async function (next) {
  if (!this.complaintId) {
    try {
      const count = await mongoose.model('Complaint').countDocuments();
      const nextNum = count + 1;
      this.complaintId = `CMP-${String(nextNum).padStart(3, '0')}`;
    } catch (err) {
      this.complaintId = `CMP-${Date.now().toString().slice(-4)}`;
    }
  }
  next();
});

export const Complaint = mongoose.model('Complaint', complaintSchema);
