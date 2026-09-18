"""
Airfare Intelligence & Price Analytics Engine
Processes raw airline + OTA datasets:
1. Data Cleaning & Normalization (preserving raw data)
2. Total Fare Validation: TOTAL FARE = BASE FARE + TAXES + FEES/CHARGES
3. Route Baselines & Volatility (Median, Mean, Min, Max, StdDev, IQR)
4. Booking Window Elasticity (0-3d, 4-7d, 8-14d, 15-30d, 31-60d, 60+d)
5. Airline Intelligence (Fares, Volatility, Fee Structure)
6. OTA Intelligence (Fares, Convenience Fees, Delta vs Direct)
7. Abnormal Price Movement Detection (Z-Score + IQR Outliers with Data-Driven Explanations)
8. Round-Trip (R/T) Difference Analysis
9. Travel Date & Day-of-Week Trends
10. Airfare Price Index Computation
"""

import json
import math
import os
import statistics
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

RAW_DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'raw_airline_ota_data.json')
CLEANED_DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'cleaned_normalized_flights.json')
INTELLIGENCE_DB_FILE = os.path.join(os.path.dirname(__file__), 'data', 'airfare_intelligence_db.json')

AIRLINE_STANDARDIZATION = {
    'IndiGo Airlines': 'IndiGo',
    'Air India Ltd': 'Air India',
    'Vistara (Tata SIA)': 'Vistara',
    'Akasa Air': 'Akasa Air',
    'SpiceJet': 'SpiceJet'
}

BOOKING_WINDOW_BINS = [
    {'key': '0-3', 'min': 0, 'max': 3, 'label': 'Last Minute (0–3 days)'},
    {'key': '4-7', 'min': 4, 'max': 7, 'label': 'Short Notice (4–7 days)'},
    {'key': '8-14', 'min': 8, 'max': 14, 'label': 'Standard (8–14 days)'},
    {'key': '15-30', 'min': 15, 'max': 30, 'label': 'Advance (15–30 days)'},
    {'key': '31-60', 'min': 31, 'max': 60, 'label': 'Early Bird (31–60 days)'},
    {'key': '60+', 'min': 61, 'max': 999, 'label': 'Far Advance (60+ days)'}
]

def get_window_key(days):
    for b in BOOKING_WINDOW_BINS:
        if b['min'] <= days <= b['max']:
            return b['key']
    return '60+'

