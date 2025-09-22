// Tax data for major countries
export const taxData = {
    "united_states": {
        name: "United States",
        currency: "USD",
        system: "progressive",
        countryCode: "US",
        coordinates: [39.8283, -98.5795],
        brackets: [
            {min: 0, max: 12550, rate: 10},
            {min: 12551, max: 50800, rate: 12},
            {min: 50801, max: 129500, rate: 22},
            {min: 129501, max: 207600, rate: 24},
            {min: 207601, max: 518800, rate: 32},
            {min: 518801, max: 622050, rate: 35},
            {min: 622051, max: null, rate: 37}
        ]
    },
    "canada": {
        name: "Canada",
        currency: "CAD",
        system: "progressive",
        countryCode: "CA",
        coordinates: [56.1304, -106.3468],
        brackets: [
            {min: 0, max: 53359, rate: 14.5},
            {min: 53360, max: 106717, rate: 20.5},
            {min: 106718, max: 165430, rate: 26},
            {min: 165431, max: 235675, rate: 29},
            {min: 235676, max: null, rate: 33}
        ]
    },
    "united_kingdom": {
        name: "United Kingdom",
        currency: "GBP",
        system: "progressive",
        countryCode: "GB",
        coordinates: [55.3781, -3.4360],
        brackets: [
            {min: 0, max: 12570, rate: 0},
            {min: 12571, max: 50270, rate: 20},
            {min: 50271, max: 125140, rate: 40},
            {min: 125141, max: null, rate: 45}
        ]
    },
    "germany": {
        name: "Germany",
        currency: "EUR",
        system: "progressive",
        countryCode: "DE",
        coordinates: [51.1657, 10.4515],
        brackets: [
            {min: 0, max: 11604, rate: 0},
            {min: 11605, max: 17005, rate: 14},
            {min: 17006, max: 66760, rate: 24},
            {min: 66761, max: 277825, rate: 42},
            {min: 277826, max: null, rate: 45}
        ]
    },
    "france": {
        name: "France",
        currency: "EUR",
        system: "progressive",
        countryCode: "FR",
        coordinates: [46.2276, 2.2137],
        brackets: [
            {min: 0, max: 11294, rate: 0},
            {min: 11295, max: 28797, rate: 11},
            {min: 28798, max: 82341, rate: 30},
            {min: 82342, max: 177106, rate: 41},
            {min: 177107, max: null, rate: 45}
        ]
    },
    "italy": {
        name: "Italy",
        currency: "EUR",
        system: "progressive",
        countryCode: "IT",
        coordinates: [41.8719, 12.5674],
        brackets: [
            {min: 0, max: 28000, rate: 23},
            {min: 28001, max: 50000, rate: 35},
            {min: 50001, max: null, rate: 43}
        ]
    },
    "spain": {
        name: "Spain",
        currency: "EUR",
        system: "progressive",
        countryCode: "ES",
        coordinates: [40.4637, -3.7492],
        brackets: [
            {min: 0, max: 12450, rate: 9.5},
            {min: 12451, max: 20200, rate: 12},
            {min: 20201, max: 35200, rate: 15},
            {min: 35201, max: 60000, rate: 18.5},
            {min: 60001, max: 300000, rate: 22.5},
            {min: 300001, max: null, rate: 24.5}
        ]
    },
    "sweden": {
        name: "Sweden",
        currency: "SEK",
        system: "progressive",
        countryCode: "SE",
        coordinates: [60.1282, 18.6435],
        brackets: [
            {min: 0, max: 625800, rate: 32},
            {min: 625801, max: null, rate: 52}
        ]
    },
    "norway": {
        name: "Norway",
        currency: "NOK",
        system: "progressive",
        countryCode: "NO",
        coordinates: [60.4720, 8.4689],
        brackets: [
            {min: 0, max: 208050, rate: 22},
            {min: 208051, max: 292850, rate: 23.7},
            {min: 292851, max: 670000, rate: 26},
            {min: 670001, max: 937900, rate: 35.4},
            {min: 937901, max: null, rate: 39.7}
        ]
    },
    "denmark": {
        name: "Denmark",
        currency: "DKK",
        system: "progressive",
        countryCode: "DK",
        coordinates: [56.2639, 9.5018],
        brackets: [
            {min: 0, max: 588900, rate: 35.2},
            {min: 588901, max: null, rate: 55.9}
        ]
    },
    "russia": {
        name: "Russia",
        currency: "RUB",
        system: "progressive",
        countryCode: "RU",
        coordinates: [61.5240, 105.3188],
        brackets: [
            {min: 0, max: 2400000, rate: 13},
            {min: 2400001, max: 5000000, rate: 15},
            {min: 5000001, max: 20000000, rate: 18},
            {min: 20000001, max: 50000000, rate: 20},
            {min: 50000001, max: null, rate: 22}
        ]
    },
    "china": {
        name: "China",
        currency: "CNY",
        system: "progressive",
        countryCode: "CN",
        coordinates: [35.8617, 104.1954],
        brackets: [
            {min: 0, max: 36000, rate: 3},
            {min: 36001, max: 144000, rate: 10},
            {min: 144001, max: 300000, rate: 20},
            {min: 300001, max: 420000, rate: 25},
            {min: 420001, max: 660000, rate: 30},
            {min: 660001, max: 960000, rate: 35},
            {min: 960001, max: null, rate: 45}
        ]
    },
    "india": {
        name: "India",
        currency: "INR",
        system: "progressive",
        countryCode: "IN",
        coordinates: [20.5937, 78.9629],
        brackets: [
            {min: 0, max: 300000, rate: 0},
            {min: 300001, max: 700000, rate: 5},
            {min: 700001, max: 1000000, rate: 10},
            {min: 1000001, max: 1200000, rate: 15},
            {min: 1200001, max: 1500000, rate: 20},
            {min: 1500001, max: null, rate: 30}
        ]
    },
    "japan": {
        name: "Japan",
        currency: "JPY",
        system: "progressive",
        countryCode: "JP",
        coordinates: [36.2048, 138.2529],
        brackets: [
            {min: 0, max: 1950000, rate: 5},
            {min: 1950001, max: 3300000, rate: 10},
            {min: 3300001, max: 6950000, rate: 20},
            {min: 6950001, max: 9000000, rate: 23},
            {min: 9000001, max: 18000000, rate: 33},
            {min: 18000001, max: 40000000, rate: 40},
            {min: 40000001, max: null, rate: 45}
        ]
    },
    "south_korea": {
        name: "South Korea",
        currency: "KRW",
        system: "progressive",
        countryCode: "KR",
        coordinates: [35.9078, 127.7669],
        brackets: [
            {min: 0, max: 14000000, rate: 6},
            {min: 14000001, max: 50000000, rate: 15},
            {min: 50000001, max: 88000000, rate: 24},
            {min: 88000001, max: 150000000, rate: 35},
            {min: 150000001, max: 300000000, rate: 38},
            {min: 300000001, max: 500000000, rate: 40},
            {min: 500000001, max: 1000000000, rate: 42},
            {min: 1000000001, max: null, rate: 45}
        ]
    },
    "singapore": {
        name: "Singapore",
        currency: "SGD",
        system: "progressive",
        countryCode: "SG",
        coordinates: [1.3521, 103.8198],
        brackets: [
            {min: 0, max: 20000, rate: 0},
            {min: 20001, max: 30000, rate: 2},
            {min: 30001, max: 40000, rate: 3.5},
            {min: 40001, max: 80000, rate: 7},
            {min: 80001, max: 120000, rate: 11.5},
            {min: 120001, max: 160000, rate: 15},
            {min: 160001, max: 200000, rate: 18},
            {min: 200001, max: 240000, rate: 19},
            {min: 240001, max: 280000, rate: 19.5},
            {min: 280001, max: 320000, rate: 20},
            {min: 320001, max: 500000, rate: 22},
            {min: 500001, max: 1000000, rate: 23},
            {min: 1000001, max: null, rate: 24}
        ]
    },
    "thailand": {
        name: "Thailand",
        currency: "THB",
        system: "progressive",
        countryCode: "TH",
        coordinates: [15.8700, 100.9925],
        brackets: [
            {min: 0, max: 150000, rate: 0},
            {min: 150001, max: 300000, rate: 5},
            {min: 300001, max: 500000, rate: 10},
            {min: 500001, max: 750000, rate: 15},
            {min: 750001, max: 1000000, rate: 20},
            {min: 1000001, max: 2000000, rate: 25},
            {min: 2000001, max: 5000000, rate: 30},
            {min: 5000001, max: null, rate: 35}
        ]
    },
    "indonesia": {
        name: "Indonesia",
        currency: "IDR",
        system: "progressive",
        countryCode: "ID",
        coordinates: [-0.7893, 113.9213],
        brackets: [
            {min: 0, max: 60000000, rate: 5},
            {min: 60000001, max: 250000000, rate: 15},
            {min: 250000001, max: 500000000, rate: 25},
            {min: 500000001, max: 5000000000, rate: 30},
            {min: 5000000001, max: null, rate: 35}
        ]
    },
    "australia": {
        name: "Australia",
        currency: "AUD",
        system: "progressive",
        countryCode: "AU",
        coordinates: [-25.2744, 133.7751],
        brackets: [
            {min: 0, max: 18200, rate: 0},
            {min: 18201, max: 45000, rate: 16},
            {min: 45001, max: 135000, rate: 30},
            {min: 135001, max: 190000, rate: 37},
            {min: 190001, max: null, rate: 45}
        ]
    },
    "south_africa": {
        name: "South Africa",
        currency: "ZAR",
        system: "progressive",
        countryCode: "ZA",
        coordinates: [-30.5595, 22.9375],
        brackets: [
            {min: 0, max: 95750, rate: 0},
            {min: 95751, max: 237100, rate: 18},
            {min: 237101, max: 370500, rate: 26},
            {min: 370501, max: 512800, rate: 31},
            {min: 512801, max: 673000, rate: 36},
            {min: 673001, max: 857900, rate: 39},
            {min: 857901, max: 1817000, rate: 41},
            {min: 1817001, max: null, rate: 45}
        ]
    },
    "nigeria": {
        name: "Nigeria",
        currency: "NGN",
        system: "progressive",
        countryCode: "NG",
        coordinates: [9.0820, 8.6753],
        brackets: [
            {min: 0, max: 300000, rate: 7},
            {min: 300001, max: 600000, rate: 11},
            {min: 600001, max: 1100000, rate: 15},
            {min: 1100001, max: 1600000, rate: 19},
            {min: 1600001, max: 3200000, rate: 21},
            {min: 3200001, max: null, rate: 24}
        ]
    },
    "egypt": {
        name: "Egypt",
        currency: "EGP",
        system: "progressive",
        countryCode: "EG",
        coordinates: [26.0975, 30.0444],
        brackets: [
            {min: 0, max: 21000, rate: 0},
            {min: 21001, max: 30000, rate: 2.5},
            {min: 30001, max: 45000, rate: 10},
            {min: 45001, max: 200000, rate: 15},
            {min: 200001, max: 400000, rate: 20},
            {min: 400001, max: 600000, rate: 22.5},
            {min: 600001, max: 700000, rate: 25},
            {min: 700001, max: null, rate: 27.5}
        ]
    },
    "saudi_arabia": {
        name: "Saudi Arabia",
        currency: "SAR",
        system: "zero_personal",
        countryCode: "SA",
        coordinates: [23.8859, 45.0792],
        brackets: [{min: 0, max: null, rate: 0}]
    },
    "united_arab_emirates": {
        name: "United Arab Emirates",
        currency: "AED",
        system: "zero_personal",
        countryCode: "AE",
        coordinates: [23.4241, 53.8478],
        brackets: [{min: 0, max: null, rate: 0}]
    },
    "brazil": {
        name: "Brazil",
        currency: "BRL",
        system: "progressive",
        countryCode: "BR",
        coordinates: [-14.2350, -51.9253],
        brackets: [
            {min: 0, max: 2259.20, rate: 0},
            {min: 2259.21, max: 2826.65, rate: 7.5},
            {min: 2826.66, max: 3751.05, rate: 15},
            {min: 3751.06, max: 4664.68, rate: 22.5},
            {min: 4664.69, max: null, rate: 27.5}
        ]
    },
    "argentina": {
        name: "Argentina",
        currency: "ARS",
        system: "progressive",
        countryCode: "AR",
        coordinates: [-38.4161, -63.6167],
        brackets: [
            {min: 0, max: 2678400, rate: 0},
            {min: 2678401, max: 3216000, rate: 5},
            {min: 3216001, max: 4824000, rate: 9},
            {min: 4824001, max: 6432000, rate: 12},
            {min: 6432001, max: 8040000, rate: 15},
            {min: 8040001, max: 12060000, rate: 19},
            {min: 12060001, max: 16080000, rate: 23},
            {min: 16080001, max: 24120000, rate: 27},
            {min: 24120001, max: 32160000, rate: 31},
            {min: 32160001, max: null, rate: 35}
        ]
    },
    "mexico": {
        name: "Mexico",
        currency: "MXN",
        system: "progressive",
        countryCode: "MX",
        coordinates: [23.6345, -102.5528],
        brackets: [
            {min: 0.01, max: 8952.49, rate: 1.92},
            {min: 8952.50, max: 75984.55, rate: 6.4},
            {min: 75984.56, max: 133536.07, rate: 10.88},
            {min: 133536.08, max: 155229.80, rate: 16},
            {min: 155229.81, max: 185852.57, rate: 21.36},
            {min: 185852.58, max: 374837.88, rate: 23.52},
            {min: 374837.89, max: 748737.38, rate: 30},
            {min: 748737.39, max: 4737272.55, rate: 32},
            {min: 4737272.56, max: null, rate: 35}
        ]
    },
    "netherlands": {
        name: "Netherlands",
        currency: "EUR",
        system: "progressive",
        countryCode: "NL",
        coordinates: [52.3676, 4.9041],
        brackets: [
            {min: 0, max: 38441, rate: 8.17},
            {min: 38442, max: 76817, rate: 37.48},
            {min: 76818, max: null, rate: 49.50}
        ]
    },
    "belgium": {
        name: "Belgium",
        currency: "EUR",
        system: "progressive",
        countryCode: "BE",
        coordinates: [50.8503, 4.3517],
        brackets: [
            {min: 0, max: 13770, rate: 25},
            {min: 13771, max: 24120, rate: 40},
            {min: 24121, max: 42070, rate: 45},
            {min: 42071, max: null, rate: 50}
        ]
    },
    "austria": {
        name: "Austria",
        currency: "EUR",
        system: "progressive",
        countryCode: "AT",
        coordinates: [48.2082, 16.3738],
        brackets: [
            {min: 0, max: 13308, rate: 0},
            {min: 13309, max: 21617, rate: 20},
            {min: 21618, max: 35836, rate: 30},
            {min: 35837, max: 69166, rate: 40},
            {min: 69167, max: 103072, rate: 48},
            {min: 103073, max: 1000000, rate: 50},
            {min: 1000001, max: null, rate: 55}
        ]
    },
    "switzerland": {
        name: "Switzerland",
        currency: "CHF",
        system: "progressive",
        countryCode: "CH",
        coordinates: [46.948, 7.4474],
        brackets: [
            {min: 0, max: 14500, rate: 0},
            {min: 14501, max: 31600, rate: 0.77},
            {min: 31601, max: 41400, rate: 0.88},
            {min: 41401, max: 55200, rate: 2.64},
            {min: 55201, max: 72500, rate: 2.97},
            {min: 72501, max: 78100, rate: 5.94},
            {min: 78101, max: 103600, rate: 6.6},
            {min: 103601, max: 134600, rate: 8.8},
            {min: 134601, max: 176000, rate: 11},
            {min: 176001, max: 755200, rate: 13.2},
            {min: 755201, max: null, rate: 11.5}
        ]
    },
    "poland": {
        name: "Poland",
        currency: "PLN",
        system: "progressive",
        countryCode: "PL",
        coordinates: [52.2297, 21.0122],
        brackets: [
            {min: 0, max: 120000, rate: 12},
            {min: 120001, max: null, rate: 32}
        ]
    },
    "denmark": {
        name: "Denmark",
        currency: "DKK",
        system: "progressive",
        countryCode: "DK",
        coordinates: [55.6761, 12.5683],
        brackets: [
            {min: 0, max: 50000, rate: 8},
            {min: 50001, max: 552500, rate: 39},
            {min: 552501, max: null, rate: 52}
        ]
    },
    "finland": {
        name: "Finland",
        currency: "EUR",
        system: "progressive",
        countryCode: "FI",
        coordinates: [60.1699, 24.9384],
        brackets: [
            {min: 0, max: 19900, rate: 0},
            {min: 19901, max: 29700, rate: 6},
            {min: 29701, max: 49500, rate: 17.25},
            {min: 49501, max: 85900, rate: 21.25},
            {min: 85901, max: null, rate: 31.25}
        ]
    },
    "iceland": {
        name: "Iceland",
        currency: "ISK",
        system: "progressive",
        countryCode: "IS",
        coordinates: [64.1355, -21.8954],
        brackets: [
            {min: 0, max: 451706, rate: 31.45},
            {min: 451707, max: 1279000, rate: 37.95},
            {min: 1279001, max: null, rate: 46.25}
        ]
    },
    "estonia": {
        name: "Estonia",
        currency: "EUR",
        system: "flat",
        countryCode: "EE",
        coordinates: [59.437, 24.7536],
        brackets: [{min: 0, max: null, rate: 20}]
    },
    "latvia": {
        name: "Latvia",
        currency: "EUR",
        system: "progressive",
        countryCode: "LV",
        coordinates: [56.9496, 24.1052],
        brackets: [
            {min: 0, max: 20004, rate: 20},
            {min: 20005, max: 78764, rate: 23},
            {min: 78765, max: null, rate: 31}
        ]
    },
    "lithuania": {
        name: "Lithuania",
        currency: "EUR",
        system: "progressive",
        countryCode: "LT",
        coordinates: [54.6872, 25.2797],
        brackets: [
            {min: 0, max: 104277, rate: 20},
            {min: 104278, max: null, rate: 32}
        ]
    },
    "ukraine": {
        name: "Ukraine",
        currency: "UAH",
        system: "flat",
        countryCode: "UA",
        coordinates: [50.4501, 30.5234],
        brackets: [{min: 0, max: null, rate: 18}]
    },
    "hong_kong": {
        name: "Hong Kong",
        currency: "HKD",
        system: "progressive",
        countryCode: "HK",
        coordinates: [22.3193, 114.1694],
        brackets: [
            {min: 0, max: 50000, rate: 2},
            {min: 50001, max: 100000, rate: 6},
            {min: 100001, max: 150000, rate: 10},
            {min: 150001, max: 200000, rate: 14},
            {min: 200001, max: null, rate: 17}
        ]
    },
    "taiwan": {
        name: "Taiwan",
        currency: "TWD",
        system: "progressive",
        countryCode: "TW",
        coordinates: [25.033, 121.5654],
        brackets: [
            {min: 0, max: 560000, rate: 5},
            {min: 560001, max: 1260000, rate: 12},
            {min: 1260001, max: 2520000, rate: 20},
            {min: 2520001, max: 4720000, rate: 30},
            {min: 4720001, max: null, rate: 40}
        ]
    },
    "mongolia": {
        name: "Mongolia",
        currency: "MNT",
        system: "flat",
        countryCode: "MN",
        coordinates: [47.8864, 106.9057],
        brackets: [{min: 0, max: null, rate: 10}]
    },
    "north_korea": {
        name: "North Korea",
        currency: "KPW",
        system: "zero_personal",
        countryCode: "KP",
        coordinates: [39.0392, 125.7625],
        brackets: [{min: 0, max: null, rate: 0}]
    },
    "macau": {
        name: "Macau",
        currency: "MOP",
        system: "progressive",
        countryCode: "MO",
        coordinates: [22.1987, 113.5439],
        brackets: [
            {min: 0, max: 144000, rate: 7},
            {min: 144001, max: 160000, rate: 8},
            {min: 160001, max: 176000, rate: 9},
            {min: 176001, max: 192000, rate: 10},
            {min: 192001, max: 208000, rate: 11},
            {min: 208001, max: 224000, rate: 12},
            {min: 224001, max: 288000, rate: 13},
            {min: 288001, max: 352000, rate: 14},
            {min: 352001, max: null, rate: 15}
        ]
    },
    "ireland": {
        name: "Ireland",
        currency: "EUR",
        system: "progressive",
        countryCode: "IE",
        coordinates: [53.3498, -6.2603],
        brackets: [
            {min: 0, max: 36800, rate: 20},
            {min: 36801, max: null, rate: 40}
        ]
    },
    "portugal": {
        name: "Portugal",
        currency: "EUR",
        system: "progressive",
        countryCode: "PT",
        coordinates: [38.7223, -9.1393],
        brackets: [
            {min: 0, max: 7151, rate: 14.5},
            {min: 7152, max: 10707, rate: 23},
            {min: 10708, max: 20322, rate: 28.5},
            {min: 20323, max: 25075, rate: 35},
            {min: 25076, max: 36856, rate: 37},
            {min: 36857, max: 80640, rate: 45},
            {min: 80641, max: null, rate: 48}
        ]
    },
    "greece": {
        name: "Greece",
        currency: "EUR",
        system: "progressive",
        countryCode: "GR",
        coordinates: [37.9838, 23.7275],
        brackets: [
            {min: 0, max: 10000, rate: 9},
            {min: 10001, max: 20000, rate: 22},
            {min: 20001, max: 30000, rate: 28},
            {min: 30001, max: 40000, rate: 36},
            {min: 40001, max: null, rate: 44}
        ]
    },

};

// Helper function to get tax rate color for map visualization
export function getTaxRateColor(taxRate) {
    if (taxRate === 0) return '#45b7d1'; // Tax haven
    if (taxRate <= 20) return '#4ecdc4'; // Low
    if (taxRate <= 40) return '#ff8e53'; // Medium
    if (taxRate <= 50) return '#ff6b6b'; // High
    if (taxRate <= 55) return '#ee5a6f'; // Very high
    return '#cc2a41'; // Highest
}
