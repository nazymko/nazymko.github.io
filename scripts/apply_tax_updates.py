#!/usr/bin/env python3

import json
import re

# Load the updates
with open('tax_data_updates.json', 'r') as f:
    updates = json.load(f)

# Default coordinates for countries (lat, lng)
DEFAULT_COORDINATES = {
    'albania': [41.1533, 20.1683],
    'algeria': [28.0339, 1.6596],
    'angola': [-11.2027, 17.8739],
    'argentina': [-38.4161, -63.6167],
    'armenia': [40.0691, 45.0382],
    'australia': [-25.2744, 133.7751],
    'austria': [47.5162, 14.5501],
    'azerbaijan': [40.1431, 47.5769],
    'bahamas': [25.0343, -77.3963],
    'bahrain': [26.0667, 50.5577],
    'bangladesh': [23.6850, 90.3563],
    'barbados': [13.1939, -59.5432],
    'belgium': [50.5039, 4.4699],
    'bermuda': [32.3078, -64.7505],
    'bolivia': [-16.2902, -63.5887],
    'brazil': [-14.2350, -51.9253],
    'bulgaria': [42.7339, 25.4858],
    'cambodia': [12.5657, 104.9910],
    'cameroon': [7.3697, 12.3547],
    'chile': [-35.6751, -71.5430],
    'china': [35.8617, 104.1954],
    'colombia': [4.5709, -74.2973],
    'costa_rica': [9.7489, -83.7534],
    'croatia': [45.1000, 15.2000],
    'cyprus': [35.1264, 33.4299],
    'czech_republic': [49.8175, 15.4730],
    'denmark': [56.2639, 9.5018],
    'dominican_republic': [18.7357, -70.1627],
    'ecuador': [-1.8312, -78.1834],
    'egypt': [26.0975, 30.0444],
    'el_salvador': [13.7942, -88.8965],
    'estonia': [58.5953, 25.0136],
    'ethiopia': [9.1450, 40.4897],
    'fiji': [-16.5790, 179.4140],
    'finland': [61.9241, 25.7482],
    'france': [46.6034, 1.8883],
    'gabon': [-0.8037, 11.6094],
    'georgia': [42.3154, 43.3569],
    'ghana': [7.9465, -1.0232],
    'greece': [39.0742, 21.8243],
    'guatemala': [15.7835, -90.2308],
    'honduras': [15.2000, -86.2419],
    'hungary': [47.1625, 19.5033],
    'iceland': [64.9631, -19.0208],
    'india': [20.5937, 78.9629],
    'indonesia': [-0.7893, 113.9213],
    'iran': [32.4279, 53.6880],
    'iraq': [33.2232, 43.6793],
    'ireland': [53.4129, -8.2439],
    'israel': [31.0461, 34.8516],
    'italy': [41.8719, 12.5674],
    'jamaica': [18.1096, -77.2975],
    'japan': [36.2048, 138.2529],
    'jordan': [30.5852, 36.2384],
    'kazakhstan': [48.0196, 66.9237],
    'kenya': [-0.0236, 37.9062],
    'kuwait': [29.3117, 47.4818],
    'lebanon': [33.8547, 35.8623],
    'libya': [26.3351, 17.2283],
    'luxembourg': [49.8153, 6.1296],
    'madagascar': [-18.7669, 46.8691],
    'malaysia': [4.2105, 101.9758],
    'maldives': [3.2028, 73.2207],
    'malta': [35.9375, 14.3754],
    'mauritius': [-20.3484, 57.5522],
    'mexico': [23.6345, -102.5528],
    'moldova': [47.4116, 28.3699],
    'mongolia': [46.8625, 103.8467],
    'montenegro': [42.7087, 19.3744],
    'morocco': [31.7917, -7.0926],
    'mozambique': [-18.6657, 35.5296],
    'namibia': [-22.9576, 18.4904],
    'nepal': [28.3949, 84.1240],
    'netherlands': [52.1326, 5.2913],
    'nicaragua': [12.8654, -85.2072],
    'nigeria': [9.0820, 8.6753],
    'norway': [60.4720, 8.4689],
    'oman': [21.4735, 55.9754],
    'pakistan': [30.3753, 69.3451],
    'panama': [8.5380, -80.7821],
    'paraguay': [-23.4425, -58.4438],
    'peru': [-9.1900, -75.0152],
    'philippines': [12.8797, 121.7740],
    'poland': [51.9194, 19.1451],
    'portugal': [39.3999, -8.2245],
    'qatar': [25.3548, 51.1839],
    'romania': [45.9432, 24.9668],
    'russia': [61.5240, 105.3188],
    'saudi_arabia': [23.8859, 45.0792],
    'serbia': [44.0165, 21.0059],
    'singapore': [1.3521, 103.8198],
    'slovakia': [48.6690, 19.6990],
    'slovenia': [46.1512, 14.9955],
    'south_africa': [-30.5595, 22.9375],
    'south_korea': [35.9078, 127.7669],
    'spain': [40.4637, -3.7492],
    'sri_lanka': [7.8731, 80.7718],
    'sweden': [60.1282, 18.6435],
    'switzerland': [46.8182, 8.2275],
    'taiwan': [23.6978, 120.9605],
    'tanzania': [-6.3690, 34.8888],
    'thailand': [15.8700, 100.9925],
    'trinidad_and_tobago': [10.6918, -61.2225],
    'tunisia': [33.8869, 9.5375],
    'turkey': [38.9637, 35.2433],
    'uganda': [1.3733, 32.2903],
    'united_arab_emirates': [23.4241, 53.8478],
    'uruguay': [-32.5228, -55.7658],
    'uzbekistan': [41.3775, 64.5853],
    'venezuela': [6.4238, -66.5897],
    'vietnam': [14.0583, 108.2772],
    'zambia': [-13.1339, 27.8493],
    'zimbabwe': [-19.0154, 29.1549]
}

