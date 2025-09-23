import { taxData, getCountryVAT } from './taxData.js';
import { currencyService } from './currencyService.js';

// Calculate progressive tax
export function calculateProgressiveTax(annualIncome, brackets) {
    let totalTax = 0;
    let remainingIncome = annualIncome;

    for (let bracket of brackets) {
        if (remainingIncome <= 0) break;

        const bracketMin = bracket.min;
        const bracketMax = bracket.max || Infinity;
        const bracketSize = bracketMax - bracketMin;
        const taxableInThisBracket = Math.min(remainingIncome, bracketSize);

        if (annualIncome > bracketMin) {
            const effectiveTaxableAmount = Math.min(taxableInThisBracket, annualIncome - bracketMin);
            totalTax += effectiveTaxableAmount * (bracket.rate / 100);
        }

        remainingIncome -= taxableInThisBracket;
    }

    return totalTax;
}

// Calculate VAT on spending (net income)
export function calculateVAT(netIncome, countryKey) {
    const vatInfo = getCountryVAT(countryKey);

    if (!vatInfo || !vatInfo.hasVAT) {
        return {
            vatAmount: 0,
            vatRate: 0,
            hasVAT: false
        };
    }

    // Assume standard VAT rate applies to most spending
    const vatRate = vatInfo.standard;
    // VAT is calculated on spending, which we assume to be the net income
    // VAT = (net income * VAT rate) / (100 + VAT rate) - this is the VAT component of spending
    const vatAmount = (netIncome * vatRate) / (100 + vatRate);

    return {
        vatAmount,
        vatRate,
        hasVAT: true,
        vatInfo
    };
}

// Calculate special taxes (military levy, social taxes, etc.)
export function calculateSpecialTaxes(grossIncome, specialTaxes) {
    if (!specialTaxes || !Array.isArray(specialTaxes)) {
        return {
            specialTaxAmount: 0,
            specialTaxes: []
        };
    }

    let totalSpecialTax = 0;
    const specialTaxBreakdown = [];

    for (const tax of specialTaxes) {
        let taxBase = 0;

        // Determine tax base based on target
        switch (tax.target) {
            case 'gross':
                taxBase = grossIncome;
                break;
            case 'net':
                // For now, use gross income - could be enhanced to use actual net income
                taxBase = grossIncome;
                break;
            default:
                taxBase = grossIncome;
        }

        const taxAmount = taxBase * (tax.rate / 100);
        totalSpecialTax += taxAmount;

        specialTaxBreakdown.push({
            type: tax.type,
            rate: tax.rate,
            target: tax.target,
            description: tax.description,
            taxBase: taxBase,
            taxAmount: taxAmount
        });
    }

    return {
        specialTaxAmount: totalSpecialTax,
        specialTaxes: specialTaxBreakdown
    };
}

// Single country calculation function
export function calculateTax(salary, countryKey) {
    if (!salary || !countryKey) {
        throw new Error('Salary and country are required');
    }

    const countryData = taxData[countryKey];
    if (!countryData) {
        throw new Error('Country data not found');
    }

    const annualIncome = salary * 12;
    let incomeTax = 0;

    if (countryData.system === 'zero_personal') {
        incomeTax = 0;
    } else if (countryData.system === 'flat') {
        const rate = countryData.brackets[0].rate;
        incomeTax = annualIncome * (rate / 100);
    } else {
        incomeTax = calculateProgressiveTax(annualIncome, countryData.brackets);
    }

    // Calculate special taxes (military levy, social taxes, etc.)
    const specialTaxCalculation = calculateSpecialTaxes(annualIncome, countryData.special_taxes);

    const netIncomeAfterIncomeTax = annualIncome - incomeTax - specialTaxCalculation.specialTaxAmount;

    // Calculate VAT on spending (net income after all taxes except VAT)
    const vatCalculation = calculateVAT(netIncomeAfterIncomeTax, countryKey);

    // Total tax burden = income tax + special taxes + VAT
    const totalTax = incomeTax + specialTaxCalculation.specialTaxAmount + vatCalculation.vatAmount;
    const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;
    const netIncomeAfterAllTaxes = annualIncome - totalTax;

    return {
        countryKey,
        grossIncome: annualIncome,
        incomeTax,
        specialTaxAmount: specialTaxCalculation.specialTaxAmount,
        specialTaxes: specialTaxCalculation.specialTaxes,
        vatAmount: vatCalculation.vatAmount,
        vatRate: vatCalculation.vatRate,
        hasVAT: vatCalculation.hasVAT,
        taxAmount: totalTax, // Combined income tax + special taxes + VAT
        effectiveRate: effectiveRate,
        netIncome: netIncomeAfterAllTaxes,
        netIncomeAfterIncomeTax: netIncomeAfterIncomeTax,
        currency: countryData.currency,
        countryName: countryData.name,
        coordinates: countryData.coordinates
    };
}

