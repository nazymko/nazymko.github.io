// Data processor for parsing and integrating country tax data from data files
import { taxData } from './taxData.js';

class DataProcessor {
    constructor() {
        this.processedCountries = new Map();
        this.errors = [];
    }

    // Parse individual data file content
    parseDataFile(content, filename) {
        try {
            // Handle files that are missing proper JSON structure
            let jsonContent = content.trim();

            // If content doesn't start with { or {", wrap it
            if (!jsonContent.startsWith('{')) {
                jsonContent = '{\n' + jsonContent + '\n}';
            }

            // Parse the JSON
            const data = JSON.parse(jsonContent);

            // Process each country in the data file
            Object.entries(data).forEach(([countryKey, countryData]) => {
                this.processCountry(countryKey, countryData, filename);
            });

            return true;
        } catch (error) {
            this.errors.push({
                file: filename,
                error: error.message,
                content: content.substring(0, 200) + '...'
            });
            return false;
        }
    }

    // Process individual country data
    processCountry(countryKey, countryData, sourceFile) {
        try {
            // Validate required fields
            if (!countryData.name || !countryData.currency || !countryData.brackets) {
                this.errors.push({
                    country: countryKey,
                    error: 'Missing required fields (name, currency, or brackets)',
                    sourceFile
                });
                return;
            }

            // Normalize country key (convert to lowercase, replace spaces with underscores)
            const normalizedKey = countryKey.toLowerCase().replace(/\s+/g, '_');

            // Process tax brackets
            const processedBrackets = this.processTaxBrackets(countryData.brackets);

            // Create standardized country object
            const processedCountry = {
                name: countryData.name,
                currency: countryData.currency,
                system: countryData.system || 'progressive',
                countryCode: countryData.countryCode || this.inferCountryCode(countryData.name),
                coordinates: countryData.coordinates || [0, 0],
                brackets: processedBrackets,
                sourceFile: sourceFile,
                additionalInfo: this.extractAdditionalInfo(countryData)
            };

            // Store processed country
            this.processedCountries.set(normalizedKey, processedCountry);

        } catch (error) {
            this.errors.push({
                country: countryKey,
                error: error.message,
                sourceFile
            });
        }
    }

    // Process tax brackets to ensure consistency
    processTaxBrackets(brackets) {
        if (!Array.isArray(brackets)) {
            return [{ min: 0, max: null, rate: 0 }];
        }

        return brackets.map(bracket => {
            // Handle complex rate descriptions
            let rate = bracket.rate;
            if (typeof rate === 'string') {
                // Extract numeric rate from complex descriptions
                if (rate.includes('geometrically progressive')) {
                    rate = this.extractRateFromGeometric(rate);
                } else {
                    // Extract first number from string
                    const match = rate.match(/(\d+(?:\.\d+)?)/);
                    rate = match ? parseFloat(match[1]) : 0;
                }
            }

            return {
                min: bracket.min || 0,
                max: bracket.max || null,
                rate: rate
            };
        });
    }

    // Extract rate from geometric progression description
    extractRateFromGeometric(rateString) {
        // For "14-42 (geometrically progressive)", use the average
        const match = rateString.match(/(\d+)-(\d+)/);
        if (match) {
            const min = parseFloat(match[1]);
            const max = parseFloat(match[2]);
            return (min + max) / 2; // Use average rate
        }
        return 0;
    }

    // Extract additional information (military tax, notes, etc.)
    extractAdditionalInfo(countryData) {
        const additional = {};

        if (countryData.militaryTax) {
            additional.militaryTax = countryData.militaryTax;
        }

        if (countryData.dividends) {
            additional.dividends = countryData.dividends;
        }

        if (countryData.notes) {
            additional.notes = countryData.notes;
        }

        return Object.keys(additional).length > 0 ? additional : null;
    }