def update_tax_data():
    """Update taxData.js with new data from Excel files"""

    # Read the current taxData.js file
    with open('js/taxData.js', 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"Loaded taxData.js file ({len(content)} characters)")

    # Track changes
    updated_countries = []
    new_countries = []

    # For each country in our updates
    for country_key, country_data in updates.items():
        country_name = country_data.get('country_name', '')
        headline_rate = country_data.get('headline_pit_rate')
        vat_info = country_data.get('vat_info', {})

        print(f"\\nProcessing {country_key} ({country_name})...")

        # Check if this country already exists in taxData.js
        pattern = rf'"{country_key}"\\s*:\\s*\{{'
        match = re.search(pattern, content)

        if match:
            print(f"  Found existing entry for {country_key}")

            # Find the start and end of this country's data
            start_pos = match.start()
            brace_count = 0
            end_pos = start_pos
            in_country_block = False

            for i, char in enumerate(content[start_pos:], start_pos):
                if char == '{':
                    brace_count += 1
                    in_country_block = True
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0 and in_country_block:
                        end_pos = i + 1
                        break

            # Extract current country data
            country_block = content[start_pos:end_pos]

            # Update VAT information if available
            if vat_info:
                print(f"    Updating VAT: {vat_info}")

                # Check if VAT block already exists
                vat_pattern = r'vat\\s*:\\s*\{[^}]*\}'
                vat_match = re.search(vat_pattern, country_block, re.DOTALL)

                # Build new VAT object
                if 'type' in vat_info and vat_info['type'] == 'GST':
                    new_vat = f'''vat: {{
      hasVAT: true,
      standard: {vat_info['standard']},
      notes: "Goods and Services Tax (GST)",
      description: "GST {vat_info['standard']}%"
    }}'''
                else:
                    reduced_info = ""
                    if 'reduced' in vat_info:
                        reduced_rates = vat_info['reduced']
                        reduced_info = f",\\n      reduced: {reduced_rates}"

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
                    insertion_point = country_block.rfind('}')
                    if insertion_point > 0:
                        # Find the last property to add comma if needed
                        before_closing = country_block[:insertion_point].rstrip()
                        if not before_closing.endswith(','):
                            new_vat = ',' + new_vat
                        country_block = country_block[:insertion_point] + ',' + new_vat + '\\n  ' + country_block[insertion_point:]

            # Add coordinates if missing
            if country_key in DEFAULT_COORDINATES:
                coords_pattern = r'coordinates\\s*:\\s*\\[[^\\]]*\\]'
                if not re.search(coords_pattern, country_block):
                    print(f"    Adding coordinates: {DEFAULT_COORDINATES[country_key]}")
                    coords = DEFAULT_COORDINATES[country_key]
                    new_coords = f'coordinates: [{coords[0]}, {coords[1]}]'

                    # Add after countryCode if it exists, otherwise after system
                    country_code_pattern = r'(countryCode\\s*:\\s*"[^"]*",?)\\s*'
                    country_code_match = re.search(country_code_pattern, country_block)

                    if country_code_match:
                        insert_pos = country_code_match.end()
                        country_block = country_block[:insert_pos] + f'\\n    {new_coords},' + country_block[insert_pos:]
                    else:
                        # Look for system property
                        system_pattern = r'(system\\s*:\\s*"[^"]*",?)\\s*'
                        system_match = re.search(system_pattern, country_block)
                        if system_match:
                            insert_pos = system_match.end()
                            country_block = country_block[:insert_pos] + f'\\n    {new_coords},' + country_block[insert_pos:]

            # Replace the country block in the main content
            content = content[:start_pos] + country_block + content[end_pos:]
            updated_countries.append(country_key)

        else:
            print(f"  Creating new entry for {country_key}")

            # Create new country entry
            coords = DEFAULT_COORDINATES.get(country_key, [0, 0])

            # Determine tax system (simplified logic)
            tax_system = "flat"  # Default assumption based on headline rate

            # Build VAT info
            vat_block = ""
            if vat_info:
                if 'type' in vat_info and vat_info['type'] == 'GST':
                    vat_block = f''',
    vat: {{
      hasVAT: true,
      standard: {vat_info['standard']},
      notes: "Goods and Services Tax (GST)",
      description: "GST {vat_info['standard']}%"
    }}'''
                else:
                    reduced_info = ""
                    if 'reduced' in vat_info:
                        reduced_rates = vat_info['reduced']
                        reduced_info = f",\\n      reduced: {reduced_rates}"

                    vat_block = f''',
    vat: {{
      hasVAT: true,
      standard: {vat_info['standard']}{reduced_info},
      description: "Standard {vat_info['standard']}%"
    }}'''

            # Build country entry
            new_entry = f'''  "{country_key}": {{
    name: "{country_name}",
    currency: "USD", // TODO: Update with correct currency
    system: "{tax_system}",
    countryCode: "{country_key[:2].upper()}",
    coordinates: [{coords[0]}, {coords[1]}],
    brackets: [{{min: 0, max: null, rate: {headline_rate or 0}}}]{vat_block}
  }},'''

            # Find a good place to insert (before the closing brace of taxData)
            # Look for the last country entry
            last_country_pattern = r'(.*"},)(\s*};?\s*$)'
            match = re.search(last_country_pattern, content, re.DOTALL)

            if match:
                insert_pos = match.end(1)
                content = content[:insert_pos] + '\\n' + new_entry + content[insert_pos:]
                new_countries.append(country_key)
            else:
                print(f"    Could not find insertion point for {country_key}")

    # Write the updated content back
    with open('js/taxData.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\\n✅ Updated taxData.js successfully!")
    print(f"   Updated existing countries: {len(updated_countries)}")
    print(f"   Added new countries: {len(new_countries)}")

    if updated_countries:
        print(f"   Updated: {', '.join(updated_countries[:10])}{'...' if len(updated_countries) > 10 else ''}")
    if new_countries:
        print(f"   Added: {', '.join(new_countries[:10])}{'...' if len(new_countries) > 10 else ''}")

if __name__ == "__main__":
    update_tax_data()