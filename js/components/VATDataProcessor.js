// VAT Data Processor - Extract and structure VAT information from info1.md
export class VATDataProcessor {
    constructor() {
        this.vatData = new Map();
        this.processingErrors = [];
    }

    // Process VAT data from info1.md content
    processVATData(markdownContent) {
        try {
            const lines = markdownContent.split('\n');
            let currentCountry = null;
            let currentData = {};

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Detect country entries (numbered list)
                const countryMatch = line.match(/^\d+\.\s+(.+?)\s+\(([A-Z]{2})\)$/);
                if (countryMatch) {
                    // Save previous country if exists
                    if (currentCountry && currentData.vat) {
                        this.saveCountryVATData(currentCountry, currentData);
                    }

                    // Start new country
                    currentCountry = {
                        name: countryMatch[1],
                        code: countryMatch[2]
                    };
                    currentData = {};
                    continue;
                }

                // Extract VAT information
                if (line.startsWith('VAT:')) {
                    const vatInfo = line.substring(4).trim();
                    currentData.vat = this.parseVATInfo(vatInfo);
                    continue;
                }

                // Extract other information if needed
                if (line.startsWith('Currency:')) {
                    currentData.currency = line.substring(9).trim();
                }

                if (line.startsWith('Tax Range:')) {
                    currentData.taxRange = line.substring(10).trim();
                }
            }

            // Save last country
            if (currentCountry && currentData.vat) {
                this.saveCountryVATData(currentCountry, currentData);
            }

            return {
                success: true,
                processedCount: this.vatData.size,
                errors: this.processingErrors
            };

        } catch (error) {
            this.processingErrors.push({
                type: 'processing_error',
                message: error.message
            });
            return {
                success: false,
                error: error.message,
                errors: this.processingErrors
            };
        }
    }

    // Parse VAT information string
    parseVATInfo(vatString) {
        const vatInfo = {
            hasVAT: true,
            standard: null,
            reduced: [],
            zeroRated: false,
            notes: null
        };

        // Handle special cases
        if (vatString.includes('No federal VAT')) {
            vatInfo.hasVAT = false;
            vatInfo.notes = vatString;
            return vatInfo;
        }

        // Extract standard rate
        const standardMatch = vatString.match(/Standard\s+(\d+(?:\.\d+)?)%/i);
        if (standardMatch) {
            vatInfo.standard = parseFloat(standardMatch[1]);
        }

        // Extract reduced rates
        const reducedMatches = vatString.match(/reduced\s+([^,]+)/i);
        if (reducedMatches) {
            const reducedString = reducedMatches[1];
            // Parse multiple reduced rates like "10%/4%" or "12%/6%"
            const rates = reducedString.match(/(\d+(?:\.\d+)?)%/g);
            if (rates) {
                vatInfo.reduced = rates.map(rate => parseFloat(rate.replace('%', '')));
            }
        }

        // Check for zero-rated items
        if (vatString.includes('zero-rated')) {
            vatInfo.zeroRated = true;
        }

        // Store full description for reference
        vatInfo.description = vatString;

        return vatInfo;
    }

    // Save country VAT data
    saveCountryVATData(countryInfo, data) {
        const countryKey = this.generateCountryKey(countryInfo.name);

        this.vatData.set(countryKey, {
            name: countryInfo.name,
            code: countryInfo.code,
            currency: data.currency,
            taxRange: data.taxRange,
            vat: data.vat
        });
    }

    // Generate consistent country key
    generateCountryKey(countryName) {
        return countryName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }

    // Get processed VAT data
    getVATData() {
        return Object.fromEntries(this.vatData);
    }

    // Get VAT data for specific country
    getCountryVAT(countryKey) {
        return this.vatData.get(countryKey);
    }

    // Generate summary statistics
    getSummary() {
        const countries = Array.from(this.vatData.values());

        const withVAT = countries.filter(c => c.vat.hasVAT);
        const withoutVAT = countries.filter(c => !c.vat.hasVAT);

        const standardRates = withVAT
            .filter(c => c.vat.standard !== null)
            .map(c => c.vat.standard);

        return {
            totalCountries: countries.length,
            countriesWithVAT: withVAT.length,
            countriesWithoutVAT: withoutVAT.length,
            averageStandardRate: standardRates.length > 0
                ? (standardRates.reduce((a, b) => a + b, 0) / standardRates.length).toFixed(2)
                : 0,
            highestStandardRate: standardRates.length > 0 ? Math.max(...standardRates) : 0,
            lowestStandardRate: standardRates.length > 0 ? Math.min(...standardRates) : 0,
            processingErrors: this.processingErrors.length
        };
    }

    // Clear all data
    clear() {
        this.vatData.clear();
        this.processingErrors = [];
    }
}

// Pre-defined VAT data from info1.md
const VAT_DATA_FROM_INFO1 = {
    united_states: {
        hasVAT: false,
        notes: "No federal VAT; state sales taxes range 0%–10%"
    },
    canada: {
        hasVAT: true,
        standard: 5,
        notes: "Federal GST 5% + provincial sales taxes (0%–10%)",
        description: "Federal GST 5% + provincial sales taxes (0%–10%)"
    },
    mexico: {
        hasVAT: true,
        standard: 16,
        reduced: [0],
        notes: "Standard 16%, reduced 0% in border regions",
        description: "Standard 16%, reduced 0% in border regions"
    },
    germany: {
        hasVAT: true,
        standard: 19,
        reduced: [7],
        description: "Standard 19%, reduced 7% for essentials"
    },
    france: {
        hasVAT: true,
        standard: 20,
        reduced: [10, 5.5, 2.1],
        description: "Standard 20%, reduced 10%/5.5%/2.1%"
    },
    united_kingdom: {
        hasVAT: true,
        standard: 20,
        reduced: [5],
        zeroRated: true,
        description: "Standard 20%, reduced 5%, zero-rated items"
    },
    italy: {
        hasVAT: true,
        standard: 22,
        reduced: [10, 4],
        description: "Standard 22%, reduced 10%/4%"
    },
    spain: {
        hasVAT: true,
        standard: 21,
        reduced: [10, 4],
        description: "Standard 21%, reduced 10%/4%"
    },
    netherlands: {
        hasVAT: true,
        standard: 21,
        reduced: [9],
        description: "Standard 21%, reduced 9%"
    },
    belgium: {
        hasVAT: true,
        standard: 21,
        reduced: [12, 6],
        description: "Standard 21%, reduced 12%/6%"
    },
    austria: {
        hasVAT: true,
        standard: 20,
        reduced: [13, 10],
        description: "Standard 20%, reduced 13%/10%"
    },
    switzerland: {
        hasVAT: true,
        standard: 8.1,
        reduced: [3.8, 2.6],
        description: "Standard 8.1%, reduced 3.8%/2.6%"
    }
};

// Export pre-processed data and processor class
export { VAT_DATA_FROM_INFO1 };