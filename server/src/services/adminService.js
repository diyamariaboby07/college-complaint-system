import { Complaint } from '../models/Complaint.js';
import { ComplaintUpdate } from '../models/ComplaintUpdate.js';
import { User } from '../models/User.js';
import { emitSocketEvent } from '../sockets/socketHandler.js';
import { createAndSendNotification } from './notificationService.js';
import { checkAndEscalateComplaints } from './escalationService.js';

export const getAdminComplaints = async ({
  search,
  status,
  category,
  priority,
  department,
  isEscalated,
} = {}) => {
  // Trigger lightweight auto-escalation check
  await checkAndEscalateComplaints();

  const query = {};

  if (status && status !== 'all') query.status = status;
  if (category && category !== 'all') query.category = category;
  if (priority && priority !== 'all') query.priority = priority;
  if (department && department !== 'all') query.department = department;
  if (isEscalated !== undefined && isEscalated !== 'all') {
    query.isEscalated = isEscalated === 'true' || isEscalated === true;
  }

  let complaintsQuery = Complaint.find(query)
    .sort({ createdAt: -1 })
    .populate('studentId', 'name email studentId department year');

  if (search) {
    const studentMatches = await User.find({
      name: { $regex: search, $options: 'i' },
    }).select('_id');

    const studentIds = studentMatches.map((s) => s._id);

    query.$or = [
      { complaintId: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { studentId: { $in: studentIds } },
    ];

    complaintsQuery = Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email studentId department year');
  }

  return complaintsQuery;
};

export const updateAdminComplaint = async (complaintId, adminUser, updateData) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const previousStatus = complaint.status;
  const previousPriority = complaint.priority;
  const previousDepartment = complaint.department;
  const previousStaff = complaint.assignedStaff;

  const { status, priority, department, assignedStaff, adminComment, resolutionDetails } = updateData;

  if (status) complaint.status = status;
  if (priority) complaint.priority = priority;
  if (department) complaint.department = department;
  if (assignedStaff !== undefined) complaint.assignedStaff = assignedStaff.trim();
  if (adminComment !== undefined) complaint.adminComment = adminComment.trim();
  if (resolutionDetails !== undefined) complaint.resolutionDetails = resolutionDetails.trim();

  if (status === 'Resolved' && !complaint.resolvedAt) {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  // Log timeline messages
  const logs = [];
  if (status && status !== previousStatus) {
    logs.push(`Status updated from "${previousStatus}" to "${status}"`);
  }
  if (priority && priority !== previousPriority) {
    logs.push(`Priority changed from "${previousPriority}" to "${priority}"`);
  }
  if (department && department !== previousDepartment) {
    logs.push(`Assigned to ${department}${assignedStaff ? ` (Staff: ${assignedStaff})` : ''}`);
  } else if (assignedStaff && assignedStaff !== previousStaff) {
    logs.push(`Assigned staff changed to "${assignedStaff}"`);
  }
  if (adminComment && adminComment.trim()) {
    logs.push(`Admin note: "${adminComment.trim()}"`);
  }

  const combinedLog = logs.join(' | ') || `Complaint details updated by administrator`;

  await ComplaintUpdate.create({
    complaintId: complaint._id,
    adminId: adminUser._id,
    message: combinedLog,
    status: complaint.status,
  });

  // Notify student
  await createAndSendNotification({
    userId: complaint.studentId,
    complaintId: complaint._id,
    complaintFormattedId: complaint.complaintId,
    type: status !== previousStatus ? 'status_changed' : 'complaint_assigned',
    title: `Update on ${complaint.complaintId}`,
    message: combinedLog,
  });

  // Real-time update emit
  emitSocketEvent({
    event: 'complaint:updated',
    data: complaint,
    userId: complaint.studentId.toString(),
    notifyAdmin: true,
  });

  return complaint;
};

export const addAdminCommentUpdate = async (complaintId, adminUser, { message, status }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (status && status !== complaint.status) {
    complaint.status = status;
    if (status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }
  }

  complaint.adminComment = message;
  await complaint.save();

  const updateRecord = await ComplaintUpdate.create({
    complaintId: complaint._id,
    adminId: adminUser._id,
    message: message.trim(),
    status: complaint.status,
  });

  await createAndSendNotification({
    userId: complaint.studentId,
    complaintId: complaint._id,
    complaintFormattedId: complaint.complaintId,
    type: 'admin_comment',
    title: `New update on ${complaint.complaintId}`,
    message: `Admin update: ${message}`,
  });

  emitSocketEvent({
    event: 'complaint:updated',
    data: complaint,
    userId: complaint.studentId.toString(),
    notifyAdmin: true,
  });

  return { complaint, updateRecord };
};

export const resolveAdminComplaint = async (complaintId, adminUser, { resolutionDetails }) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.status = 'Resolved';
  complaint.resolutionDetails = resolutionDetails ? resolutionDetails.trim() : 'The issue has been resolved.';
  complaint.resolvedAt = new Date();
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId: complaint._id,
    adminId: adminUser._id,
    message: `Issue marked as Resolved. Resolution: ${complaint.resolutionDetails}`,
    status: 'Resolved',
  });

  await createAndSendNotification({
    userId: complaint.studentId,
    complaintId: complaint._id,
    complaintFormattedId: complaint.complaintId,
    type: 'complaint_resolved',
    title: `Complaint Resolved: ${complaint.complaintId}`,
    message: `Your complaint "${complaint.title}" has been marked as Resolved. ${complaint.resolutionDetails}`,
  });

  emitSocketEvent({
    event: 'complaint:resolved',
    data: complaint,
    userId: complaint.studentId.toString(),
    notifyAdmin: true,
  });

  return complaint;
};