    // Infer country code from country name
    inferCountryCode(countryName) {
        const countryCodeMap = {
            'Germany': 'DE',
            'France': 'FR',
            'United Kingdom': 'GB',
            'Spain': 'ES',
            'Italy': 'IT',
            'Netherlands': 'NL',
            'Sweden': 'SE',
            'Norway': 'NO',
            'Poland': 'PL',
            'Belgium': 'BE',
            'Austria': 'AT',
            'Switzerland': 'CH',
            'China': 'CN',
            'Japan': 'JP',
            'South Korea': 'KR',
            'North Korea': 'KP',
            'Mongolia': 'MN',
            'Hong Kong': 'HK',
            'Taiwan': 'TW',
            'Macau': 'MO',
            'Denmark': 'DK',
            'Finland': 'FI',
            'Iceland': 'IS',
            'Estonia': 'EE',
            'Latvia': 'LV',
            'Lithuania': 'LT',
            'Ukraine': 'UA',
            'Ireland': 'IE',
            'Portugal': 'PT',
            'Greece': 'GR',
            'Cyprus': 'CY',
            'Malta': 'MT',
            'Luxembourg': 'LU',
            'Czech Republic': 'CZ',
            'Slovakia': 'SK',
            'Slovenia': 'SI',
            'Croatia': 'HR',
            'Hungary': 'HU',
            'Romania': 'RO',
            'Bulgaria': 'BG',
            'Serbia': 'RS',
            'Montenegro': 'ME',
            'Bosnia and Herzegovina': 'BA',
            'North Macedonia': 'MK',
            'Kosovo': 'XK',
            'Albania': 'AL',
            'Moldova': 'MD',
            'Belarus': 'BY',
            'Russia': 'RU'
        };

        return countryCodeMap[countryName] || 'XX';
    }

    // Get processed countries
    getProcessedCountries() {
        return Object.fromEntries(this.processedCountries);
    }

    // Get processing errors
    getErrors() {
        return this.errors;
    }

    // Get processing summary
    getSummary() {
        return {
            totalCountries: this.processedCountries.size,
            totalErrors: this.errors.length,
            successRate: ((this.processedCountries.size / (this.processedCountries.size + this.errors.length)) * 100).toFixed(2)
        };
    }

    // Merge with existing tax data
    mergeWithExisting(existingData = taxData) {
        const merged = { ...existingData };

        // Add processed countries, avoiding duplicates
        this.processedCountries.forEach((countryData, countryKey) => {
            if (!merged[countryKey]) {
                // Remove sourceFile and additionalInfo for clean export
                const { sourceFile, additionalInfo, ...cleanData } = countryData;
                merged[countryKey] = cleanData;
            } else {
                console.warn(`Country ${countryKey} already exists in dataset, skipping merge`);
            }
        });

        return merged;
    }

    // Clear processed data
    clear() {
        this.processedCountries.clear();
        this.errors = [];
    }
}

// Create singleton instance
export const dataProcessor = new DataProcessor();

// Utility function to load and process all data files
export async function loadAllDataFiles() {
    const dataFiles = [
        'js/data/europe.data',
        'js/data/East Asia.data',
        'js/data/Part 1 – Nordic & Baltic States.data',
        'js/data/remaining European countries.data',
        'js/data/ukraine.data'
    ];

    const results = {
        processed: 0,
        failed: 0,
        countries: [],
        errors: []
    };

    for (const filePath of dataFiles) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            const success = dataProcessor.parseDataFile(content, filePath);

            if (success) {
                results.processed++;
            } else {
                results.failed++;
            }
        } catch (error) {
            results.failed++;
            results.errors.push({
                file: filePath,
                error: error.message
            });
        }
    }

    // Get summary
    const summary = dataProcessor.getSummary();
    results.countries = Object.keys(dataProcessor.getProcessedCountries());
    results.totalCountries = summary.totalCountries;
    results.processingErrors = dataProcessor.getErrors();

    return results;
}

// Export functions for external use
export { DataProcessor };