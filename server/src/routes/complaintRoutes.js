import { Router } from 'express';
import {
  submitComplaint,
  getMyComplaints,
  getComplaintById,
  submitFeedback,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', upload.single('image'), submitComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/feedback', submitFeedback);

export default router;
