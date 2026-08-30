import { Router } from 'express';
import { categorize, summarize, imageClassify, checkDuplicate } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/categorize', categorize);
router.post('/summarize', summarize);
router.post('/image-classify', imageClassify);
router.post('/check-duplicate', checkDuplicate);

export default router;
