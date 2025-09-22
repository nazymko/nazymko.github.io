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
                this.inputCurrency,\n                this.displayCurrency\n            );\n\n            this.emit('calculationComplete', {\n                results,\n                displayCurrency: this.displayCurrency,\n                inputCurrency: this.inputCurrency,\n                salary: this.salary\n            });\n\n        } catch (error) {\n            console.error('Calculation error:', error);\n            this.emit('calculationError', { error });\n        } finally {\n            this.hideLoading();\n        }\n    }\n\n    // Update currency displays throughout the page\n    updateCurrencyDisplays() {\n        document.querySelectorAll('.currency-display').forEach(element => {\n            element.textContent = this.displayCurrency;\n        });\n    }\n\n    // Show loading state\n    showLoading() {\n        if (this.elements.loadingInfo) {\n            this.elements.loadingInfo.style.display = 'block';\n        }\n    }\n\n    // Hide loading state\n    hideLoading() {\n        if (this.elements.loadingInfo) {\n            this.elements.loadingInfo.style.display = 'none';\n        }\n    }\n\n    // Set salary value programmatically\n    setSalary(amount) {\n        this.salary = amount;\n        if (this.elements.salary) {\n            this.elements.salary.value = amount;\n        }\n        this.triggerCalculation();\n    }\n\n    // Set input currency programmatically\n    setInputCurrency(currency) {\n        this.inputCurrency = currency;\n        if (this.elements.inputCurrency) {\n            this.elements.inputCurrency.value = currency;\n        }\n        this.triggerCalculation();\n    }\n\n    // Set display currency programmatically\n    setDisplayCurrency(currency) {\n        this.displayCurrency = currency;\n        if (this.elements.displayCurrency) {\n            this.elements.displayCurrency.value = currency;\n        }\n        this.updateCurrencyDisplays();\n        this.triggerCalculation();\n    }\n\n    // Get current calculator state\n    getState() {\n        return {\n            salary: this.salary,\n            inputCurrency: this.inputCurrency,\n            displayCurrency: this.displayCurrency\n        };\n    }\n\n    // Event emitter functionality\n    on(event, callback) {\n        if (!this.listeners.has(event)) {\n            this.listeners.set(event, []);\n        }\n        this.listeners.get(event).push(callback);\n    }\n\n    off(event, callback) {\n        if (!this.listeners.has(event)) return;\n        \n        const callbacks = this.listeners.get(event);\n        const index = callbacks.indexOf(callback);\n        if (index > -1) {\n            callbacks.splice(index, 1);\n        }\n    }\n\n    emit(event, data) {\n        if (!this.listeners.has(event)) return;\n        \n        this.listeners.get(event).forEach(callback => {\n            try {\n                callback(data);\n            } catch (error) {\n                console.error(`Error in ${event} listener:`, error);\n            }\n        });\n    }\n\n    // Perform initial calculation if salary is set\n    async performInitialCalculation() {\n        // Load exchange rates first\n        await currencyService.fetchExchangeRates();\n        \n        if (this.salary > 0) {\n            await this.triggerCalculation();\n        }\n    }\n\n    // Destroy the component\n    destroy() {\n        clearTimeout(this.debounceTimer);\n        this.listeners.clear();\n    }\n}