// Data integration script to process data files and update taxData.js
import { dataProcessor } from './dataProcessor.js';
import { taxData } from './taxData.js';

class DataIntegrator {
    constructor() {
        this.dataFileContents = new Map();
        this.processedData = {};
        this.integrationLog = [];
    }

    // Manually load data file contents (since we can't fetch files in development)
    loadDataFileContents() {
        // Europe data
        this.dataFileContents.set('europe.data', `{
  "germany": {
    "name": "Germany",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "DE",
    "coordinates": [52.52, 13.405],
    "brackets": [
      {"min": 0, "max": 12096, "rate": 0},
      {"min": 12096, "max": 68429, "rate": "14-42 (geometrically progressive)"},
      {"min": 68430, "max": 277825, "rate": 42},
      {"min": 277826, "max": null, "rate": 45}
    ]
  },
  "france": {
    "name": "France",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "FR",
    "coordinates": [48.8566, 2.3522],
    "brackets": [
      {"min": 0, "max": 11294, "rate": 0},
      {"min": 11295, "max": 28797, "rate": 11},
      {"min": 28798, "max": 82341, "rate": 30},
      {"min": 82342, "max": 177106, "rate": 41},
      {"min": 177107, "max": null, "rate": 45}
    ]
  },
  "united_kingdom": {
    "name": "United Kingdom",
    "currency": "GBP",
    "system": "progressive",
    "countryCode": "GB",
    "coordinates": [51.5074, -0.1278],
    "brackets": [
      {"min": 0, "max": 12570, "rate": 0},
      {"min": 12571, "max": 50270, "rate": 20},
      {"min": 50271, "max": 125140, "rate": 40},
      {"min": 125141, "max": null, "rate": 45}
    ]
  },
  "spain": {
    "name": "Spain",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "ES",
    "coordinates": [40.4168, -3.7038],
    "brackets": [
      {"min": 0, "max": 6000, "rate": 19},
      {"min": 6001, "max": 50000, "rate": 21},
      {"min": 50001, "max": 200000, "rate": 47},
      {"min": 200001, "max": null, "rate": 54}
    ]
  },
  "italy": {
    "name": "Italy",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "IT",
    "coordinates": [41.9028, 12.4964],
    "brackets": [
      {"min": 0, "max": 28000, "rate": 23},
      {"min": 28001, "max": 50000, "rate": 35},
      {"min": 50001, "max": null, "rate": 43}
    ]
  },
  "netherlands": {
    "name": "Netherlands",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "NL",
    "coordinates": [52.3676, 4.9041],
    "brackets": [
      {"min": 0, "max": 38441, "rate": 8.17},
      {"min": 38442, "max": 76817, "rate": 37.48},
      {"min": 76818, "max": null, "rate": 49.50}
    ]
  },
  "sweden": {
    "name": "Sweden",
    "currency": "SEK",
    "system": "progressive",
    "countryCode": "SE",
    "coordinates": [59.3293, 18.0686],
    "brackets": [
      {"min": 0, "max": 625800, "rate": 32},
      {"min": 625801, "max": null, "rate": 52}
    ]
  },
  "norway": {
    "name": "Norway",
    "currency": "NOK",
    "system": "progressive",
    "countryCode": "NO",
    "coordinates": [59.9139, 10.7522],
    "brackets": [
      {"min": 0, "max": 217400, "rate": 0},
      {"min": 217401, "max": 306050, "rate": 1.7},
      {"min": 306051, "max": 697400, "rate": 4.0},
      {"min": 697401, "max": 942400, "rate": 13.7},
      {"min": 942401, "max": 1410750, "rate": 16.7},
      {"min": 1410751, "max": null, "rate": 17.7}
    ]
  },
  "poland": {
    "name": "Poland",
    "currency": "PLN",
    "system": "progressive",
    "countryCode": "PL",
    "coordinates": [52.2297, 21.0122],
    "brackets": [
      {"min": 0, "max": 120000, "rate": 12},
      {"min": 120001, "max": null, "rate": 32}
    ]
  },
  "belgium": {
    "name": "Belgium",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "BE",
    "coordinates": [50.8503, 4.3517],
    "brackets": [
      {"min": 0, "max": 13770, "rate": 25},
      {"min": 13771, "max": 24120, "rate": 40},
      {"min": 24121, "max": 42070, "rate": 45},
      {"min": 42071, "max": null, "rate": 50}
    ]
  },
  "austria": {
    "name": "Austria",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "AT",
    "coordinates": [48.2082, 16.3738],
    "brackets": [
      {"min": 0, "max": 13308, "rate": 0},
      {"min": 13309, "max": 21617, "rate": 20},
      {"min": 21618, "max": 35836, "rate": 30},
      {"min": 35837, "max": 69166, "rate": 40},
      {"min": 69167, "max": 103072, "rate": 48},
      {"min": 103073, "max": 1000000, "rate": 50},
      {"min": 1000001, "max": null, "rate": 55}
    ]
  },
  "switzerland": {
    "name": "Switzerland",
    "currency": "CHF",
    "system": "progressive",
    "countryCode": "CH",
    "coordinates": [46.948, 7.4474],
    "brackets": [
      {"min": 0, "max": 14500, "rate": 0},
      {"min": 14501, "max": 31600, "rate": 0.77},
      {"min": 31601, "max": 41400, "rate": 0.88},
      {"min": 41401, "max": 55200, "rate": 2.64},
      {"min": 55201, "max": 72500, "rate": 2.97},
      {"min": 72501, "max": 78100, "rate": 5.94},
      {"min": 78101, "max": 103600, "rate": 6.6},
      {"min": 103601, "max": 134600, "rate": 8.8},
      {"min": 134601, "max": 176000, "rate": 11},
      {"min": 176001, "max": 755200, "rate": 13.2},
      {"min": 755201, "max": null, "rate": 11.5}
    ]
  }
}`);

        // East Asia data
        this.dataFileContents.set('east_asia.data', `{
  "china": {
    "name": "China",
    "currency": "CNY",
    "system": "progressive",
    "countryCode": "CN",
    "coordinates": [39.9042, 116.4074],
    "brackets": [
      {"min": 0, "max": 36000, "rate": 3},
      {"min": 36001, "max": 144000, "rate": 10},
      {"min": 144001, "max": 300000, "rate": 20},
      {"min": 300001, "max": 420000, "rate": 25},
      {"min": 420001, "max": 660000, "rate": 30},
      {"min": 660001, "max": 960000, "rate": 35},
      {"min": 960001, "max": null, "rate": 45}
    ]
  },
  "japan": {
    "name": "Japan",
    "currency": "JPY",
    "system": "progressive",
    "countryCode": "JP",
    "coordinates": [35.6895, 139.6917],
    "brackets": [
      {"min": 0, "max": 1950000, "rate": 5},
      {"min": 1950001, "max": 3300000, "rate": 10},
      {"min": 3300001, "max": 6950000, "rate": 20},
      {"min": 6950001, "max": 9000000, "rate": 23},
      {"min": 9000001, "max": 18000000, "rate": 33},
      {"min": 18000001, "max": 40000000, "rate": 40},
      {"min": 40000001, "max": null, "rate": 45}
    ]
  },
  "south_korea": {
    "name": "South Korea",
    "currency": "KRW",
    "system": "progressive",
    "countryCode": "KR",
    "coordinates": [37.5665, 126.978],
    "brackets": [
      {"min": 0, "max": 14000000, "rate": 6},
      {"min": 14000001, "max": 50000000, "rate": 15},
      {"min": 50000001, "max": 88000000, "rate": 24},
      {"min": 88000001, "max": 150000000, "rate": 35},
      {"min": 150000001, "max": 300000000, "rate": 38},
      {"min": 300000001, "max": 500000000, "rate": 40},
      {"min": 500000001, "max": 1000000000, "rate": 42},
      {"min": 1000000001, "max": null, "rate": 45}
    ]
  },
  "north_korea": {
    "name": "North Korea",
    "currency": "KPW",
    "system": "zero_personal",
    "countryCode": "KP",
    "coordinates": [39.0392, 125.7625],
    "brackets": [{"min": 0, "max": null, "rate": 0}]
  },
  "mongolia": {
    "name": "Mongolia",
    "currency": "MNT",
    "system": "flat",
    "countryCode": "MN",
    "coordinates": [47.8864, 106.9057],
    "brackets": [{"min": 0, "max": null, "rate": 10}]
  },
  "hong_kong": {
    "name": "Hong Kong",
    "currency": "HKD",
    "system": "progressive",
    "countryCode": "HK",
    "coordinates": [22.3193, 114.1694],
    "brackets": [
      {"min": 0, "max": 50000, "rate": 2},
      {"min": 50001, "max": 100000, "rate": 6},
      {"min": 100001, "max": 150000, "rate": 10},
      {"min": 150001, "max": 200000, "rate": 14},
      {"min": 200001, "max": null, "rate": 17}
    ]
  },
  "taiwan": {
    "name": "Taiwan",
    "currency": "TWD",
    "system": "progressive",
    "countryCode": "TW",
    "coordinates": [25.033, 121.5654],
    "brackets": [
      {"min": 0, "max": 560000, "rate": 5},
      {"min": 560001, "max": 1260000, "rate": 12},
      {"min": 1260001, "max": 2520000, "rate": 20},
      {"min": 2520001, "max": 4720000, "rate": 30},
      {"min": 4720001, "max": null, "rate": 40}
    ]
  },
  "macau": {
    "name": "Macau",
    "currency": "MOP",
    "system": "progressive",
    "countryCode": "MO",
    "coordinates": [22.1987, 113.5439],
    "brackets": [
      {"min": 0, "max": 144000, "rate": 7},
      {"min": 144001, "max": 160000, "rate": 8},
      {"min": 160001, "max": 176000, "rate": 9},
      {"min": 176001, "max": 192000, "rate": 10},
      {"min": 192001, "max": 208000, "rate": 11},
      {"min": 208001, "max": 224000, "rate": 12},
      {"min": 224001, "max": 288000, "rate": 13},
      {"min": 288001, "max": 352000, "rate": 14},
      {"min": 352001, "max": null, "rate": 15}
    ]
  }
}`);

        // Nordic & Baltic data
        this.dataFileContents.set('nordic_baltic.data', `{
  "denmark": {
    "name": "Denmark",
    "currency": "DKK",
    "system": "progressive",
    "countryCode": "DK",
    "coordinates": [55.6761, 12.5683],
    "brackets": [
      {"min": 0, "max": 50000, "rate": 8},
      {"min": 50001, "max": 552500, "rate": 39},
      {"min": 552501, "max": null, "rate": 52}
    ]
  },
  "finland": {
    "name": "Finland",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "FI",
    "coordinates": [60.1699, 24.9384],
    "brackets": [
      {"min": 0, "max": 19900, "rate": 0},
      {"min": 19901, "max": 29700, "rate": 6},
      {"min": 29701, "max": 49500, "rate": 17.25},
      {"min": 49501, "max": 85900, "rate": 21.25},
      {"min": 85901, "max": null, "rate": 31.25}
    ]
  },
  "iceland": {
    "name": "Iceland",
    "currency": "ISK",
    "system": "progressive",
    "countryCode": "IS",
    "coordinates": [64.1355, -21.8954],
    "brackets": [
      {"min": 0, "max": 451706, "rate": 31.45},
      {"min": 451707, "max": 1279000, "rate": 37.95},
      {"min": 1279001, "max": null, "rate": 46.25}
    ]
  },
  "estonia": {
    "name": "Estonia",
    "currency": "EUR",
    "system": "flat",
    "countryCode": "EE",
    "coordinates": [59.437, 24.7536],
    "brackets": [{"min": 0, "max": null, "rate": 20}]
  },
  "latvia": {
    "name": "Latvia",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "LV",
    "coordinates": [56.9496, 24.1052],
    "brackets": [
      {"min": 0, "max": 20004, "rate": 20},
      {"min": 20005, "max": 78764, "rate": 23},
      {"min": 78765, "max": null, "rate": 31}
    ]
  },
  "lithuania": {
    "name": "Lithuania",
    "currency": "EUR",
    "system": "progressive",
    "countryCode": "LT",
    "coordinates": [54.6872, 25.2797],
    "brackets": [
      {"min": 0, "max": 104277, "rate": 20},
      {"min": 104278, "max": null, "rate": 32}
    ]
  }
}`);

        // Ukraine data
        this.dataFileContents.set('ukraine.data', `{
  "ukraine": {
    "name": "Ukraine",
    "currency": "UAH",
    "system": "flat",
    "countryCode": "UA",
    "coordinates": [50.4501, 30.5234],
    "brackets": [{"min": 0, "max": null, "rate": 18}],
    "militaryTax": {
      "rate": 5,
      "base": "all taxable income (same base as PIT)",
      "notes": "raised from 1.5% to 5% effective from 1 December 2024 law for residents and most income categories"
    },
    "dividends": {
      "resident": 5,
      "nonResident": 9,
      "notes": "ordinary dividends; special cases may apply under law"
    }
  }
}`);

        this.log('Loaded data file contents for processing');
    }

