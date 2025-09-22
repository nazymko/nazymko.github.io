// Currency exchange service using a free API
class CurrencyService {
    constructor() {
        this.exchangeRates = {};
        this.baseCurrency = 'USD';
        this.lastUpdated = null;
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
        this.fallbackRates = {
            // Fallback rates in case API is unavailable
            'USD': 1,
            'EUR': 0.85,
            'GBP': 0.73,
            'JPY': 110,
            'CAD': 1.25,
            'AUD': 1.35,
            'CHF': 0.92,
            'CNY': 6.45,
            'SEK': 8.5,
            'NOK': 8.8,
            'DKK': 6.3,
            'PLN': 3.9,
            'CZK': 21.5,
            'HUF': 295,
            'RUB': 75,
            'INR': 74,
            'KRW': 1180,
            'SGD': 1.35,
            'THB': 31,
            'IDR': 14200,
            'MYR': 4.1,
            'PHP': 49,
            'VND': 23000,
            'BRL': 5.2,
            'MXN': 20,
            'ARS': 98,
            'COP': 3600,
            'CLP': 710,
            'PEN': 3.6,
            'ZAR': 14.5,
            'EGP': 15.7,
            'NGN': 411,
            'KES': 108,
            'GHS': 5.8,
            'MAD': 8.9,
            'TND': 2.7,
            'SAR': 3.75,
            'AED': 3.67,
            'QAR': 3.64,
            'KWD': 0.30,
            'BHD': 0.38,
            'OMR': 0.38,
            'JOD': 0.71,
            'LBP': 1507,
            'ILS': 3.2,
            'TRY': 8.5
        };
    }

    async fetchExchangeRates() {
        try {
            console.log('Fetching exchange rates...');
            const response = await fetch(this.apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.exchangeRates = data.rates;
            this.exchangeRates['USD'] = 1; // Ensure USD is 1
            this.lastUpdated = new Date();

            console.log('Exchange rates updated successfully');
            return true;
        } catch (error) {
            console.warn('Failed to fetch exchange rates, using fallback rates:', error.message);
            this.exchangeRates = { ...this.fallbackRates };
            this.lastUpdated = new Date();
            return false;
        }
    }

    async getExchangeRate(fromCurrency, toCurrency = 'USD') {
        // Initialize rates if not loaded
        if (Object.keys(this.exchangeRates).length === 0) {
            await this.fetchExchangeRates();
        }

        const fromRate = this.exchangeRates[fromCurrency];
        const toRate = this.exchangeRates[toCurrency];

        if (!fromRate || !toRate) {
            console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}, using 1`);
            return 1;
        }

        // Convert to USD first, then to target currency
        return toRate / fromRate;
    }

    async convertCurrency(amount, fromCurrency, toCurrency = 'USD') {
        const rate = await this.getExchangeRate(fromCurrency, toCurrency);
        return amount * rate;
    }

    async convertToUSD(amount, fromCurrency) {
        return this.convertCurrency(amount, fromCurrency, 'USD');
    }

    async convertFromUSD(amountUSD, toCurrency) {
        return this.convertCurrency(amountUSD, 'USD', toCurrency);
    }

    isRatesLoaded() {
        return Object.keys(this.exchangeRates).length > 0;
    }

    getLastUpdated() {
        return this.lastUpdated;
    }

    // Get all available currencies
    getAvailableCurrencies() {
        return Object.keys(this.exchangeRates);
    }
}

// Create a singleton instance
export const currencyService = new CurrencyService();