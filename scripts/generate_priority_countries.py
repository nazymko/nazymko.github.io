#!/usr/bin/env python3
"""
Generate taxation files for priority countries only
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from generate_enhanced_taxation_files import generate_enhanced_file

# Priority countries to process
PRIORITY_COUNTRIES = [
    "united_states", "canada", "united_kingdom", "germany", "france",
    "italy", "spain", "sweden", "norway", "denmark", "netherlands",
    "belgium", "switzerland", "china", "japan", "south_korea",
    "singapore", "india", "russia", "poland", "finland", "ireland",
    "portugal", "greece", "czech_republic", "estonia", "lithuania"
]

def main():
    """Generate taxation files for priority countries"""
    print("Priority Country Taxation File Generator")
    print("=" * 50)

    success_count = 0
    failed_count = 0

    for i, country in enumerate(PRIORITY_COUNTRIES, 1):
        print(f"\n[{i}/{len(PRIORITY_COUNTRIES)}] Processing {country}...")

        try:
            result = generate_enhanced_file(
                country,
                web_extractor_url="http://localhost:5000",
                ollama_url="http://localhost:5001",
                thread_id=0
            )

            if result:
                success_count += 1
                print(f"[SUCCESS] {country} completed")
            else:
                failed_count += 1
                print(f"[FAILED] {country} failed")

        except Exception as e:
            failed_count += 1
            print(f"[ERROR] {country} error: {e}")

    print(f"\n" + "=" * 50)
    print(f"[SUMMARY] Priority country generation complete!")
    print(f"[SUCCESS] Successfully generated: {success_count}")
    print(f"[FAILED] Failed to generate: {failed_count}")
    print(f"[TOTAL] Total countries: {len(PRIORITY_COUNTRIES)}")

if __name__ == "__main__":
    main()