import { Router } from 'express';
import { handleCreatePaymentOrder, handleVerifyPayment } from '../controllers/paymentController.js';
import { optionalAuth } from '../controllers/authController.js';

const router = Router();

router.post('/create-order', optionalAuth, handleCreatePaymentOrder);
router.post('/verify', optionalAuth, handleVerifyPayment);

export default router;
