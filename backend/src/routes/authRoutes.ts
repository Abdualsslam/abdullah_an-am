import { Router } from 'express';
import { login, setup, checkSetup, changeCredentials } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/setup', setup);
router.get('/check-setup', checkSetup);
router.put('/change-credentials', protect, changeCredentials);

export default router;

