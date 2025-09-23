// Script to merge VAT data from info1.md with existing tax data
import { taxData } from './taxData.js';
import { VAT_DATA_FROM_INFO1 } from './components/VATDataProcessor.js';

// Function to merge VAT data with existing tax data
export function mergeVATDataWithTaxData() {
    const mergedData = { ...taxData };
    let mergedCount = 0;
    let skippedCount = 0;
    const mergeLog = [];

    // Iterate through VAT data and merge with existing countries
    Object.entries(VAT_DATA_FROM_INFO1).forEach(([countryKey, vatInfo]) => {
        if (mergedData[countryKey]) {
            // Add VAT information to existing country data
            mergedData[countryKey].vat = vatInfo;
            mergedCount++;
            mergeLog.push(`✅ Added VAT data for ${mergedData[countryKey].name}`);
        } else {
            skippedCount++;
            mergeLog.push(`⚠️ Skipped VAT data for ${countryKey} - country not found in tax data`);
        }
    });

    return {
        success: true,
        mergedData,
        statistics: {
            totalVATEntries: Object.keys(VAT_DATA_FROM_INFO1).length,
            mergedCount,
            skippedCount
        },
        log: mergeLog
    };
}

// Function to generate updated taxData.js content
export function generateUpdatedTaxDataJS() {
    const mergeResult = mergeVATDataWithTaxData();

    if (!mergeResult.success) {
        throw new Error('Failed to merge VAT data');
    }

    // Convert merged data to JavaScript format
    const entriesString = Object.entries(mergeResult.mergedData)
        .map(([key, value]) => {
            // Format the country object
            const formattedValue = JSON.stringify(value, null, 8)
                .replace(/"/g, '')
                .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*): /g, '$1$2: ')
                .replace(/: null/g, ': null')
                .replace(/: true/g, ': true')
                .replace(/: false/g, ': false');

            return `    "${key}": ${formattedValue}`;
        })
        .join(',\n');

    const jsContent = `// Tax data for major countries (with VAT information)
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

// Helper function to get VAT information for a country
export function getCountryVAT(countryKey) {
    const country = taxData[countryKey];
    return country ? country.vat : null;
}

// Helper function to format VAT information for display
export function formatVATInfo(vatInfo) {
    if (!vatInfo) return 'No VAT information available';

    if (!vatInfo.hasVAT) {
        return vatInfo.notes || 'No VAT system';
    }

    let vatText = \`Standard: \${vatInfo.standard}%\`;

    if (vatInfo.reduced && vatInfo.reduced.length > 0) {
        vatText += \`, Reduced: \${vatInfo.reduced.join('%/')}\%\`;
    }

    if (vatInfo.zeroRated) {
        vatText += ', Zero-rated items available';
    }

    return vatText;
}
`;

    return {
        content: jsContent,
        statistics: mergeResult.statistics,
        log: mergeResult.log
    };
}

// Execute the merge and generate updated content
console.log('🔄 Starting VAT data merge process...');

try {
    const result = generateUpdatedTaxDataJS();

    console.log('✅ VAT data merge completed successfully!');
    console.log(`📊 Statistics:`, result.statistics);
    console.log(`📝 Merge log:`, result.log);

    // Export the result for use by other modules
    export const mergeResult = result;

} catch (error) {
    console.error('❌ Failed to merge VAT data:', error);
}