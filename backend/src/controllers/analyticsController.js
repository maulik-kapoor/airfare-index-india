import {
  getMarketKPIs,
  getAllRoutesData,
  getRouteBaseline,
  getBookingWindowAnalytics,
  getAirlineIntelligence,
  getOtaIntelligence,
  getAbnormalMovements,
  getRoundTripAnalysis,
  getTravelDateTrends,
  getMethodology,
} from '../services/airfareIndexService.js';

export async function handleGetKPIs(req, res) {
  try {
    const kpis = getMarketKPIs();
    return res.status(200).json({ success: true, data: kpis });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get KPIs.' });
  }
}

export async function handleGetRoutes(req, res) {
  try {
    const routes = getAllRoutesData();
    return res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get routes.' });
  }
}

export async function handleGetRouteDetails(req, res) {
  try {
    const { origin, destination } = req.params;
    const details = getRouteBaseline(origin, destination);
    return res.status(200).json({ success: true, data: details });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get route details.' });
  }
}

export async function handleGetBookingWindows(req, res) {
  try {
    const data = getBookingWindowAnalytics();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get booking windows.' });
  }
}

export async function handleGetAirlineIntelligence(req, res) {
  try {
    const data = getAirlineIntelligence();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get airline analytics.' });
  }
}

export async function handleGetOtaIntelligence(req, res) {
  try {
    const data = getOtaIntelligence();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get OTA analytics.' });
  }
}

export async function handleGetAnomalies(req, res) {
  try {
    const data = getAbnormalMovements();
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get anomalies.' });
  }
}

export async function handleGetRoundTrip(req, res) {
  try {
    const data = getRoundTripAnalysis();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get round-trip analytics.' });
  }
}

export async function handleGetTravelDates(req, res) {
  try {
    const data = getTravelDateTrends();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get travel date analytics.' });
  }
}

export async function handleGetMethodology(req, res) {
  try {
    const data = getMethodology();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get methodology.' });
  }
}

// Backward-compatible wrapper
export async function handleGetAnalyticsSummary(req, res) {
  try {
    const kpis = getMarketKPIs();
    return res.status(200).json({
      success: true,
      data: {
        trackedRoutesCount: kpis.totalRoutes,
        averageFare: Math.round(kpis.averageFare),
        airlinesTracked: kpis.totalAirlines,
        activeAnomaliesDetected: kpis.totalAnomalies,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get summary.' });
  }
}
