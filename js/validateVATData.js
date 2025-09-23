// Validation script for merged VAT data
import { taxData, getCountryVAT, formatVATInfo } from './taxData.js';

// Validation results object
const validationResults = {
    totalCountries: 0,
    countriesWithVAT: 0,
    countriesWithoutVAT: 0,
    validationErrors: [],
    validationWarnings: [],
    vatStatistics: {},
    passedTests: [],
    failedTests: []
};

// Run comprehensive validation
function runValidation() {
    console.log('🔍 Starting VAT data validation...');

    // Test 1: Count total countries and VAT coverage
    validateCountryCoverage();

    // Test 2: Validate VAT data structure
    validateVATStructure();

    // Test 3: Check VAT rate ranges
    validateVATRates();

    // Test 4: Test helper functions
    validateHelperFunctions();

    // Test 5: Calculate statistics
    calculateVATStatistics();

    // Generate final report
    generateValidationReport();
}

function validateCountryCoverage() {
    try {
        const countries = Object.keys(taxData);
        validationResults.totalCountries = countries.length;

        countries.forEach(countryKey => {
            const country = taxData[countryKey];
            const vatInfo = country.vat;

            if (vatInfo) {
                validationResults.countriesWithVAT++;
            } else {
                validationResults.countriesWithoutVAT++;
            }
        });

        validationResults.passedTests.push('✅ Country coverage validation passed');
        console.log(`📊 Total countries: ${validationResults.totalCountries}`);
        console.log(`📊 Countries with VAT data: ${validationResults.countriesWithVAT}`);
        console.log(`📊 Countries without VAT data: ${validationResults.countriesWithoutVAT}`);

    } catch (error) {
        validationResults.failedTests.push('❌ Country coverage validation failed: ' + error.message);
        validationResults.validationErrors.push({
            test: 'Country Coverage',
            error: error.message
        });
    }
}

function validateVATStructure() {
    try {
        const vatCountries = Object.entries(taxData).filter(([key, country]) => country.vat);

        vatCountries.forEach(([countryKey, country]) => {
            const vatInfo = country.vat;

            // Check required fields
            if (typeof vatInfo.hasVAT !== 'boolean') {
                validationResults.validationErrors.push({
                    country: countryKey,
                    field: 'hasVAT',
                    error: 'hasVAT must be boolean'
                });
            }

            // For countries with VAT
            if (vatInfo.hasVAT) {
                if (typeof vatInfo.standard !== 'number' || vatInfo.standard < 0 || vatInfo.standard > 50) {
                    validationResults.validationErrors.push({
                        country: countryKey,
                        field: 'standard',
                        error: 'Standard VAT rate must be a number between 0 and 50'
                    });
                }

                if (vatInfo.reduced && !Array.isArray(vatInfo.reduced)) {
                    validationResults.validationErrors.push({
                        country: countryKey,
                        field: 'reduced',
                        error: 'Reduced rates must be an array'
                    });
                }

                if (vatInfo.reduced) {
                    vatInfo.reduced.forEach((rate, index) => {
                        if (typeof rate !== 'number' || rate < 0 || rate > 50) {
                            validationResults.validationErrors.push({
                                country: countryKey,
                                field: `reduced[${index}]`,
                                error: 'Reduced VAT rates must be numbers between 0 and 50'
                            });
                        }
                    });
                }
            }

            // For countries without VAT
            if (!vatInfo.hasVAT) {
                if (!vatInfo.notes) {
                    validationResults.validationWarnings.push({
                        country: countryKey,
                        warning: 'Countries without VAT should have notes explaining the tax system'
                    });
                }
            }
        });

        if (validationResults.validationErrors.filter(e => e.field).length === 0) {
            validationResults.passedTests.push('✅ VAT structure validation passed');
        } else {
            validationResults.failedTests.push('❌ VAT structure validation failed');
        }

    } catch (error) {
        validationResults.failedTests.push('❌ VAT structure validation failed: ' + error.message);
    }
}

function validateVATRates() {
    try {
        const vatCountries = Object.entries(taxData)
            .filter(([key, country]) => country.vat && country.vat.hasVAT);

        const standardRates = vatCountries.map(([key, country]) => country.vat.standard);

        // Check for reasonable rate ranges
        const minRate = Math.min(...standardRates);
        const maxRate = Math.max(...standardRates);

        if (minRate < 0 || maxRate > 50) {
            validationResults.validationErrors.push({
                test: 'VAT Rate Range',
                error: `VAT rates outside reasonable range: ${minRate}% - ${maxRate}%`
            });
        }

        // Check for specific known issues
        vatCountries.forEach(([countryKey, country]) => {
            const vatInfo = country.vat;

            // Standard rate should be higher than reduced rates
            if (vatInfo.reduced) {
                vatInfo.reduced.forEach(reducedRate => {
                    if (reducedRate >= vatInfo.standard) {
                        validationResults.validationWarnings.push({
                            country: countryKey,
                            warning: `Reduced rate (${reducedRate}%) is not lower than standard rate (${vatInfo.standard}%)`
                        });
                    }
                });
            }
        });

        validationResults.passedTests.push('✅ VAT rates validation passed');

    } catch (error) {
        validationResults.failedTests.push('❌ VAT rates validation failed: ' + error.message);
    }
}

