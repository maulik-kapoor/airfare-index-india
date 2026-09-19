/**
 * Transit Information definitions strictly for the 2 predefined routes:
 * 1. DEL -> AMS -> MSP -> YYZ
 * 2. DEL -> CDG -> AMS -> YYZ
 */
export const PREDEFINED_TRANSIT_DATA = {
  'DEL-AMS-MSP-YYZ': {
    routeKey: 'DEL-AMS-MSP-YYZ',
    routeDisplay: 'Delhi → Amsterdam → Minneapolis → Toronto',
    stops: 2,
    transits: [
      { flag: '🇳🇱', label: 'Amsterdam, Netherlands', code: 'AMS', country: 'Netherlands' },
      { flag: '🇺🇸', label: 'Minneapolis, United States', code: 'MSP', country: 'United States' },
    ],
    finalDestination: 'Toronto, Canada',
    destinationCode: 'YYZ',
    originCode: 'DEL',
    message: "This itinerary includes transit through the Netherlands and the United States. Transit and immigration requirements may depend on the passenger's nationality, passport, visa/residence status and itinerary conditions.",
    authorityAdvisory: 'Transit requirements should be verified with the relevant official immigration authority before travel.',
  },
  'DEL-CDG-AMS-YYZ': {
    routeKey: 'DEL-CDG-AMS-YYZ',
    routeDisplay: 'Delhi → Paris → Amsterdam → Toronto',
    stops: 2,
    transits: [
      { flag: '🇫🇷', label: 'Paris, France', code: 'CDG', country: 'France' },
      { flag: '🇳🇱', label: 'Amsterdam, Netherlands', code: 'AMS', country: 'Netherlands' },
    ],
    finalDestination: 'Toronto, Canada',
    destinationCode: 'YYZ',
    originCode: 'DEL',
    message: "This itinerary includes transit through France and the Netherlands. Transit and immigration requirements may depend on the passenger's nationality, passport, visa/residence status and itinerary conditions.",
    authorityAdvisory: 'Transit requirements should be verified with the relevant official immigration authority before travel.',
  },
};

export function getOfferTransitInfo(offer) {
  if (!offer) return null;
  if (offer.transitInfo) return offer.transitInfo;
  if (offer.routeCode && PREDEFINED_TRANSIT_DATA[offer.routeCode]) {
    return PREDEFINED_TRANSIT_DATA[offer.routeCode];
  }
  if (offer.id === 'predefined_del_ams_msp_yyz' || offer.offerId === 'predefined_del_ams_msp_yyz') {
    return PREDEFINED_TRANSIT_DATA['DEL-AMS-MSP-YYZ'];
  }
  if (offer.id === 'predefined_del_cdg_ams_yyz' || offer.offerId === 'predefined_del_cdg_ams_yyz') {
    return PREDEFINED_TRANSIT_DATA['DEL-CDG-AMS-YYZ'];
  }
  if (
    offer.origin === 'DEL' &&
    offer.destination === 'YYZ' &&
    (offer.stopover?.includes('Amsterdam') && offer.stopover?.includes('Minneapolis'))
  ) {
    return PREDEFINED_TRANSIT_DATA['DEL-AMS-MSP-YYZ'];
  }
  if (
    offer.origin === 'DEL' &&
    offer.destination === 'YYZ' &&
    (offer.stopover?.includes('Paris') && offer.stopover?.includes('Amsterdam'))
  ) {
    return PREDEFINED_TRANSIT_DATA['DEL-CDG-AMS-YYZ'];
  }
  return null;
}
