// Main Application Class - Coordinates all components
import { MapComponent } from './MapComponent.js';
import { CalculatorComponent } from './CalculatorComponent.js';
import { ResultsTableComponent } from './ResultsTableComponent.js';
import { SearchableCurrencyDropdown } from '../currencyDropdown.js';

export class Application {
    constructor() {
        this.components = {};
        this.currencyDropdowns = {};
        this.isInitialized = false;
    }

    // Initialize the application
    async init() {
        try {
            this.createComponents();
            this.setupComponentInteractions();
            await this.performInitialSetup();
            this.isInitialized = true;

            console.log('🌍 Global Tax Calculator Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
        }
    }

    // Create all application components
    createComponents() {
        this.components.map = new MapComponent('worldMap');
        this.components.calculator = new CalculatorComponent();
        this.components.resultsTable = new ResultsTableComponent('resultsTableContainer');

        // Initialize searchable currency dropdowns
        this.initializeCurrencyDropdowns();

        console.log('📦 Application components created');
    }

    // Initialize searchable currency dropdowns
    initializeCurrencyDropdowns() {
        // Get all currency select elements
        const currencySelects = {
            inputCurrency: document.getElementById('inputCurrency'),
            displayCurrency: document.getElementById('displayCurrency'),
            fullscreenInputCurrency: document.getElementById('fullscreenInputCurrency'),
            fullscreenDisplayCurrency: document.getElementById('fullscreenDisplayCurrency')
        };

        // Initialize searchable dropdowns for each select element
        Object.entries(currencySelects).forEach(([key, selectElement]) => {
            if (selectElement) {
                this.currencyDropdowns[key] = new SearchableCurrencyDropdown(selectElement);
                console.log(`💱 Initialized searchable dropdown for ${key}`);
            }
        });
    }

    // Setup interactions between components
    setupComponentInteractions() {
        // Calculator events
        this.components.calculator.on('calculationComplete', (data) => {
            this.handleCalculationComplete(data);
        });

        this.components.calculator.on('calculationCleared', () => {
            this.handleCalculationCleared();
        });

        this.components.calculator.on('calculationError', (data) => {
            this.handleCalculationError(data);
        });

        // Results table events
        this.components.resultsTable.on('rowSelected', (data) => {
            this.handleCountrySelected(data);
        });

        // Make sort function globally available for HTML onclick handlers
        window.sortTable = (column) => {
            this.components.resultsTable.sortByColumn(column);
        };

        // Make export function globally available
        window.exportResults = () => {
            this.components.resultsTable.exportToCSV();
        };

        console.log('🔗 Component interactions setup complete');
    }

    // Perform initial application setup
    async performInitialSetup() {
        // Load initial data and perform calculation if needed
        await this.components.calculator.performInitialCalculation();
        console.log('⚡ Initial setup complete');
    }

    // Handle successful tax calculation
    handleCalculationComplete(data) {
        const { results, displayCurrency } = data;

        // Update map with results
        this.components.map.updateWithTaxResults(results, displayCurrency);

        // Update results table
        this.components.resultsTable.updateResults(results, displayCurrency);

        console.log(`📊 Calculation completed for ${results.length} countries`);
    }

    // Handle calculation cleared
    handleCalculationCleared() {
        this.components.map.resetToDefault();
        this.components.resultsTable.clear();
        console.log('🧹 Calculation results cleared');
    }

    // Handle calculation error
    handleCalculationError(data) {
        const { error } = data;
        console.error('❌ Calculation error:', error);

        // Show user-friendly error message
        this.showErrorMessage('Error during calculation: ' + error.message);
    }

    // Handle country selection from results table
    handleCountrySelected(data) {
        const { result } = data;

        // Highlight country on map
        this.components.map.highlightCountry(result.countryKey);

        console.log(`🎯 Country selected: ${result.countryName}`);
    }

    // Show error message to user
    showErrorMessage(message) {
        // You can customize this to use a modal, toast, or other UI element
        alert(message);
    }

    // Get application state
    getState() {
        return {
            isInitialized: this.isInitialized,
            calculator: this.components.calculator?.getState(),
            mapResults: this.components.map?.getCurrentResults(),
            tableResults: this.components.resultsTable?.getCurrentResults()
        };
    }

    // Set calculator values programmatically
    setSalary(amount) {
        if (this.components.calculator) {
            this.components.calculator.setSalary(amount);
        }
    }

    setInputCurrency(currency) {
        if (this.components.calculator) {
            this.components.calculator.setInputCurrency(currency);
        }
    }

    setDisplayCurrency(currency) {
        if (this.components.calculator) {
            this.components.calculator.setDisplayCurrency(currency);
        }
    }

    // Highlight specific country
    highlightCountry(countryKey) {
        if (this.components.map) {
            this.components.map.highlightCountry(countryKey);
        }
    }

    // Export current results
    exportResults() {
        if (this.components.resultsTable) {
            this.components.resultsTable.exportToCSV();
        }
    }

    // Recalculate with current settings
    async recalculate() {
        if (this.components.calculator) {
            await this.components.calculator.triggerCalculation();
        }
    }

    // Get component references (for advanced usage)
    getComponent(name) {
        return this.components[name];
    }

    // Destroy the application
    destroy() {
        // Destroy all components
        Object.values(this.components).forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });

        // Cleanup currency dropdowns
        Object.values(this.currencyDropdowns).forEach(dropdown => {
            if (dropdown.destroy) {
                dropdown.destroy();
            }
        });

        // Clear global functions
        if (window.sortTable) delete window.sortTable;
        if (window.exportResults) delete window.exportResults;

        this.components = {};
        this.currencyDropdowns = {};
        this.isInitialized = false;

        console.log('🗑️ Application destroyed');
    }

    // Static method to create and initialize application
    static async create() {
        const app = new Application();
        await app.init();
        return app;
    }
}