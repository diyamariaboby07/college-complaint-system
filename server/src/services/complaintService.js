import { Complaint } from '../models/Complaint.js';
import { ComplaintUpdate } from '../models/ComplaintUpdate.js';
import { User } from '../models/User.js';
import { emitSocketEvent } from '../sockets/socketHandler.js';
import { createAndSendNotification } from './notificationService.js';
import { summarizeComplaint, classifyImageIssue } from './aiService.js';

export const createComplaint = async (studentId, complaintData, imageBuffer = null, mimeType = null) => {
  const { title, category, description, location, priority = 'Low', customImageUrl } = complaintData;

  let imageUrl = customImageUrl || '';

  // If image buffer is provided, convert to base64 Data URI for instant persistent zero-config storage
  if (imageBuffer && mimeType) {
    const base64Data = imageBuffer.toString('base64');
    imageUrl = `data:${mimeType};base64,${base64Data}`;
  }

  // Generate summary if missing
  let summary = complaintData.summary;
  if (!summary) {
    const aiSummaryRes = await summarizeComplaint({ title, description });
    summary = aiSummaryRes.summary;
  }

  // Lightweight image classification
  let imageClassification = '';
  if (imageUrl) {
    const classificationRes = await classifyImageIssue({ category, title, description });
    imageClassification = classificationRes.possibleIssue;
  }

  const complaint = await Complaint.create({
    studentId,
    title: title.trim(),
    category,
    description: description.trim(),
    summary,
    location: location.trim(),
    imageUrl,
    priority: ['Low', 'Medium', 'High', 'Critical'].includes(priority) ? priority : 'Low',
    status: 'Submitted',
    imageClassification,
  });

  // Create initial timeline event
  await ComplaintUpdate.create({
    complaintId: complaint._id,
    adminId: studentId, // initial creation record
    message: `Complaint ${complaint.complaintId} submitted by student`,
    status: 'Submitted',
  });

  // Real-time broadcast to Admin room
  emitSocketEvent({
    event: 'complaint:created',
    data: complaint,
    notifyAdmin: true,
  });

  // Notify student in database & real-time
  await createAndSendNotification({
    userId: studentId,
    complaintId: complaint._id,
    complaintFormattedId: complaint.complaintId,
    type: 'complaint_submitted',
    title: 'Complaint Submitted Successfully',
    message: `Your complaint "${complaint.title}" has been registered with reference ID ${complaint.complaintId}.`,
  });

  return complaint;
};

export const getStudentComplaints = async (studentId, { status, category, priority, search } = {}) => {
  const query = { studentId };

  if (status && status !== 'all') {
    query.status = status;
  }
  if (category && category !== 'all') {
    query.category = category;
  }
  if (priority && priority !== 'all') {
    query.priority = priority;
  }
  if (search) {
    query.$or = [
      { complaintId: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  return Complaint.find(query).sort({ createdAt: -1 }).populate('studentId', 'name email studentId department');
};

export const getComplaintDetails = async (complaintId, user) => {
  let complaint;

  // Support lookup by MongoDB _id or human readable complaintId (e.g. CMP-001)
  if (complaintId.startsWith('CMP-')) {
    complaint = await Complaint.findOne({ complaintId }).populate('studentId', 'name email studentId department year');
  } else {
    complaint = await Complaint.findById(complaintId).populate('studentId', 'name email studentId department year');
  }

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: students can only view their own complaints
  if (user.role === 'student' && complaint.studentId._id.toString() !== user._id.toString()) {
    const error = new Error('You are not authorized to view this complaint');
    error.statusCode = 403;
    throw error;
  }

  // Fetch chronological timeline updates
  const updates = await ComplaintUpdate.find({ complaintId: complaint._id })
    .sort({ createdAt: 1 })
    .populate('adminId', 'name role department');

  return {
    complaint,
    updates,
  };
};

export const addStudentFeedback = async (complaintId, studentId, { rating, feedback }) => {
  const complaint = await Complaint.findOne({
    _id: complaintId,
    studentId,
  });

  if (!complaint) {
    const error = new Error('Complaint not found or you are not authorized');
    error.statusCode = 404;
    throw error;
  }

  if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
    const error = new Error('Feedback can only be provided after the complaint is resolved');
    error.statusCode = 400;
    throw error;
  }

  if (complaint.rating) {
    const error = new Error('Feedback has already been submitted for this complaint');
    error.statusCode = 400;
    throw error;
  }

  complaint.rating = Number(rating);
  complaint.feedback = feedback ? feedback.trim() : '';
  complaint.status = 'Closed';
  await complaint.save();

  // Add timeline update
  await ComplaintUpdate.create({
    complaintId: complaint._id,
    adminId: studentId,
    message: `Student submitted feedback: ⭐ ${complaint.rating}/5 stars. ${complaint.feedback ? `"${complaint.feedback}"` : ''} — Complaint lifecycle Closed.`,
    status: 'Closed',
  });

  // Notify admins
  emitSocketEvent({
    event: 'complaint:updated',
    data: complaint,
    notifyAdmin: true,
  });

  return complaint;
};
