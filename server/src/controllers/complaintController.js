import {
  createComplaint,
  getStudentComplaints,
  getComplaintDetails,
  addStudentFeedback,
} from '../services/complaintService.js';

export const submitComplaint = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const fileBuffer = req.file ? req.file.buffer : null;
    const mimeType = req.file ? req.file.mimetype : null;

    const complaint = await createComplaint(studentId, req.body, fileBuffer, mimeType);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { status, category, priority, search } = req.query;

    const complaints = await getStudentComplaints(studentId, { status, category, priority, search });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
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

export const submitFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;
    const studentId = req.user._id;

    const complaint = await addStudentFeedback(id, studentId, { rating, feedback });

    res.status(200).json({
      success: true,
      message: 'Thank you for submitting your feedback!',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};
