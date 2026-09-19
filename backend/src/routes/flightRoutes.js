import { Router } from 'express';
import {
  handleFlightSearch,
  handleGetOfferDetails,
  handleValidateOfferPrice,
  handleCreateBookingHold,
  handleVerifyTransitEligibility,
} from '../controllers/flightController.js';
import { optionalAuth } from '../controllers/authController.js';

const router = Router();

router.post('/search', optionalAuth, handleFlightSearch);
router.post('/hold', handleCreateBookingHold);
router.post('/verify-transit', handleVerifyTransitEligibility);
router.get('/:offerId', handleGetOfferDetails);
router.post('/:offerId/price', handleValidateOfferPrice);

export default router;
