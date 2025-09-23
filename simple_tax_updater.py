#!/usr/bin/env python3

import json
import re

# Load the updates
with open('tax_data_updates.json', 'r') as f:
    updates = json.load(f)

def find_and_update_country(content, country_key, updates_data):
    """Find and update a specific country in the taxData.js content"""

    # Look for the country key pattern
    pattern = rf'"{country_key}"\s*:\s*{{'
    match = re.search(pattern, content)

    if not match:
        return content, False

    print(f"Found {country_key}")

    # Find the complete country block
    start_pos = match.start()

    # Find the opening brace position
    brace_start = content.find('{', start_pos)
    if brace_start == -1:
        return content, False

    # Count braces to find the end
    brace_count = 0
    end_pos = brace_start

    for i, char in enumerate(content[brace_start:], brace_start):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                end_pos = i + 1
                break

    # Extract the country block
    country_block = content[start_pos:end_pos]
    original_block = country_block

    # Update VAT information if available
    vat_info = updates_data.get('vat_info', {})
    if vat_info:
        print(f"  Updating VAT: {vat_info['standard']}%")

        # Check if VAT block exists
        vat_pattern = r'vat\s*:\s*{[^}]*}'
        vat_match = re.search(vat_pattern, country_block, re.DOTALL)

        # Create new VAT block
        if 'type' in vat_info and vat_info['type'] == 'GST':
            new_vat = f'''vat: {{
      hasVAT: true,
      standard: {vat_info['standard']},
      notes: "Goods and Services Tax (GST)",
      description: "GST {vat_info['standard']}%"
    }}'''
        else:
            reduced_info = ""
            if 'reduced' in vat_info and vat_info['reduced']:
                reduced_rates = vat_info['reduced']
                reduced_info = f",\n      reduced: {reduced_rates}"

            new_vat = f'''vat: {{
      hasVAT: true,
      standard: {vat_info['standard']}{reduced_info},
      description: "Standard {vat_info['standard']}%"
    }}'''

        if vat_match:
            # Replace existing VAT block
            country_block = country_block[:vat_match.start()] + new_vat + country_block[vat_match.end():]
        else:
            # Add VAT block before the closing brace
            closing_brace_pos = country_block.rfind('}')
            if closing_brace_pos > 0:
                # Add comma if needed
                before_closing = country_block[:closing_brace_pos].rstrip()
                comma = "" if before_closing.endswith(',') else ","
                insertion = f"{comma}\n    {new_vat}\n  "
                country_block = country_block[:closing_brace_pos] + insertion + country_block[closing_brace_pos:]

    # Add coordinates if missing
    if not re.search(r'coordinates\s*:\s*\[', country_block):
        coords_map = {
            'ukraine': [50.4501, 30.5234],
            'germany': [51.1657, 10.4515],
            'france': [46.6034, 1.8883],
            'italy': [41.8719, 12.5674],
            'spain': [40.4637, -3.7492],
            'netherlands': [52.1326, 5.2913],
            'belgium': [50.5039, 4.4699],
            'austria': [47.5162, 14.5501],
            'switzerland': [46.8182, 8.2275],
            'poland': [51.9194, 19.1451],
            'romania': [45.9432, 24.9668],
            'greece': [39.0742, 21.8243],
            'portugal': [39.3999, -8.2245],
            'czech_republic': [49.8175, 15.4730],
            'hungary': [47.1625, 19.5033],
            'slovakia': [48.6690, 19.6990],
            'bulgaria': [42.7339, 25.4858],
            'croatia': [45.1000, 15.2000],
            'slovenia': [46.1512, 14.9955],
            'estonia': [58.5953, 25.0136],
            'latvia': [56.9496, 24.1052],
            'lithuania': [54.6872, 25.2797],
            'ireland': [53.4129, -8.2439],
            'luxembourg': [49.8153, 6.1296],
            'malta': [35.9375, 14.3754],
            'cyprus': [35.1264, 33.4299],
            'australia': [-25.2744, 133.7751],
            'japan': [36.2048, 138.2529],
            'south_korea': [35.9078, 127.7669],
            'singapore': [1.3521, 103.8198],
            'hong_kong': [22.3193, 114.1694],
            'new_zealand': [-40.9006, 174.8860],
            'canada': [56.1304, -106.3468],
            'mexico': [23.6345, -102.5528],
            'brazil': [-14.2350, -51.9253],
            'argentina': [-38.4161, -63.6167],
            'chile': [-35.6751, -71.5430],
            'colombia': [4.5709, -74.2973],
            'peru': [-9.1900, -75.0152],
            'south_africa': [-30.5595, 22.9375],
            'nigeria': [9.0820, 8.6753],
            'egypt': [26.0975, 30.0444],
            'kenya': [-0.0236, 37.9062],
            'morocco': [31.7917, -7.0926],
            'algeria': [28.0339, 1.6596],
            'tunisia': [33.8869, 9.5375],
            'ghana': [7.9465, -1.0232],
            'ethiopia': [9.1450, 40.4897],
            'uganda': [1.3733, 32.2903],
            'tanzania': [-6.3690, 34.8888],
            'zimbabwe': [-19.0154, 29.1549],
            'zambia': [-13.1339, 27.8493],
            'mozambique': [-18.6657, 35.5296],
            'botswana': [-22.3285, 24.6849],
            'namibia': [-22.9576, 18.4904],
            'india': [20.5937, 78.9629],
            'china': [35.8617, 104.1954],
            'indonesia': [-0.7893, 113.9213],
            'malaysia': [4.2105, 101.9758],
            'thailand': [15.8700, 100.9925],
            'vietnam': [14.0583, 108.2772],
            'philippines': [12.8797, 121.7740],
            'taiwan': [23.6978, 120.9605],
            'bangladesh': [23.6850, 90.3563],
            'pakistan': [30.3753, 69.3451],
            'sri_lanka': [7.8731, 80.7718],
            'myanmar': [21.9162, 95.9560],
            'cambodia': [12.5657, 104.9910],
            'laos': [19.8563, 102.4955],
            'nepal': [28.3949, 84.1240],
            'russia': [61.5240, 105.3188],
            'turkey': [38.9637, 35.2433],
            'iran': [32.4279, 53.6880],
            'iraq': [33.2232, 43.6793],
            'israel': [31.0461, 34.8516],
            'jordan': [30.5852, 36.2384],
            'lebanon': [33.8547, 35.8623],
            'saudi_arabia': [23.8859, 45.0792],
            'united_arab_emirates': [23.4241, 53.8478],
            'kuwait': [29.3117, 47.4818],
            'qatar': [25.3548, 51.1839],
            'bahrain': [26.0667, 50.5577],
            'oman': [21.4735, 55.9754],
            'yemen': [15.5527, 48.5164],
            'syria': [34.8021, 38.9968],
            'kazakhstan': [48.0196, 66.9237],
            'uzbekistan': [41.3775, 64.5853],
            'kyrgyzstan': [41.2044, 74.7661],
            'tajikistan': [38.8610, 71.2761],
            'turkmenistan': [38.9697, 59.5563],
            'afghanistan': [33.9391, 67.7100],
            'azerbaijan': [40.1431, 47.5769],
            'armenia': [40.0691, 45.0382],
            'georgia': [42.3154, 43.3569],
            'moldova': [47.4116, 28.3699],
            'belarus': [53.7098, 27.9534],
            'denmark': [56.2639, 9.5018],
            'sweden': [60.1282, 18.6435],
            'norway': [60.4720, 8.4689],
            'finland': [61.9241, 25.7482],
            'iceland': [64.9631, -19.0208]
        }

        if country_key in coords_map:
            coords = coords_map[country_key]
            print(f"  Adding coordinates: {coords}")

            # Find where to insert coordinates (after countryCode)
            country_code_pattern = r'(countryCode\s*:\s*"[^"]*",?\s*)'
            country_code_match = re.search(country_code_pattern, country_block)

            if country_code_match:
                insert_pos = country_code_match.end()
                new_coords = f'coordinates: [{coords[0]}, {coords[1]}],\n    '
                country_block = country_block[:insert_pos] + new_coords + country_block[insert_pos:]

    # Replace in the main content if changes were made
    if country_block != original_block:
        content = content[:start_pos] + country_block + content[end_pos:]
        return content, True

    return content, False