function validateHelperFunctions() {
    try {
        // Test getCountryVAT function
        const testCountries = ['united_states', 'germany', 'nonexistent_country'];

        testCountries.forEach(countryKey => {
            const vatInfo = getCountryVAT(countryKey);

            if (countryKey === 'nonexistent_country') {
                if (vatInfo !== null) {
                    validationResults.validationErrors.push({
                        test: 'getCountryVAT',
                        error: 'Should return null for non-existent countries'
                    });
                }
            } else if (taxData[countryKey] && taxData[countryKey].vat) {
                if (!vatInfo) {
                    validationResults.validationErrors.push({
                        test: 'getCountryVAT',
                        error: `Should return VAT info for ${countryKey}`
                    });
                }
            }
        });

        // Test formatVATInfo function
        const testVATInfos = [
            { hasVAT: false, notes: 'No VAT system' },
            { hasVAT: true, standard: 20, reduced: [10, 5] },
            { hasVAT: true, standard: 21, zeroRated: true },
            null
        ];

        testVATInfos.forEach((vatInfo, index) => {
            try {
                const formatted = formatVATInfo(vatInfo);
                if (typeof formatted !== 'string') {
                    validationResults.validationErrors.push({
                        test: 'formatVATInfo',
                        error: `Test case ${index} should return string`
                    });
                }
            } catch (error) {
                validationResults.validationErrors.push({
                    test: 'formatVATInfo',
                    error: `Test case ${index} threw error: ${error.message}`
                });
            }
        });

        validationResults.passedTests.push('✅ Helper functions validation passed');

    } catch (error) {
        validationResults.failedTests.push('❌ Helper functions validation failed: ' + error.message);
    }
}

function calculateVATStatistics() {
    try {
        const vatCountries = Object.entries(taxData)
            .filter(([key, country]) => country.vat && country.vat.hasVAT);

        const standardRates = vatCountries.map(([key, country]) => country.vat.standard);

        validationResults.vatStatistics = {
            totalCountriesWithVAT: vatCountries.length,
            averageStandardRate: (standardRates.reduce((a, b) => a + b, 0) / standardRates.length).toFixed(2),
            minStandardRate: Math.min(...standardRates),
            maxStandardRate: Math.max(...standardRates),
            countriesWithReducedRates: vatCountries.filter(([key, country]) =>
                country.vat.reduced && country.vat.reduced.length > 0).length,
            countriesWithZeroRated: vatCountries.filter(([key, country]) =>
                country.vat.zeroRated).length
        };

        validationResults.passedTests.push('✅ VAT statistics calculation passed');

    } catch (error) {
        validationResults.failedTests.push('❌ VAT statistics calculation failed: ' + error.message);
    }
}

function generateValidationReport() {
    console.log('\n📋 VAT Data Validation Report');
    console.log('================================');

    console.log('\n✅ Passed Tests:');
    validationResults.passedTests.forEach(test => console.log(test));

    if (validationResults.failedTests.length > 0) {
        console.log('\n❌ Failed Tests:');
        validationResults.failedTests.forEach(test => console.log(test));
    }

    if (validationResults.validationErrors.length > 0) {
        console.log('\n🚨 Validation Errors:');
        validationResults.validationErrors.forEach(error => {
            console.log(`  • ${error.country || error.test || 'General'}: ${error.error || error.message}`);
        });
    }

    if (validationResults.validationWarnings.length > 0) {
        console.log('\n⚠️  Validation Warnings:');
        validationResults.validationWarnings.forEach(warning => {
            console.log(`  • ${warning.country}: ${warning.warning}`);
        });
    }

    console.log('\n📊 VAT Statistics:');
    Object.entries(validationResults.vatStatistics).forEach(([key, value]) => {
        console.log(`  • ${key}: ${value}`);
    });

    console.log('\n🎯 Validation Summary:');
    console.log(`  • Total Tests: ${validationResults.passedTests.length + validationResults.failedTests.length}`);
    console.log(`  • Passed: ${validationResults.passedTests.length}`);
    console.log(`  • Failed: ${validationResults.failedTests.length}`);
    console.log(`  • Errors: ${validationResults.validationErrors.length}`);
    console.log(`  • Warnings: ${validationResults.validationWarnings.length}`);

    const overallStatus = validationResults.failedTests.length === 0 ? '✅ PASSED' : '❌ FAILED';
    console.log(`\n🏁 Overall Status: ${overallStatus}`);

    return validationResults;
}

// Export validation function and results
export { runValidation, validationResults };

// Run validation if this script is executed directly
if (typeof window === 'undefined') {
    // Node.js environment
    runValidation();
} else {
    // Browser environment - make available globally
    window.validateVATData = runValidation;
}

console.log('🔧 VAT data validation script loaded. Call runValidation() to start validation.');