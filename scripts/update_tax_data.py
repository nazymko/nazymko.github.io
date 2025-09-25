#!/usr/bin/env python3

import pandas as pd
import re
import json

# Country name mapping from Excel to taxData.js keys
COUNTRY_MAPPINGS = {
    'United States': 'united_states',
    'United Kingdom': 'united_kingdom',
    'New Zealand': 'new_zealand',
    'Czech Republic': 'czech_republic',
    'South Korea': 'south_korea',
    'South Africa': 'south_africa',
    'Costa Rica': 'costa_rica',
    'Dominican Republic': 'dominican_republic',
    'El Salvador': 'el_salvador',
    'Hong Kong': 'hong_kong',
    'Puerto Rico': 'puerto_rico',
    'Saudi Arabia': 'saudi_arabia',
    'Sri Lanka': 'sri_lanka',
    'Trinidad and Tobago': 'trinidad_and_tobago',
    'United Arab Emirates': 'united_arab_emirates',
    'Bahamas, The': 'bahamas',
    'Congo, Democratic Republic of the': 'congo_dr',
    'Congo, Republic of the': 'congo_republic',
    'Korea, Republic of': 'south_korea',
    'Russian Federation': 'russia',
    'Syrian Arab Republic': 'syria',
    'Venezuela, Bolivarian Republic of': 'venezuela',
    'Viet Nam': 'vietnam'
}

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
    'bosnia_and_herzegovina': [43.9159, 17.6791],
    'botswana': [-22.3285, 24.6849],
    'brazil': [-14.2350, -51.9253],
    'bulgaria': [42.7339, 25.4858],
    'burkina_faso': [12.2383, -1.5616],
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
    'gambia': [13.4432, -15.3101],
    'georgia': [42.3154, 43.3569],
    'ghana': [7.9465, -1.0232],
    'greece': [39.0742, 21.8243],
    'guatemala': [15.7835, -90.2308],
    'guinea': [9.9456, -9.6966],
    'guyana': [4.8604, -58.9302],
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
    'ivory_coast': [7.5400, -5.5471],
    'jamaica': [18.1096, -77.2975],
    'japan': [36.2048, 138.2529],
    'jordan': [30.5852, 36.2384],
    'kazakhstan': [48.0196, 66.9237],
    'kenya': [-0.0236, 37.9062],
    'kuwait': [29.3117, 47.4818],
    'kyrgyzstan': [41.2044, 74.7661],
    'laos': [19.8563, 102.4955],
    'lebanon': [33.8547, 35.8623],
    'liberia': [6.4281, -9.4295],
    'libya': [26.3351, 17.2283],
    'luxembourg': [49.8153, 6.1296],
    'madagascar': [-18.7669, 46.8691],
    'malawi': [-13.2543, 34.3015],
    'malaysia': [4.2105, 101.9758],
    'maldives': [3.2028, 73.2207],
    'mali': [17.5707, -3.9962],
    'malta': [35.9375, 14.3754],
    'mauritania': [21.0079, -10.9408],
    'mauritius': [-20.3484, 57.5522],
    'mexico': [23.6345, -102.5528],
    'moldova': [47.4116, 28.3699],
    'mongolia': [46.8625, 103.8467],
    'montenegro': [42.7087, 19.3744],
    'morocco': [31.7917, -7.0926],
    'mozambique': [-18.6657, 35.5296],
    'myanmar': [21.9162, 95.9560],
    'namibia': [-22.9576, 18.4904],
    'nepal': [28.3949, 84.1240],
    'netherlands': [52.1326, 5.2913],
    'nicaragua': [12.8654, -85.2072],
    'niger': [17.6078, 8.0817],
    'nigeria': [9.0820, 8.6753],
    'north_macedonia': [41.6086, 21.7453],
    'norway': [60.4720, 8.4689],
    'oman': [21.4735, 55.9754],
    'pakistan': [30.3753, 69.3451],
    'panama': [8.5380, -80.7821],
    'papua_new_guinea': [-6.3140, 143.9555],
    'paraguay': [-23.4425, -58.4438],
    'peru': [-9.1900, -75.0152],
    'philippines': [12.8797, 121.7740],
    'poland': [51.9194, 19.1451],
    'portugal': [39.3999, -8.2245],
    'puerto_rico': [18.2208, -66.5901],
    'qatar': [25.3548, 51.1839],
    'romania': [45.9432, 24.9668],
    'russia': [61.5240, 105.3188],
    'rwanda': [-1.9403, 29.8739],
    'saudi_arabia': [23.8859, 45.0792],
    'senegal': [14.4974, -14.4524],
    'serbia': [44.0165, 21.0059],
    'seychelles': [-4.6796, 55.4920],
    'sierra_leone': [8.4606, -11.7799],
    'singapore': [1.3521, 103.8198],
    'slovakia': [48.6690, 19.6990],
    'slovenia': [46.1512, 14.9955],
    'south_africa': [-30.5595, 22.9375],
    'spain': [40.4637, -3.7492],
    'sri_lanka': [7.8731, 80.7718],
    'sudan': [12.8628, 30.2176],
    'suriname': [3.9193, -56.0278],
    'sweden': [60.1282, 18.6435],
    'switzerland': [46.8182, 8.2275],
    'syria': [34.8021, 38.9968],
    'taiwan': [23.6978, 120.9605],
    'tajikistan': [38.8610, 71.2761],
    'tanzania': [-6.3690, 34.8888],
    'thailand': [15.8700, 100.9925],
    'togo': [8.6195, 0.8248],
    'trinidad_and_tobago': [10.6918, -61.2225],
    'tunisia': [33.8869, 9.5375],
    'turkey': [38.9637, 35.2433],
    'turkmenistan': [38.9697, 59.5563],
    'uganda': [1.3733, 32.2903],
    'united_arab_emirates': [23.4241, 53.8478],
    'uruguay': [-32.5228, -55.7658],
    'uzbekistan': [41.3775, 64.5853],
    'venezuela': [6.4238, -66.5897],
    'vietnam': [14.0583, 108.2772],
    'yemen': [15.5527, 48.5164],
    'zambia': [-13.1339, 27.8493],
    'zimbabwe': [-19.0154, 29.1549]
}

