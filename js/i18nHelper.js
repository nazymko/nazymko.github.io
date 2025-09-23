// i18n Helper Functions for Updating UI Elements
import { i18n } from './translations.js';

export class I18nHelper {
    constructor() {
        this.init();
    }

    init() {
        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            this.updateAllTranslations();
        });
    }

    // Update all translatable elements in the DOM
    updateAllTranslations() {
        this.updateStaticTexts();
        this.updatePlaceholders();
        this.updateTitles();
        this.updateAriaLabels();
        this.updateCurrencyDisplays();
    }

    // Update elements with data-i18n attribute
    updateStaticTexts() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = element.getAttribute('data-i18n-params');
            const parsedParams = params ? JSON.parse(params) : {};
            element.textContent = i18n.t(key, parsedParams);
        });
    }

    // Update placeholders
    updatePlaceholders() {
        const elements = document.querySelectorAll('[data-i18n-placeholder]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = i18n.t(key);
        });
    }

    // Update title attributes
    updateTitles() {
        const elements = document.querySelectorAll('[data-i18n-title]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = i18n.t(key);
        });
    }

    // Update aria-label attributes
    updateAriaLabels() {
        const elements = document.querySelectorAll('[data-i18n-aria]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            element.setAttribute('aria-label', i18n.t(key));
        });
    }

    // Update currency display elements
    updateCurrencyDisplays() {
        const elements = document.querySelectorAll('.currency-display');
        elements.forEach(element => {
            // This will be updated by individual components with current currency
            const currency = element.textContent || 'USD';
            element.setAttribute('data-currency', currency);
        });
    }

    // Helper to translate table headers
    updateTableHeaders() {
        const headerMappings = {
            'Country': 'country',
            'System': 'system',
            'Total Tax': 'totalTax',
            'Income Tax': 'incomeTax',
            'VAT': 'vatTax',
            'Effective Rate': 'effectiveRate',
            'Net Income': 'netIncome'
        };

        Object.entries(headerMappings).forEach(([englishText, key]) => {
            const elements = document.querySelectorAll('th, .table-header');
            elements.forEach(element => {
                if (element.textContent.trim() === englishText) {
                    element.textContent = i18n.t(key);
                }
            });
        });
    }

    // Helper to translate tax system names
    translateTaxSystem(system) {
        const systemMappings = {
            'progressive': 'progressive',
            'flat': 'flat',
            'zero_personal': 'zeroPersonal'
        };
        return i18n.t(systemMappings[system] || system);
    }

    // Helper to translate country status
    translateCountryStatus(status) {
        const statusMappings = {
            'Calculated': 'calculated',
            'Ready': 'ready',
            'Tax Haven': 'taxHaven',
            'No Personal Income Tax': 'noPersonalIncomeTax'
        };
        return i18n.t(statusMappings[status] || status);
    }

    // Format number with localized separators
    formatNumber(number, currency = null) {
        const locale = this.getLocaleFromLanguage(i18n.getCurrentLanguage());

        if (currency) {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(number);
        } else {
            return new Intl.NumberFormat(locale).format(number);
        }
    }

    // Get locale string from language code
    getLocaleFromLanguage(langCode) {
        const localeMap = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'uk': 'uk-UA'
        };
        return localeMap[langCode] || 'en-US';
    }

    // Format percentage
    formatPercentage(number) {
        const locale = this.getLocaleFromLanguage(i18n.getCurrentLanguage());
        return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(number / 100);
    }

    // Update specific component text
    updateComponentText(componentSelector, textMappings) {
        const component = document.querySelector(componentSelector);
        if (!component) return;

        Object.entries(textMappings).forEach(([selector, translationKey]) => {
            const element = component.querySelector(selector);
            if (element) {
                element.textContent = i18n.t(translationKey);
            }
        });
    }

    // Helper for dynamic content updates
    setTranslatedContent(element, translationKey, params = {}) {
        if (element) {
            element.textContent = i18n.t(translationKey, params);
        }
    }

    // Helper for HTML content with translations
    setTranslatedHTML(element, translationKey, params = {}) {
        if (element) {
            element.innerHTML = i18n.t(translationKey, params);
        }
    }
}

// Create global helper instance
export const i18nHelper = new I18nHelper();