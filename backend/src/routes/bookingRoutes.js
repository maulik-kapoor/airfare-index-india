import { Router } from 'express';
import {
  handleCreateBooking,
  handleGetBookings,
  handleGetBookingById,
  handleCancelBooking,
} from '../controllers/bookingController.js';
import { optionalAuth } from '../controllers/authController.js';

const router = Router();

router.post('/', optionalAuth, handleCreateBooking);
router.get('/', optionalAuth, handleGetBookings);
router.get('/:id', optionalAuth, handleGetBookingById);
router.post('/:id/cancel', optionalAuth, handleCancelBooking);

export default router;