def clean_tax_rate(rate_str):
    """Extract numeric tax rate from string"""
    if pd.isna(rate_str) or rate_str == 'NaN' or rate_str == '':
        return None

    # Convert to string if not already
    rate_str = str(rate_str)

    # Handle 'NA' or similar
    if rate_str.upper() in ['NA', 'N/A', 'NOT APPLICABLE', 'NONE']:
        return None

    # Extract first number from the string
    numbers = re.findall(r'\d+(?:\.\d+)?', rate_str)
    if numbers:
        return float(numbers[0])

    return None

def clean_vat_rate(vat_str):
    """Extract VAT rates from string"""
    if pd.isna(vat_str) or vat_str == 'NaN' or vat_str == '':
        return None

    vat_str = str(vat_str)

    # Handle 'NA' or similar
    if vat_str.upper() in ['NA', 'N/A', 'NOT APPLICABLE', 'NONE']:
        return None

    # Handle special cases
    if 'goods and services tax' in vat_str.lower():
        numbers = re.findall(r'\d+(?:\.\d+)?', vat_str)
        if numbers:
            return {'standard': float(numbers[0]), 'type': 'GST'}

    # Extract all numbers for multiple rates
    numbers = re.findall(r'\d+(?:\.\d+)?', vat_str)
    if numbers:
        rates = [float(n) for n in numbers]
        if len(rates) == 1:
            return {'standard': rates[0]}
        else:
            # Assume highest rate is standard, others are reduced
            rates.sort(reverse=True)
            return {'standard': rates[0], 'reduced': rates[1:]}

    return None

def country_name_to_key(country_name):
    """Convert country name to taxData.js key format"""
    if country_name in COUNTRY_MAPPINGS:
        return COUNTRY_MAPPINGS[country_name]

    # Convert to snake_case
    key = country_name.lower()
    key = re.sub(r'[^a-z0-9]+', '_', key)
    key = re.sub(r'^_+|_+$', '', key)  # Remove leading/trailing underscores

    return key

def read_current_tax_data():
    """Read current taxData.js file and extract the data"""
    with open('js/taxData.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the data object
    start = content.find('export const taxData = {')
    if start == -1:
        raise ValueError("Could not find taxData object in file")

    start = content.find('{', start)

    # Find the closing brace (this is simplified, assumes proper structure)
    brace_count = 0
    end = start
    for i, char in enumerate(content[start:], start):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                end = i + 1
                break

    data_str = content[start:end]

    # This is a simplified approach - in practice, you'd need a proper JS parser
    # For now, we'll work with the existing structure and only update specific fields
    return content, start, end

def main():
    print("Reading Excel files...")

    # Read PIT data
    pit_df = pd.read_excel('js/updated-data/Personal income tax (PIT) rates.xlsx', skiprows=3)
    pit_df.columns = ['Territory', 'Headline_PIT_rate', 'Last_reviewed']
    pit_df = pit_df.dropna(subset=['Territory'])

    # Read VAT data
    vat_df = pd.read_excel('js/updated-data/Value-added tax (VAT) rates.xlsx', skiprows=3)
    vat_df.columns = ['Territory', 'Standard_VAT_rate', 'Last_reviewed']
    vat_df = vat_df.dropna(subset=['Territory'])

    print(f"Found {len(pit_df)} countries in PIT data")
    print(f"Found {len(vat_df)} countries in VAT data")

    # Process the data
    updates = {}

    # Process PIT rates
    for _, row in pit_df.iterrows():
        country_name = row['Territory']
        rate = clean_tax_rate(row['Headline_PIT_rate'])

        if rate is not None:
            key = country_name_to_key(country_name)
            if key not in updates:
                updates[key] = {}
            updates[key]['headline_pit_rate'] = rate
            updates[key]['country_name'] = country_name

    # Process VAT rates
    for _, row in vat_df.iterrows():
        country_name = row['Territory']
        vat_info = clean_vat_rate(row['Standard_VAT_rate'])

        if vat_info is not None:
            key = country_name_to_key(country_name)
            if key not in updates:
                updates[key] = {}
            updates[key]['vat_info'] = vat_info
            updates[key]['country_name'] = country_name

    print(f"Processed data for {len(updates)} countries")

    # Save the updates to a JSON file for manual inspection
    with open('tax_data_updates.json', 'w') as f:
        json.dump(updates, f, indent=2)

    print("Updates saved to tax_data_updates.json")
    print("\nSample updates:")
    for i, (key, data) in enumerate(updates.items()):
        if i >= 10:
            break
        print(f"  {key}: {data}")

if __name__ == "__main__":
    main()