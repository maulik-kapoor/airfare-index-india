import { Router } from 'express';
import {
  handleGetKPIs,
  handleGetRoutes,
  handleGetRouteDetails,
  handleGetBookingWindows,
  handleGetAirlineIntelligence,
  handleGetOtaIntelligence,
  handleGetAnomalies,
  handleGetRoundTrip,
  handleGetTravelDates,
  handleGetMethodology,
  handleGetAnalyticsSummary,
} from '../controllers/analyticsController.js';

const router = Router();

router.get('/kpis', handleGetKPIs);
router.get('/summary', handleGetAnalyticsSummary);
router.get('/routes', handleGetRoutes);
router.get('/route/:origin/:destination', handleGetRouteDetails);
router.get('/booking-windows', handleGetBookingWindows);
router.get('/airline-intelligence', handleGetAirlineIntelligence);
router.get('/ota-comparison', handleGetOtaIntelligence);
router.get('/anomalies', handleGetAnomalies);
router.get('/round-trip', handleGetRoundTrip);
router.get('/travel-dates', handleGetTravelDates);
router.get('/methodology', handleGetMethodology);

export default router;
