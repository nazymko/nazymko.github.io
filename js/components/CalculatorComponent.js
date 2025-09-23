// Calculator Component - Handles tax calculations and input management
import { calculateTaxesForAllCountries } from '../taxCalculator.js';
import { currencyService } from '../currencyService.js';

export class CalculatorComponent {
    constructor() {
        this.salary = 0;
        this.inputCurrency = 'USD';
        this.displayCurrency = 'USD';
        this.debounceTimer = null;
        this.listeners = new Map();

        this.init();
    }

    // Initialize the calculator component
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadInitialValues();
    }

    // Setup DOM element references
    setupElements() {
        this.elements = {
            salary: document.getElementById('salary'),
            inputCurrency: document.getElementById('inputCurrency'),
            displayCurrency: document.getElementById('displayCurrency'),
            loadingInfo: document.getElementById('loadingInfo')
        };

    }

    // Setup event listeners
    setupEventListeners() {
        // Salary input with debouncing
        if (this.elements.salary) {
            this.elements.salary.addEventListener('input', () => {
                this.handleSalaryChange();
            });
        }

        // Currency selectors
        if (this.elements.inputCurrency) {
            this.elements.inputCurrency.addEventListener('change', () => {
                this.handleInputCurrencyChange();
            });
        }

        if (this.elements.displayCurrency) {
            this.elements.displayCurrency.addEventListener('change', () => {
                this.handleDisplayCurrencyChange();
            });
        }
    }

    // Load initial values from form
    loadInitialValues() {
        if (this.elements.salary) {
            this.salary = parseFloat(this.elements.salary.value) || 0;
        }

        if (this.elements.inputCurrency) {
            this.inputCurrency = this.elements.inputCurrency.value;
        }

        if (this.elements.displayCurrency) {
            this.displayCurrency = this.elements.displayCurrency.value;
        }
    }

    // Handle salary input changes with debouncing
    handleSalaryChange() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.salary = parseFloat(this.elements.salary.value) || 0;
            this.triggerCalculation();
        }, 500);
    }

    // Handle input currency changes
    handleInputCurrencyChange() {
        this.inputCurrency = this.elements.inputCurrency.value;
        this.triggerCalculation();
    }

    // Handle display currency changes
    handleDisplayCurrencyChange() {
        this.displayCurrency = this.elements.displayCurrency.value;
        this.triggerCalculation();
        this.updateCurrencyDisplays();
    }

    // Trigger tax calculation
    async triggerCalculation() {
        if (this.salary <= 0) {
            this.emit('calculationCleared');
            return;
        }

        this.showLoading();

        try {
            const results = await calculateTaxesForAllCountries(
                this.salary,
                this.inputCurrency,
                this.displayCurrency
            );

            this.emit('calculationComplete', {
                results,
                displayCurrency: this.displayCurrency,
                inputCurrency: this.inputCurrency,
                salary: this.salary
            });

        } catch (error) {
            console.error('Calculation error:', error);
            this.emit('calculationError', { error });
        } finally {
            this.hideLoading();
        }
    }

    // Update currency displays throughout the page
    updateCurrencyDisplays() {
        document.querySelectorAll('.currency-display').forEach(element => {
            element.textContent = this.displayCurrency;
        });
    }

    // Show loading state
    showLoading() {
        if (this.elements.loadingInfo) {
            this.elements.loadingInfo.style.display = 'block';
        }
    }

    // Hide loading state
    hideLoading() {
        if (this.elements.loadingInfo) {
            this.elements.loadingInfo.style.display = 'none';
        }
    }

    // Set salary value programmatically
    setSalary(amount) {
        this.salary = amount;
        if (this.elements.salary) {
            this.elements.salary.value = amount;
        }
        this.triggerCalculation();
    }

    // Set input currency programmatically
    setInputCurrency(currency) {
        this.inputCurrency = currency;
        if (this.elements.inputCurrency) {
            this.elements.inputCurrency.value = currency;
        }
        this.triggerCalculation();
    }

    // Set display currency programmatically
    setDisplayCurrency(currency) {
        this.displayCurrency = currency;
        if (this.elements.displayCurrency) {
            this.elements.displayCurrency.value = currency;
        }
        this.updateCurrencyDisplays();
        this.triggerCalculation();
    }

    // Get current calculator state
    getState() {
        return {
            salary: this.salary,
            inputCurrency: this.inputCurrency,
            displayCurrency: this.displayCurrency
        };
    }

    // Event emitter functionality
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;

        this.listeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} listener:`, error);
            }
        });
    }

    // Perform initial calculation if salary is set
    async performInitialCalculation() {
        // Load exchange rates first
        await currencyService.fetchExchangeRates();

        // Reload values from form to ensure we have the latest data
        this.loadInitialValues();

        if (this.salary > 0) {
            await this.triggerCalculation();
        }
    }

    // Handle language change
    handleLanguageChange() {
        // Re-trigger calculation if there are current results to update display with new language
        if (this.lastCalculationResults) {
            this.triggerCalculation();
        }
        console.log('💰 Calculator component language updated');
    }

    // Destroy the component
    destroy() {
        clearTimeout(this.debounceTimer);
        this.listeners.clear();
    }
}