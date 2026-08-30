import {
  getAdminComplaints,
  updateAdminComplaint,
  addAdminCommentUpdate,
  resolveAdminComplaint,
  toggleAdminEscalation,
  getAdminStatistics,
  getDepartmentStatistics,
  getCategoryStatistics,
  getStatusStatistics,
} from '../services/adminService.js';
import { getComplaintDetails } from '../services/complaintService.js';

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await getAdminComplaints(req.query);

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const details = await getComplaintDetails(id, req.user);

    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const complaint = await updateAdminComplaint(id, req.user, req.body);

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    const result = await addAdminCommentUpdate(id, req.user, { message, status });

    res.status(200).json({
      success: true,
      message: 'Admin update recorded',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolutionDetails } = req.body;

    const complaint = await resolveAdminComplaint(id, req.user, { resolutionDetails });

    res.status(200).json({
      success: true,
      message: 'Complaint marked as resolved',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEscalate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isEscalated } = req.body;

    const complaint = await toggleAdminEscalation(id, req.user, isEscalated);

    res.status(200).json({
      success: true,
      message: `Complaint escalation status updated to ${isEscalated}`,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = await getAdminStatistics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentStats = async (req, res, next) => {
  try {
    const stats = await getDepartmentStatistics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await getCategoryStatistics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatusStats = async (req, res, next) => {
  try {
    const stats = await getStatusStatistics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