    // Process all data files
    async processAllData() {
        this.log('Starting data integration process...');

        // Load the data file contents
        this.loadDataFileContents();

        // Process each data file
        for (const [filename, content] of this.dataFileContents) {
            this.log(`Processing ${filename}...`);
            const success = dataProcessor.parseDataFile(content, filename);

            if (success) {
                this.log(`✅ Successfully processed ${filename}`);
            } else {
                this.log(`❌ Failed to process ${filename}`);
            }
        }

        // Get processed data
        this.processedData = dataProcessor.getProcessedCountries();

        // Log summary
        const summary = dataProcessor.getSummary();
        this.log(`Processing complete: ${summary.totalCountries} countries processed, ${summary.totalErrors} errors`);

        return {
            success: true,
            countries: this.processedData,
            summary: summary,
            errors: dataProcessor.getErrors()
        };
    }

    // Generate updated taxData.js content
    generateUpdatedTaxData() {
        // Merge with existing data
        const mergedData = dataProcessor.mergeWithExisting(taxData);

        // Convert to formatted JavaScript code
        const jsContent = this.generateJavaScriptExport(mergedData);

        return jsContent;
    }

    // Generate JavaScript export string
    generateJavaScriptExport(data) {
        const entriesString = Object.entries(data)
            .map(([key, value]) => {
                const formatted = JSON.stringify(value, null, 8).replace(/"/g, '');
                return `    "${key}": ${formatted.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*): /g, '$1$2: ').replace(/: null/g, ': null')}`;
            })
            .join(',\n');

        return `// Tax data for major countries
export const taxData = {
${entriesString}

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
`;
    }

    // Log integration activities
    log(message) {
        const timestamp = new Date().toISOString();
        this.integrationLog.push(`[${timestamp}] ${message}`);
        console.log(`[DataIntegrator] ${message}`);
    }

    // Get integration log
    getLog() {
        return this.integrationLog;
    }

    // Clear all data
    clear() {
        this.dataFileContents.clear();
        this.processedData = {};
        this.integrationLog = [];
        dataProcessor.clear();
    }
}

// Create singleton instance
export const dataIntegrator = new DataIntegrator();

// Main function to run the full integration
export async function integrateAllData() {
    try {
        const result = await dataIntegrator.processAllData();

        if (result.success) {
            const updatedContent = dataIntegrator.generateUpdatedTaxData();

            return {
                success: true,
                updatedTaxDataContent: updatedContent,
                summary: result.summary,
                errors: result.errors,
                log: dataIntegrator.getLog()
            };
        } else {
            throw new Error('Data processing failed');
        }
    } catch (error) {
        return {
            success: false,
            error: error.message,
            log: dataIntegrator.getLog()
        };
    }
}