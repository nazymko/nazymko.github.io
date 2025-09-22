// Main Application Class - Coordinates all components
import { MapComponent } from './MapComponent.js';
import { CalculatorComponent } from './CalculatorComponent.js';
import { ResultsTableComponent } from './ResultsTableComponent.js';

export class Application {
    constructor() {
        this.components = {};
        this.isInitialized = false;

        this.init();
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

        console.log('📦 Application components created');
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
    handleCalculationError(data) {\n        const { error } = data;\n        console.error('❌ Calculation error:', error);\n        \n        // Show user-friendly error message\n        this.showErrorMessage('Error during calculation: ' + error.message);\n    }\n\n    // Handle country selection from results table\n    handleCountrySelected(data) {\n        const { result } = data;\n        \n        // Highlight country on map\n        this.components.map.highlightCountry(result.countryKey);\n        \n        console.log(`🎯 Country selected: ${result.countryName}`);\n    }\n\n    // Show error message to user\n    showErrorMessage(message) {\n        // You can customize this to use a modal, toast, or other UI element\n        alert(message);\n    }\n\n    // Get application state\n    getState() {\n        return {\n            isInitialized: this.isInitialized,\n            calculator: this.components.calculator?.getState(),\n            mapResults: this.components.map?.getCurrentResults(),\n            tableResults: this.components.resultsTable?.getCurrentResults()\n        };\n    }\n\n    // Set calculator values programmatically\n    setSalary(amount) {\n        if (this.components.calculator) {\n            this.components.calculator.setSalary(amount);\n        }\n    }\n\n    setInputCurrency(currency) {\n        if (this.components.calculator) {\n            this.components.calculator.setInputCurrency(currency);\n        }\n    }\n\n    setDisplayCurrency(currency) {\n        if (this.components.calculator) {\n            this.components.calculator.setDisplayCurrency(currency);\n        }\n    }\n\n    // Highlight specific country\n    highlightCountry(countryKey) {\n        if (this.components.map) {\n            this.components.map.highlightCountry(countryKey);\n        }\n    }\n\n    // Export current results\n    exportResults() {\n        if (this.components.resultsTable) {\n            this.components.resultsTable.exportToCSV();\n        }\n    }\n\n    // Recalculate with current settings\n    async recalculate() {\n        if (this.components.calculator) {\n            await this.components.calculator.triggerCalculation();\n        }\n    }\n\n    // Get component references (for advanced usage)\n    getComponent(name) {\n        return this.components[name];\n    }\n\n    // Destroy the application\n    destroy() {\n        // Destroy all components\n        Object.values(this.components).forEach(component => {\n            if (component.destroy) {\n                component.destroy();\n            }\n        });\n\n        // Clear global functions\n        if (window.sortTable) delete window.sortTable;\n        if (window.exportResults) delete window.exportResults;\n\n        this.components = {};\n        this.isInitialized = false;\n\n        console.log('🗑️ Application destroyed');\n    }\n\n    // Static method to create and initialize application\n    static async create() {\n        const app = new Application();\n        \n        // Wait for initialization to complete\n        while (!app.isInitialized) {\n            await new Promise(resolve => setTimeout(resolve, 10));\n        }\n        \n        return app;\n    }\n}