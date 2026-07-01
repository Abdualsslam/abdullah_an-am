import { Router } from 'express';
import { login, setup, checkSetup } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/setup', setup);
router.get('/check-setup', checkSetup);

export default router;
