"""
Generator for Raw Scraped Airline and OTA Datasets
Generates 1,200+ realistic observations across Indian sectors, airlines, and OTAs.
Preserves raw un-normalized fields as observed during web scraping.
"""

import json
import os
import random
from datetime import datetime, timedelta

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'data', 'raw_airline_ota_data.json')

AIRLINES = [
    {"name": "IndiGo Airlines", "code": "6E", "base_mult": 0.88},
    {"name": "Air India Ltd", "code": "AI", "base_mult": 0.94},
    {"name": "Vistara (Tata SIA)", "code": "UK", "base_mult": 1.05},
    {"name": "Akasa Air", "code": "QP", "base_mult": 0.86},
    {"name": "SpiceJet", "code": "SG", "base_mult": 0.84}
]

OTAS = [
    {"name": "Airline Direct", "fee": 0, "disc_chance": 0.1, "disc_pct": 0.0},
    {"name": "MakeMyTrip", "fee": 350, "disc_chance": 0.4, "disc_pct": 0.04},
    {"name": "EaseMyTrip", "fee": 0, "disc_chance": 0.5, "disc_pct": 0.02}, # Zero convenience fee feature
    {"name": "Cleartrip", "fee": 299, "disc_chance": 0.3, "disc_pct": 0.03},
    {"name": "Yatra", "fee": 399, "disc_chance": 0.3, "disc_pct": 0.02}
]

ROUTES = [
    {"origin": "DEL", "dest": "BOM", "median": 5800, "duration": 135},
    {"origin": "BOM", "dest": "DEL", "median": 5750, "duration": 135},
    {"origin": "DEL", "dest": "BLR", "median": 6400, "duration": 165},
    {"origin": "BLR", "dest": "DEL", "median": 6350, "duration": 165},
    {"origin": "BOM", "dest": "BLR", "median": 4200, "duration": 105},
    {"origin": "BLR", "dest": "BOM", "median": 4150, "duration": 105},
    {"origin": "DEL", "dest": "CCU", "median": 5600, "duration": 130},
    {"origin": "CCU", "dest": "DEL", "median": 5550, "duration": 130},
    {"origin": "DEL", "dest": "GOI", "median": 6200, "duration": 150},
    {"origin": "DEL", "dest": "HYD", "median": 5200, "duration": 130},
    {"origin": "MAA", "dest": "DEL", "median": 5900, "duration": 170},
    {"origin": "PNQ", "dest": "DEL", "median": 5100, "duration": 125}
]

def generate_records(num_records=1250):
    random.seed(42) # Reproducible
    base_date = datetime(2026, 10, 1)
    records = []

    for i in range(1, num_records + 1):
        route = random.choice(ROUTES)
        airline = random.choice(AIRLINES)
        ota = random.choice(OTAS)
        
        # Booking window distribution: 0-90 days with higher density in 1-30 days
        window_dice = random.random()
        if window_dice < 0.18:
            window_days = random.randint(0, 3)     # Last minute
        elif window_dice < 0.38:
            window_days = random.randint(4, 7)     # Short notice
        elif window_dice < 0.65:
            window_days = random.randint(8, 14)    # Standard
        elif window_dice < 0.85:
            window_days = random.randint(15, 30)   # Advance
        elif window_dice < 0.95:
            window_days = random.randint(31, 60)   # Early bird
        else:
            window_days = random.randint(61, 90)   # Far advance

        # Window price curve factor
        if window_days <= 3:
            window_factor = random.uniform(1.30, 1.65)
        elif window_days <= 7:
            window_factor = random.uniform(1.15, 1.35)
        elif window_days <= 14:
            window_factor = random.uniform(0.95, 1.10)
        elif window_days <= 30:
            window_factor = random.uniform(0.85, 0.98)
        elif window_days <= 60:
            window_factor = random.uniform(0.80, 0.92)
        else:
            window_factor = random.uniform(0.78, 0.90)

        # Inject some deliberate price anomalies (surges and flash drops)
        is_anomaly = False
        anomaly_note = None
        if random.random() < 0.04:
            # High surge anomaly
            window_factor *= random.uniform(1.5, 1.9)
            is_anomaly = True
            anomaly_note = "High surge anomaly"
        elif random.random() < 0.02:
            # Flash discount / error fare drop
            window_factor *= random.uniform(0.55, 0.65)
            is_anomaly = True
            anomaly_note = "Flash price drop"

        # Calculate fare components
        trip_type = "round-trip" if random.random() < 0.25 else "one-way"
        rt_mult = 1.92 if trip_type == "round-trip" else 1.0 # Round trip discount (~8% cheaper than 2 one ways)

        core_fare = route["median"] * airline["base_mult"] * window_factor * rt_mult
        
        # OTA discount application
        if random.random() < ota["disc_chance"]:
            core_fare *= (1.0 - ota["disc_pct"])

        # Breakdown into Base Fare + Taxes + Fees
        taxes = round(core_fare * 0.14)
        fees = ota["fee"] if trip_type == "one-way" else ota["fee"] * 2
        base_fare = round(core_fare - taxes)
        total_fare = base_fare + taxes + fees

        travel_date = base_date + timedelta(days=window_days + random.randint(0, 30))
        scraping_date = travel_date - timedelta(days=window_days)
        return_date = travel_date + timedelta(days=random.randint(2, 8)) if trip_type == "round-trip" else None

        stops = 1 if (random.random() < 0.18 and route["duration"] > 120) else 0
        flight_num = f"{airline['code']} {random.randint(100, 999)}"
        duration_mins = route["duration"] if stops == 0 else route["duration"] + random.randint(80, 180)

        record = {
            "raw_id": f"RAW_{i:05d}",
            "airline_raw": airline["name"],
            "airline_code": airline["code"],
            "flight_number": flight_num,
            "airport_origin": route["origin"],
            "airport_destination": route["dest"],
            "route": f"{route['origin']}-{route['dest']}",
            "source_ota": ota["name"],
            "trip_type": trip_type,
            "travel_date": travel_date.strftime("%Y-%m-%d"),
            "return_date": return_date.strftime("%Y-%m-%d") if return_date else None,
            "scraping_timestamp": scraping_date.strftime("%Y-%m-%d %H:%M:%S"),
            "booking_window_days": window_days,
            "base_fare": base_fare,
            "taxes": taxes,
            "fees_charges": fees,
            "total_fare": total_fare,
            "currency": "INR",
            "stops": stops,
            "flight_duration_mins": duration_mins,
            "is_anomaly_seed": is_anomaly,
            "seed_note": anomaly_note
        }
        records.append(record)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2)

    print(f"Generated {len(records)} raw airline/OTA records in {OUTPUT_FILE}")

if __name__ == '__main__':
    generate_records(1350)
