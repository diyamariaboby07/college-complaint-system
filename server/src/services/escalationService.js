import { Complaint } from '../models/Complaint.js';

const ESCALATION_THRESHOLDS = {
  Critical: 24 * 60 * 60 * 1000, // 24 hours
  High: 48 * 60 * 60 * 1000, // 48 hours
  Medium: 72 * 60 * 60 * 1000, // 72 hours
  Low: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Check if a single complaint has exceeded its resolution threshold
 */
export const isComplaintOverdue = (complaint) => {
  if (!complaint || complaint.status === 'Resolved' || complaint.status === 'Closed') {
    return false;
  }

  const thresholdMs = ESCALATION_THRESHOLDS[complaint.priority] || ESCALATION_THRESHOLDS.Low;
  const elapsedMs = Date.now() - new Date(complaint.createdAt).getTime();

  return elapsedMs > thresholdMs;
};

/**
 * Batch update escalation status across active complaints
 */
export const checkAndEscalateComplaints = async () => {
  try {
    const activeComplaints = await Complaint.find({
      status: { $nin: ['Resolved', 'Closed'] },
      isEscalated: false,
    });

    const escalated = [];

    for (const complaint of activeComplaints) {
      if (isComplaintOverdue(complaint)) {
        complaint.isEscalated = true;
        complaint.escalatedAt = new Date();
        await complaint.save();
        escalated.push(complaint);
      }
    }

    return escalated;
  } catch (error) {
    console.error('Escalation service error:', error.message);
    return [];
  }
};