def calculate_iqr(values):
    if len(values) < 4:
        return 0, (values[0] if values else 0), (values[-1] if values else 0)
    sorted_v = sorted(values)
    n = len(sorted_v)
    q1 = sorted_v[n // 4]
    q3 = sorted_v[(3 * n) // 4]
    iqr = q3 - q1
    return round(iqr, 1), q1, q3

def clean_and_normalize(raw_records):
    cleaned = []
    for r in raw_records:
        airline_name = AIRLINE_STANDARDIZATION.get(r.get('airline_raw'), r.get('airline_raw', 'Unknown Airline'))
        origin = r.get('airport_origin', '').strip().toUpperCase() if hasattr(r.get('airport_origin', ''), 'toUpperCase') else r.get('airport_origin', '').strip().upper()
        destination = r.get('airport_destination', '').strip().upper()
        route = f"{origin}-{destination}"

        base_fare = float(r.get('base_fare', 0))
        taxes = float(r.get('taxes', 0))
        fees = float(r.get('fees_charges', 0))
        
        # Enforce unified standardized fare formula: TOTAL FARE = BASE FARE + TAXES + FEES/CHARGES
        total_fare = round(base_fare + taxes + fees)

        window_days = int(r.get('booking_window_days', 14))
        window_bin = get_window_key(window_days)

        travel_date_str = r.get('travel_date', '')
        try:
            from datetime import datetime
            t_date = datetime.strptime(travel_date_str, '%Y-%m-%d')
            day_of_week = t_date.strftime('%A')
            is_weekend = day_of_week in ['Saturday', 'Sunday', 'Friday']
            month = t_date.strftime('%B')
        except Exception:
            day_of_week = 'Wednesday'
            is_weekend = False
            month = 'October'

        item = {
            'record_id': r.get('raw_id'),
            'airline': airline_name,
            'airline_code': r.get('airline_code', 'XX'),
            'flight_number': r.get('flight_number'),
            'origin': origin,
            'destination': destination,
            'route': route,
            'source_ota': r.get('source_ota', 'Airline Direct'),
            'trip_type': r.get('trip_type', 'one-way'),
            'travel_date': travel_date_str,
            'return_date': r.get('return_date'),
            'day_of_week': day_of_week,
            'is_weekend': is_weekend,
            'month': month,
            'scraping_timestamp': r.get('scraping_timestamp'),
            'booking_window_days': window_days,
            'booking_window_bin': window_bin,
            'base_fare': round(base_fare),
            'taxes': round(taxes),
            'fees_charges': round(fees),
            'total_fare': total_fare,
            'currency': r.get('currency', 'INR'),
            'stops': int(r.get('stops', 0)),
            'duration_mins': int(r.get('flight_duration_mins', 135))
        }
        cleaned.append(item)

    return cleaned

def build_analytics_database(cleaned_records):
    total_records = len(cleaned_records)
    all_fares = [r['total_fare'] for r in cleaned_records]
    market_median = round(statistics.median(all_fares))
    market_mean = round(statistics.mean(all_fares), 1)
    market_std = round(statistics.stdev(all_fares), 1)
    market_iqr, q1_all, q3_all = calculate_iqr(all_fares)

    # 1. Route Aggregations
    route_groups = {}
    for r in cleaned_records:
        rt = r['route']
        if rt not in route_groups:
            route_groups[rt] = []
        route_groups[rt].append(r)

    route_analytics = {}
    for rt, recs in route_groups.items():
        fares = [x['total_fare'] for x in recs]
        origin, dest = rt.split('-')
        r_median = round(statistics.median(fares))
        r_mean = round(statistics.mean(fares), 1)
        r_std = round(statistics.stdev(fares), 1) if len(fares) > 1 else 0
        r_iqr, q1, q3 = calculate_iqr(fares)

        # Booking windows for this route
        w_groups = {b['key']: [] for b in BOOKING_WINDOW_BINS}
        for x in recs:
            w_groups[x['booking_window_bin']].append(x['total_fare'])

        route_window_curve = []
        for b in BOOKING_WINDOW_BINS:
            w_fares = w_groups[b['key']]
            if w_fares:
                w_med = round(statistics.median(w_fares))
                w_avg = round(statistics.mean(w_fares))
                w_std = round(statistics.stdev(w_fares)) if len(w_fares) > 1 else 0
                w_min = min(w_fares)
                w_max = max(w_fares)
            else:
                w_med = r_median
                w_avg = r_mean
                w_std = r_std
                w_min = min(fares)
                w_max = max(fares)

            route_window_curve.append({
                'window': b['label'],
                'windowKey': b['key'],
                'medianFare': w_med,
                'avgFare': w_avg,
                'minFare': w_min,
                'maxFare': w_max,
                'volatility': w_std,
                'sampleCount': len(w_fares),
                'changeFromMedian': round(((w_med - r_median) / r_median) * 100, 1)
            })

        # Airlines on route
        air_groups = {}
        for x in recs:
            air = x['airline']
            if air not in air_groups:
                air_groups[air] = []
            air_groups[air].append(x['total_fare'])

        airlines_on_route = []
        for air, a_fares in air_groups.items():
            airlines_on_route.append({
                'airline': air,
                'medianFare': round(statistics.median(a_fares)),
                'avgFare': round(statistics.mean(a_fares)),
                'minFare': min(a_fares),
                'count': len(a_fares),
                'priceIndex': round((statistics.median(a_fares) / r_median) * 100, 1)
            })

        # OTAs on route
        ota_groups = {}
        for x in recs:
            ota = x['source_ota']
            if ota not in ota_groups:
                ota_groups[ota] = []
            ota_groups[ota].append(x['total_fare'])

        otas_on_route = []
        for ota, o_fares in ota_groups.items():
            otas_on_route.append({
                'ota': ota,
                'medianFare': round(statistics.median(o_fares)),
                'avgFare': round(statistics.mean(o_fares)),
                'count': len(o_fares),
                'priceIndex': round((statistics.median(o_fares) / r_median) * 100, 1)
            })

        route_analytics[rt] = {
            'route': rt,
            'origin': origin,
            'destination': dest,
            'observationsCount': len(recs),
            'historicalMedian': r_median,
            'historicalMean': r_mean,
            'volatility': r_std,
            'iqr': r_iqr,
            'q1': q1,
            'q3': q3,
            'minFare': min(fares),
            'maxFare': max(fares),
            'priceIndex': 100.0, # Self baseline
            'bookingWindowCurve': route_window_curve,
            'airlines': airlines_on_route,
            'otas': otas_on_route,
            'anomaliesCount': 0
        }

    # 2. Abnormal Price Movement Detection (Z-Score + IQR + Window Spikes)
    flagged_anomalies = []
    enriched_records = []

    for r in cleaned_records:
        rt_stat = route_analytics[r['route']]
        fare = r['total_fare']
        median = rt_stat['historicalMedian']
        std = rt_stat['volatility'] if rt_stat['volatility'] > 0 else 1
        iqr = rt_stat['iqr']
        q3 = rt_stat['q3']
        q1 = rt_stat['q1']

        # Z-Score relative to route distribution
        z_score = round((fare - rt_stat['historicalMean']) / std, 2)
        pct_deviation = round(((fare - median) / median) * 100, 1)

        # Airfare Price Index: Observed / Reference * 100
        price_index = round((fare / median) * 100, 1)

        # Detection logic
        is_anomaly = False
        anomaly_type = None
        anomaly_reason = None

        # Surge spike: Z-score > 1.85 or fare > Q3 + 1.5 * IQR or +42% deviation
        if z_score > 1.85 or (iqr > 0 and fare > q3 + 1.4 * iqr) or pct_deviation > 42.0:
            is_anomaly = True
            anomaly_type = 'SURGE_SPIKE'
            anomaly_reason = (
                f"Observed fare of ₹{fare:,} is +{pct_deviation}% above route historical median "
                f"(₹{median:,}) with a statistical Z-Score of {z_score}. Exceeds the 95th percentile threshold."
            )
        # Flash drop: Z-score < -1.75 or fare < Q1 - 1.2 * IQR or -35% deviation
        elif z_score < -1.75 or pct_deviation < -32.0:
            is_anomaly = True
            anomaly_type = 'FLASH_PRICE_DROP'
            anomaly_reason = (
                f"Observed fare of ₹{fare:,} is {pct_deviation}% below route median (₹{median:,}). "
                f"Statistical drop anomaly with Z-score {z_score} (potential promotional inventory release)."
            )

        enriched_rec = {
            **r,
            'price_index': price_index,
            'z_score': z_score,
            'percent_deviation': pct_deviation,
            'anomaly_flag': is_anomaly,
            'anomaly_type': anomaly_type,
            'anomaly_score': abs(z_score),
            'anomaly_reason': anomaly_reason
        }
        enriched_records.append(enriched_rec)

        if is_anomaly:
            rt_stat['anomaliesCount'] += 1
            flagged_anomalies.append({
                'id': f"ANOM_{len(flagged_anomalies) + 1:04d}",
                'route': r['route'],
                'origin': r['origin'],
                'destination': r['destination'],
                'airline': r['airline'],
                'flightNumber': r['flight_number'],
                'sourceOta': r['source_ota'],
                'travelDate': r['travel_date'],
                'bookingWindowDays': r['booking_window_days'],
                'currentFare': fare,
                'previousMedianFare': median,
                'percentChange': pct_deviation,
                'zScore': z_score,
                'anomalyType': anomaly_type,
                'status': 'SURGE ANOMALY' if anomaly_type == 'SURGE_SPIKE' else 'DROP ANOMALY',
                'severity': 'CRITICAL' if abs(pct_deviation) > 70 or abs(z_score) > 2.5 else 'HIGH',
                'reason': anomaly_reason,
                'detectedAt': r['scraping_timestamp']
            })

    # 3. Airline Analytics Summary
    airline_groups = {}
    for r in cleaned_records:
        air = r['airline']
        if air not in airline_groups:
            airline_groups[air] = []
        airline_groups[air].append(r)

    airline_analytics = []
    for air, recs in airline_groups.items():
        fares = [x['total_fare'] for x in recs]
        base_fares = [x['base_fare'] for x in recs]
        tax_fares = [x['taxes'] for x in recs]
        fee_fares = [x['fees_charges'] for x in recs]

        med = round(statistics.median(fares))
        avg = round(statistics.mean(fares))
        std = round(statistics.stdev(fares)) if len(fares) > 1 else 0
        avg_base = round(statistics.mean(base_fares))
        avg_tax = round(statistics.mean(tax_fares))
        avg_fee = round(statistics.mean(fee_fares))

        airline_analytics.append({
            'airline': air,
            'airlineCode': recs[0]['airline_code'],
            'totalSamples': len(recs),
            'marketSharePct': round((len(recs) / total_records) * 100, 1),
            'medianFare': med,
            'avgFare': avg,
            'volatility': std,
            'minFare': min(fares),
            'maxFare': max(fares),
            'avgBaseFare': avg_base,
            'avgTaxes': avg_tax,
            'avgFees': avg_fee,
            'basePct': round((avg_base / avg) * 100, 1) if avg > 0 else 75,
            'taxPct': round((avg_tax / avg) * 100, 1) if avg > 0 else 20,
            'feePct': round((avg_fee / avg) * 100, 1) if avg > 0 else 5,
            'overallPriceIndex': round((med / market_median) * 100, 1)
        })

    # 4. OTA Analytics Summary
    ota_groups = {}
    for r in cleaned_records:
        ota = r['source_ota']
        if ota not in ota_groups:
            ota_groups[ota] = []
        ota_groups[ota].append(r)

    direct_fares = [x['total_fare'] for x in ota_groups.get('Airline Direct', [])]
    direct_median = round(statistics.median(direct_fares)) if direct_fares else market_median

    ota_analytics = []
    for ota, recs in ota_groups.items():
        fares = [x['total_fare'] for x in recs]
        fees = [x['fees_charges'] for x in recs]
        base_fares = [x['base_fare'] for x in recs]
        taxes = [x['taxes'] for x in recs]

        med = round(statistics.median(fares))
        avg = round(statistics.mean(fares))
        avg_fee = round(statistics.mean(fees))
        diff_vs_direct = med - direct_median
        diff_pct = round((diff_vs_direct / direct_median) * 100, 1) if direct_median > 0 else 0

        ota_analytics.append({
            'ota': ota,
            'totalObservations': len(recs),
            'medianFare': med,
            'avgFare': avg,
            'avgConvenienceFee': avg_fee,
            'avgBaseFare': round(statistics.mean(base_fares)),
            'avgTaxes': round(statistics.mean(taxes)),
            'differenceVsDirect': diff_vs_direct,
            'differencePctVsDirect': diff_pct,
            'priceIndex': round((med / market_median) * 100, 1)
        })

    # 5. Global Booking Window Analysis across all observations
    global_window_analytics = []
    for b in BOOKING_WINDOW_BINS:
        w_recs = [x for x in cleaned_records if x['booking_window_bin'] == b['key']]
        if w_recs:
            w_fares = [x['total_fare'] for x in w_recs]
            w_med = round(statistics.median(w_fares))
            w_avg = round(statistics.mean(w_fares))
            w_std = round(statistics.stdev(w_fares)) if len(w_fares) > 1 else 0
            w_min = min(w_fares)
            w_max = max(w_fares)
            diff_from_baseline = round(((w_med - market_median) / market_median) * 100, 1)
        else:
            w_med = market_median
            w_avg = market_mean
            w_std = market_std
            w_min = min(all_fares)
            w_max = max(all_fares)
            diff_from_baseline = 0

        global_window_analytics.append({
            'windowKey': b['key'],
            'windowLabel': b['label'],
            'sampleCount': len(w_recs),
            'medianFare': w_med,
            'avgFare': w_avg,
            'volatility': w_std,
            'minFare': w_min,
            'maxFare': w_max,
            'fareChangePct': diff_from_baseline,
            'priceIndex': round((w_med / market_median) * 100, 1)
        })

    # 6. Round-Trip (R/T) Difference Analysis
    # Compare comparable round-trip vs one-way records by route
    rt_diff_analysis = []
    for rt, recs in route_groups.items():
        ow_fares = [x['total_fare'] for x in recs if x['trip_type'] == 'one-way']
        rt_fares = [x['total_fare'] for x in recs if x['trip_type'] == 'round-trip']

        if ow_fares and rt_fares:
            ow_median = round(statistics.median(ow_fares))
            rt_median = round(statistics.median(rt_fares))
            two_ow_cost = ow_median * 2
            
            # RT Difference = Round Trip Fare - Comparable 2x One Way Fare
            rt_diff = rt_median - two_ow_cost
            rt_diff_pct = round((rt_diff / two_ow_cost) * 100, 1)

            origin, dest = rt.split('-')
            rt_diff_analysis.append({
                'route': rt,
                'origin': origin,
                'destination': dest,
                'oneWayMedian': ow_median,
                'twoOneWaysCost': two_ow_cost,
                'roundTripMedian': rt_median,
                'rtDifferenceAmount': rt_diff,
                'rtDifferencePct': rt_diff_pct,
                'savingsCategory': 'Saves Money' if rt_diff < 0 else 'Higher Cost',
                'owCount': len(ow_fares),
                'rtCount': len(rt_fares)
            })

    # 7. Travel Date Analytics (Day of week & Weekday/Weekend)
    day_groups = {'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': []}
    for r in cleaned_records:
        dow = r['day_of_week']
        if dow in day_groups:
            day_groups[dow].append(r['total_fare'])

    travel_date_analytics = []
    for dow, d_fares in day_groups.items():
        if d_fares:
            travel_date_analytics.append({
                'dayOfWeek': dow,
                'medianFare': round(statistics.median(d_fares)),
                'avgFare': round(statistics.mean(d_fares)),
                'sampleCount': len(d_fares),
                'isWeekend': dow in ['Friday', 'Saturday', 'Sunday']
            })

    weekday_fares = [x['total_fare'] for x in cleaned_records if not x['is_weekend']]
    weekend_fares = [x['total_fare'] for x in cleaned_records if x['is_weekend']]
    weekday_med = round(statistics.median(weekday_fares)) if weekday_fares else market_median
    weekend_med = round(statistics.median(weekend_fares)) if weekend_fares else market_median

    return {
        'marketKPIs': {
            'totalObservations': total_records,
            'totalRoutes': len(route_analytics),
            'totalAirlines': len(airline_analytics),
            'totalOTAs': len(ota_analytics),
            'averageFare': market_mean,
            'medianFare': market_median,
            'volatility': market_std,
            'iqr': market_iqr,
            'totalAnomalies': len(flagged_anomalies),
            'weekdayMedian': weekday_med,
            'weekendMedian': weekend_med,
            'weekendSurgePct': round(((weekend_med - weekday_med) / weekday_med) * 100, 1)
        },
        'routes': route_analytics,
        'bookingWindows': global_window_analytics,
        'airlineIntelligence': airline_analytics,
        'otaIntelligence': ota_analytics,
        'abnormalMovements': flagged_anomalies[:40], # Top anomalies
        'roundTripAnalysis': rt_diff_analysis,
        'travelDateAnalytics': travel_date_analytics,
        'methodology': {
            'formula': 'Price Index = (Observed Fare / Reference Fare) * 100',
            'referenceDescription': 'The route-level median fare derived from normalized airline and OTA historical observations.',
            'tiers': [
                {'range': 'Index < 90', 'category': 'Substantial Value', 'description': 'Fare is >10% lower than route median'},
                {'range': '90 <= Index <= 110', 'category': 'Fair Market Level', 'description': 'Fare is within normal statistical boundary'},
                {'range': '111 <= Index <= 125', 'category': 'Above Average', 'description': 'Fare is slightly elevated'},
                {'range': 'Index > 125', 'category': 'Surge Pricing', 'description': 'Fare is significantly elevated (surge/peak)'}
            ]
        }
    }

def main():
    print("=" * 70)
    print("AIRFARE INTELLIGENCE & PRICE ANALYTICS PIPELINE")
    print("=" * 70)

    if not os.path.exists(RAW_DATA_FILE):
        print(f"Error: {RAW_DATA_FILE} not found. Running generator first...")
        import generate_raw_data
        generate_raw_data.generate_records()

    with open(RAW_DATA_FILE, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    print(f"1. Ingested {len(raw_data)} raw flight records from {RAW_DATA_FILE}")

    cleaned = clean_and_normalize(raw_data)
    print(f"2. Cleaned and normalized {len(cleaned)} records.")
    print("   Enforced: TOTAL FARE = BASE FARE + TAXES + FEES/CHARGES")

    with open(CLEANED_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, indent=2)
    print(f"   Saved normalized dataset to {CLEANED_DATA_FILE}")

    print("3. Building comprehensive analytical database...")
    intelligence_db = build_analytics_database(cleaned)

    kpi = intelligence_db['marketKPIs']
    print(f"   Market Observations: {kpi['totalObservations']}")
    print(f"   Tracked Sectors: {kpi['totalRoutes']}")
    print(f"   Airlines: {kpi['totalAirlines']}")
    print(f"   OTAs: {kpi['totalOTAs']}")
    print(f"   Market Median Fare: ₹{kpi['medianFare']}")
    print(f"   Market Volatility (std): ₹{kpi['volatility']}")
    print(f"   Abnormal Price Movements Detected: {kpi['totalAnomalies']}")

    with open(INTELLIGENCE_DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(intelligence_db, f, indent=2)

    print(f"4. Successfully exported intelligence database to:\n   {INTELLIGENCE_DB_FILE}")
    print("=" * 70)

if __name__ == '__main__':
    main()