// Calculate taxes for ALL countries with currency conversion
export async function calculateTaxesForAllCountries(monthlyAmount, inputCurrency = 'USD', displayCurrency = 'USD') {
    if (!monthlyAmount || monthlyAmount <= 0) {
        return [];
    }

    const results = [];

    // Ensure exchange rates are loaded
    if (!currencyService.isRatesLoaded()) {
        await currencyService.fetchExchangeRates();
    }

    for (const [countryKey, countryData] of Object.entries(taxData)) {
        try {
            // Convert input amount to country's local currency
            const localMonthlyAmount = await currencyService.convertCurrency(
                monthlyAmount,
                inputCurrency,
                countryData.currency
            );

            // Calculate tax in local currency
            const result = calculateTax(localMonthlyAmount, countryKey);

            // Convert tax amounts to display currency for comparison
            const taxAmountInDisplayCurrency = await currencyService.convertCurrency(
                result.taxAmount,
                countryData.currency,
                displayCurrency
            );

            const incomeTaxInDisplayCurrency = await currencyService.convertCurrency(
                result.incomeTax,
                countryData.currency,
                displayCurrency
            );

            const vatAmountInDisplayCurrency = await currencyService.convertCurrency(
                result.vatAmount,
                countryData.currency,
                displayCurrency
            );

            const specialTaxAmountInDisplayCurrency = await currencyService.convertCurrency(
                result.specialTaxAmount,
                countryData.currency,
                displayCurrency
            );

            const grossIncomeInDisplayCurrency = await currencyService.convertCurrency(
                result.grossIncome,
                countryData.currency,
                displayCurrency
            );

            const netIncomeInDisplayCurrency = await currencyService.convertCurrency(
                result.netIncome,
                countryData.currency,
                displayCurrency
            );

            // Convert individual special tax amounts to display currency
            const specialTaxesInDisplayCurrency = await Promise.all(
                result.specialTaxes.map(async (tax) => ({
                    ...tax,
                    taxAmountInDisplayCurrency: await currencyService.convertCurrency(
                        tax.taxAmount,
                        countryData.currency,
                        displayCurrency
                    )
                }))
            );

            results.push({
                ...result,
                taxAmountInDisplayCurrency,
                incomeTaxInDisplayCurrency,
                vatAmountInDisplayCurrency,
                specialTaxAmountInDisplayCurrency,
                specialTaxesInDisplayCurrency,
                grossIncomeInDisplayCurrency,
                netIncomeInDisplayCurrency,
                displayCurrency,
                localMonthlyAmount,
                inputCurrency,
                exchangeRate: await currencyService.getExchangeRate(inputCurrency, countryData.currency)
            });

        } catch (error) {
            console.error(`Error calculating tax for ${countryKey}:`, error);
            // Still add the country with zero values rather than skipping
            results.push({
                countryKey,
                countryName: countryData.name,
                currency: countryData.currency,
                coordinates: countryData.coordinates,
                grossIncome: 0,
                incomeTax: 0,
                specialTaxAmount: 0,
                specialTaxes: [],
                vatAmount: 0,
                vatRate: 0,
                hasVAT: false,
                taxAmount: 0,
                effectiveRate: 0,
                netIncome: 0,
                taxAmountInDisplayCurrency: 0,
                incomeTaxInDisplayCurrency: 0,
                vatAmountInDisplayCurrency: 0,
                specialTaxAmountInDisplayCurrency: 0,
                specialTaxesInDisplayCurrency: [],
                grossIncomeInDisplayCurrency: 0,
                netIncomeInDisplayCurrency: 0,
                displayCurrency,
                localMonthlyAmount: 0,
                inputCurrency,
                exchangeRate: 1,
                error: error.message
            });
        }
    }

    // Sort by tax amount in display currency (highest first)
    results.sort((a, b) => b.taxAmountInDisplayCurrency - a.taxAmountInDisplayCurrency);

    return results;
}

// Get top tax rate for a country
export function getTopTaxRate(countryKey) {
    const countryData = taxData[countryKey];
    if (!countryData) return 0;

    return countryData.brackets[countryData.brackets.length - 1].rate;
}

// Get color for tax amount visualization
export function getTaxAmountColor(taxAmountUSD, maxTaxAmountUSD) {
    if (maxTaxAmountUSD === 0) return '#45b7d1';

    const ratio = taxAmountUSD / maxTaxAmountUSD;

    if (ratio === 0) return '#45b7d1'; // Tax haven
    if (ratio <= 0.2) return '#4ecdc4'; // Low
    if (ratio <= 0.4) return '#95e1d3'; // Medium-low
    if (ratio <= 0.6) return '#ff8e53'; // Medium
    if (ratio <= 0.8) return '#ff6b6b'; // High
    return '#cc2a41'; // Highest
}