import { currencyService } from './currencyService.js';
import { initializeMap, calculateAndUpdateMap } from './mapController.js';
import { initializeResultsTable, sortByColumn, exportToCSV } from './resultsTable.js';

let debounceTimer;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    showLoadingInfo();

    // Initialize components
    initializeMap();
    initializeResultsTable();
    setupEventListeners();

    // Load exchange rates on startup
    await currencyService.fetchExchangeRates();

    hideLoadingInfo();

    // Auto-calculate with default values if present
    const salary = document.getElementById('salary').value;
    if (salary) {
        handleCalculation();
    }
});

// Setup event listeners
function setupEventListeners() {
    // Salary input change with debouncing
    document.getElementById('salary').addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleCalculation();
        }, 500); // 500ms delay
    });

    // Currency selectors
    document.getElementById('inputCurrency').addEventListener('change', handleCalculation);
    document.getElementById('displayCurrency').addEventListener('change', handleCalculation);

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    // Search functionality is handled in resultsTable.js
}

// Handle calculation for all countries
async function handleCalculation() {
    const salary = parseFloat(document.getElementById('salary').value);
    const inputCurrency = document.getElementById('inputCurrency').value;
    const displayCurrency = document.getElementById('displayCurrency').value;

    if (!salary || salary <= 0) {
        // Clear results if no valid salary
        clearAllResults();
        return;
    }

    showLoadingInfo();

    try {
        // Calculate and update map
        await calculateAndUpdateMap(salary, inputCurrency, displayCurrency);
    } catch (error) {
        console.error('Error during calculation:', error);
        alert('Error during calculation: ' + error.message);
    } finally {
        hideLoadingInfo();
    }
}

// Clear all results
function clearAllResults() {
    // Reset map to default
    // This will be handled by calculateAndUpdateMap with empty salary
    calculateAndUpdateMap(0);
}

// Show loading information
function showLoadingInfo() {
    const loadingInfo = document.getElementById('loadingInfo');
    if (loadingInfo) {
        loadingInfo.style.display = 'block';
    }
}

// Hide loading information
function hideLoadingInfo() {
    const loadingInfo = document.getElementById('loadingInfo');
    if (loadingInfo) {
        loadingInfo.style.display = 'none';
    }
}

// Update currency displays throughout the page
function updateCurrencyDisplays(currency) {
    document.querySelectorAll('.currency-display').forEach(element => {
        element.textContent = currency;
    });
}

// Listen for display currency changes
document.addEventListener('taxCalculationsComplete', (event) => {
    updateCurrencyDisplays(event.detail.displayCurrency);
});

// Make functions available globally for HTML onclick handlers
window.sortTable = sortByColumn;
window.exportResults = exportToCSV;