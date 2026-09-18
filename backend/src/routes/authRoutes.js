import { Router } from 'express';
import { handleRegister, handleLogin, handleGetMe, verifyAuth } from '../controllers/authController.js';

const router = Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/me', verifyAuth, handleGetMe);

export default router;