export const toggleAdminEscalation = async (complaintId, adminUser, isEscalated) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.isEscalated = isEscalated;
  complaint.escalatedAt = isEscalated ? new Date() : null;
  await complaint.save();

  await ComplaintUpdate.create({
    complaintId: complaint._id,
    adminId: adminUser._id,
    message: isEscalated ? 'Complaint marked as Escalated ⚠️' : 'Complaint de-escalated',
    status: complaint.status,
  });

  emitSocketEvent({
    event: 'complaint:escalated',
    data: complaint,
    notifyAdmin: true,
  });

  return complaint;
};

/**
 * Analytics and Summary Statistics
 */
export const getAdminStatistics = async () => {
  await checkAndEscalateComplaints();

  const total = await Complaint.countDocuments();
  const submitted = await Complaint.countDocuments({ status: 'Submitted' });
  const underReview = await Complaint.countDocuments({ status: 'Under Review' });
  const assigned = await Complaint.countDocuments({ status: 'Assigned' });
  const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
  const resolved = await Complaint.countDocuments({ status: 'Resolved' });
  const closed = await Complaint.countDocuments({ status: 'Closed' });
  const critical = await Complaint.countDocuments({ priority: 'Critical' });
  const escalated = await Complaint.countDocuments({ isEscalated: true, status: { $nin: ['Resolved', 'Closed'] } });

  const pending = submitted + underReview + assigned + inProgress;

  // Resolution time calculations for resolved complaints
  const resolvedComplaints = await Complaint.find({
    resolvedAt: { $ne: null },
  }).select('createdAt resolvedAt');

  let avgResolutionHours = 0;
  let fastestResolutionHours = 0;
  let longestResolutionHours = 0;

  if (resolvedComplaints.length > 0) {
    const durations = resolvedComplaints.map(
      (c) => (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60)
    );

    const totalHours = durations.reduce((acc, curr) => acc + curr, 0);
    avgResolutionHours = Math.round((totalHours / durations.length) * 10) / 10;
    fastestResolutionHours = Math.round(Math.min(...durations) * 10) / 10;
    longestResolutionHours = Math.round(Math.max(...durations) * 10) / 10;
  }

  return {
    total,
    pending,
    submitted,
    underReview,
    assigned,
    inProgress,
    resolved,
    closed,
    critical,
    escalated,
    resolutionTimes: {
      count: resolvedComplaints.length,
      averageHours: avgResolutionHours,
      fastestHours: fastestResolutionHours,
      longestHours: longestResolutionHours,
      formattedAverage:
        avgResolutionHours >= 24
          ? `${Math.floor(avgResolutionHours / 24)}d ${Math.round(avgResolutionHours % 24)}h`
          : `${avgResolutionHours}h`,
    },
  };
};

export const getDepartmentStatistics = async () => {
  const departments = [
    'Administration',
    'IT Department',
    'Maintenance',
    'Hostel',
    'Transportation',
    'Housekeeping',
    'Laboratory',
    'Unassigned',
  ];

  const stats = await Promise.all(
    departments.map(async (dept) => {
      const total = await Complaint.countDocuments({ department: dept });
      const pending = await Complaint.countDocuments({
        department: dept,
        status: { $in: ['Submitted', 'Under Review', 'Assigned', 'In Progress'] },
      });
      const resolved = await Complaint.countDocuments({
        department: dept,
        status: { $in: ['Resolved', 'Closed'] },
      });
      return {
        department: dept,
        total,
        pending,
        resolved,
      };
    })
  );

  return stats;
};

export const getCategoryStatistics = async () => {
  const categories = [
    'Classroom',
    'Laboratory',
    'Hostel',
    'Wi-Fi / Internet',
    'Infrastructure',
    'Transportation',
    'Cleanliness',
    'Other',
  ];

  const stats = await Promise.all(
    categories.map(async (category) => {
      const count = await Complaint.countDocuments({ category });
      return { category, count };
    })
  );

  return stats;
};

export const getStatusStatistics = async () => {
  const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  const stats = await Promise.all(
    statuses.map(async (status) => {
      const count = await Complaint.countDocuments({ status });
      return { status, count };
    })
  );

  return stats;
};
