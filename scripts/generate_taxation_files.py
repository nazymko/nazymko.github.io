#!/usr/bin/env python3
"""
Generate taxation files for all countries by fetching Wikipedia pages
"""

import requests
import time
import os
from urllib.parse import quote

# List of all countries you mentioned
COUNTRIES = [
    "albania", "andorra", "argentina", "australia", "austria", "belgium",
    "bosnia_and_herzegovina", "brazil", "bulgaria", "canada", "china",
    "croatia", "cyprus", "czech_republic", "denmark", "estonia", "finland",
    "france", "germany", "greece", "hong_kong", "hungary", "iceland",
    "india", "indonesia", "ireland", "italy", "japan", "latvia",
    "liechtenstein", "lithuania", "luxembourg", "malta", "montenegro",
    "netherlands", "north_korea", "norway", "poland", "portugal",
    "russia", "serbia", "singapore", "slovakia", "south_africa",
    "spain", "sweden", "switzerland", "taiwan", "ukraine",
    "united_arab_emirates", "united_kingdom", "united_states"
]

# URL mapping for countries with different Wikipedia page names
URL_MAPPING = {
    "bosnia_and_herzegovina": "Bosnia_and_Herzegovina",
    "czech_republic": "Czech_Republic",
    "hong_kong": "Hong_Kong",
    "north_korea": "North_Korea",
    "south_africa": "South_Africa",
    "united_arab_emirates": "United_Arab_Emirates",
    "united_kingdom": "United_Kingdom",
    "united_states": "United_States"
}

def get_wikipedia_url(country):
    """Generate Wikipedia taxation URL for a country"""
    # Convert country name for URL
    if country in URL_MAPPING:
        country_name = URL_MAPPING[country]
    else:
        country_name = country.replace("_", "_").title()

    return f"https://en.wikipedia.org/wiki/Taxation_in_{country_name}"

def fetch_taxation_content(country, web_extractor_url="http://localhost:5000"):
    """Fetch taxation content for a country"""
    url = get_wikipedia_url(country)

    # Ensure data directory exists
    data_dir = "scripts/data"
    os.makedirs(data_dir, exist_ok=True)
    filename = f"{data_dir}/taxation_{country}.txt"

    print(f"[FETCHING] {country} from {url}")
    print(f"[API-CALL] POST {web_extractor_url}/extract")

    try:
        request_payload = {
            "url": url,
            "save_file": True,
            "output_file": filename
        }
        print(f"[API-PAYLOAD] {request_payload}")
        print(f"[API-TIMEOUT] Request timeout: 30 seconds")

        response = requests.post(
            f"{web_extractor_url}/extract",
            json=request_payload,
            timeout=30
        )

        print(f"[API-RESPONSE] HTTP {response.status_code} from Web Content Extractor")

        if response.status_code == 200:
            data = response.json()
            print(f"[API-DATA] Response contains {len(str(data))} characters")

            if data.get('success'):
                content = data.get('content', '')

                # Save locally as well
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"[SUCCESS] Saved {len(content)} characters to {filename}")
                print(f"[FILE-SAVED] Content extracted from Wikipedia and saved locally")
                return True
            else:
                print(f"[ERROR] Web extractor reported failure for {country}")
                print(f"[DEBUG] Response data: {data}")
                return False
        else:
            print(f"[ERROR] HTTP {response.status_code} for {country}")
            try:
                error_data = response.json()
                print(f"[DEBUG] Error response: {error_data}")
            except:
                print(f"[DEBUG] Raw error response: {response.text[:200]}...")
            return False

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Request failed for {country}: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error for {country}: {e}")
        return False

def main():
    """Generate all taxation files"""
    print("Taxation File Generator")
    print("=" * 50)

    # Check if web extractor is running
    print("[API-CHECK] Testing Web Content Extractor service")
    try:
        print("[API-CALL] GET http://localhost:5000/health")
        response = requests.get("http://localhost:5000/health", timeout=5)
        print(f"[API-RESPONSE] HTTP {response.status_code} from Web Content Extractor")
        if response.status_code != 200:
            print("[ERROR] Web extractor service not available at http://localhost:5000")
            return 1
    except Exception as e:
        print(f"[ERROR] Web extractor service not available at http://localhost:5000: {e}")
        return 1

    print("[API-OK] Web extractor service is running")
    print(f"[BATCH-PROCESS] Will fetch taxation data for {len(COUNTRIES)} countries")
    print(f"[ENDPOINTS] Using Web Content Extractor at http://localhost:5000/extract")

    success_count = 0
    failed_count = 0

    for i, country in enumerate(COUNTRIES, 1):
        print(f"\n[{i}/{len(COUNTRIES)}] Processing {country}...")

        # Skip if file already exists
        data_dir = "scripts/data"
        os.makedirs(data_dir, exist_ok=True)
        filename = f"{data_dir}/taxation_{country}.txt"
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            if content:
                print(f"[SKIP] File {filename} already exists with content")
                success_count += 1
                continue

        # Fetch content
        if fetch_taxation_content(country):
            success_count += 1
        else:
            failed_count += 1

        # Add delay to be respectful to Wikipedia
        time.sleep(0)

    print(f"\n" + "=" * 50)
    print(f"[SUMMARY] Generation complete!")
    print(f"[SUCCESS] Successfully fetched: {success_count}")
    print(f"[FAILED] Failed to fetch: {failed_count}")
    print(f"[TOTAL] Total countries: {len(COUNTRIES)}")

    if success_count > 0:
        print(f"\n[NEXT] Run the tax data updater:")
        print(f"python scripts/tax_data_updater.py")

    return 0 if failed_count == 0 else 1

if __name__ == "__main__":
    exit(main())
