import { Router } from 'express';
import {
  getComplaints,
  getComplaint,
  updateComplaint,
  addComment,
  resolveComplaint,
  toggleEscalate,
  getStatistics,
  getDepartmentStats,
  getCategoryStats,
  getStatusStats,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect all admin endpoints
router.use(protect);
router.use(requireRole('admin'));

// Complaint management
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaint);
router.put('/complaints/:id', updateComplaint);
router.post('/complaints/:id/update', addComment);
router.post('/complaints/:id/resolve', resolveComplaint);
router.post('/complaints/:id/escalate', toggleEscalate);

// Analytics endpoints
router.get('/statistics', getStatistics);
router.get('/statistics/departments', getDepartmentStats);
router.get('/statistics/categories', getCategoryStats);
router.get('/statistics/status', getStatusStats);

export default router;
