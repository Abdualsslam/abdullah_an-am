import { Router } from 'express';
import { trackPageView, getAnalyticsStats } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/track', trackPageView);
router.get('/stats', protect, getAnalyticsStats);

export default router;