def main():
    # Read current taxData.js
    with open('js/taxData.js', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Starting updates...")

    # List of countries that are likely to exist in the current taxData.js
    priority_countries = [
        'ukraine', 'germany', 'france', 'italy', 'spain', 'netherlands', 'belgium',
        'austria', 'switzerland', 'poland', 'romania', 'greece', 'portugal',
        'czech_republic', 'hungary', 'slovakia', 'bulgaria', 'croatia', 'slovenia',
        'estonia', 'latvia', 'lithuania', 'ireland', 'luxembourg', 'malta', 'cyprus',
        'australia', 'japan', 'south_korea', 'singapore', 'hong_kong', 'new_zealand',
        'canada', 'united_states', 'united_kingdom', 'mexico', 'brazil', 'argentina'
    ]

    updated_count = 0

    # Update priority countries first
    for country_key in priority_countries:
        if country_key in updates:
            content, updated = find_and_update_country(content, country_key, updates[country_key])
            if updated:
                updated_count += 1

    # Then try other countries
    for country_key, country_data in updates.items():
        if country_key not in priority_countries:
            content, updated = find_and_update_country(content, country_key, updates[country_key])
            if updated:
                updated_count += 1

    # Write back the updated content
    with open('js/taxData.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n✅ Successfully updated {updated_count} countries in taxData.js")

if __name__ == "__main__":
    main()