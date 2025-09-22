import { highlightCountryOnMap } from './mapController.js';

let currentResults = [];
let currentSortColumn = 'taxAmountInDisplayCurrency';
let currentSortDirection = 'desc';
let currentDisplayCurrency = 'USD';

// Initialize results table
export function initializeResultsTable() {
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Listen for tax calculation completion
    document.addEventListener('taxCalculationsComplete', (event) => {
        const { results, displayCurrency } = event.detail;
        updateResultsTable(results, displayCurrency);
    });

    // Currency selector for display
    const currencySelector = document.getElementById('displayCurrency');
    if (currencySelector) {
        currencySelector.addEventListener('change', (e) => {
            // This would trigger recalculation with new display currency
            // Implementation depends on how the main app handles currency changes
            const event = new CustomEvent('displayCurrencyChanged', {
                detail: { newCurrency: e.target.value }
            });
            document.dispatchEvent(event);
        });
    }

    // Search functionality
    const searchInput = document.getElementById('countrySearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterResults(e.target.value);
        });
    }
}

// Update results table with new data
export function updateResultsTable(results, displayCurrency) {
    currentResults = results;
    currentDisplayCurrency = displayCurrency;

    const tableContainer = document.getElementById('resultsTableContainer');
    if (!tableContainer) return;

    // Show the results section
    tableContainer.style.display = 'block';

    // Update currency display
    updateCurrencyDisplay(displayCurrency);

    // Render the table
    renderTable();

    // Update summary statistics
    updateSummaryStats(results, displayCurrency);
}

// Render the results table
function renderTable() {
    const tableBody = document.getElementById('resultsTableBody');
    if (!tableBody) return;

    // Sort results
    const sortedResults = [...currentResults].sort((a, b) => {
        const aVal = a[currentSortColumn];
        const bVal = b[currentSortColumn];

        if (typeof aVal === 'string') {
            return currentSortDirection === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return currentSortDirection === 'asc'
            ? aVal - bVal
            : bVal - aVal;
    });

    // Clear table
    tableBody.innerHTML = '';

    // Add rows
    sortedResults.forEach((result, index) => {
        const row = createTableRow(result, index);
        tableBody.appendChild(row);
    });

    // Update sort indicators
    updateSortIndicators();
}

// Create a table row
function createTableRow(result, index) {
    const row = document.createElement('tr');
    row.className = 'results-row';
    row.dataset.countryKey = result.countryKey;

    // Add click handler to highlight country on map
    row.addEventListener('click', () => {
        highlightCountryOnMap(result.countryKey);

        // Highlight selected row
        document.querySelectorAll('.results-row').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
    });

    // Rank
    const rankCell = document.createElement('td');
    rankCell.textContent = index + 1;
    rankCell.className = 'rank-cell';
    row.appendChild(rankCell);

    // Country name
    const countryCell = document.createElement('td');
    countryCell.innerHTML = `
        <div class="country-info">
            <strong>${result.countryName}</strong>
            <small>${result.currency}</small>
        </div>
    `;
    row.appendChild(countryCell);

    // Tax amount (in display currency)
    const taxAmountCell = document.createElement('td');
    taxAmountCell.className = 'tax-amount';
    taxAmountCell.textContent = `${currentDisplayCurrency} ${result.taxAmountInDisplayCurrency.toLocaleString()}`;
    row.appendChild(taxAmountCell);

    // Effective rate
    const rateCell = document.createElement('td');
    rateCell.className = 'tax-rate';
    rateCell.textContent = `${result.effectiveRate.toFixed(2)}%`;
    row.appendChild(rateCell);

    // Net income (in display currency)
    const netIncomeCell = document.createElement('td');
    netIncomeCell.className = 'net-income';
    netIncomeCell.textContent = `${currentDisplayCurrency} ${result.netIncomeInDisplayCurrency.toLocaleString()}`;
    row.appendChild(netIncomeCell);

    // Local currency amounts
    const localAmountsCell = document.createElement('td');
    localAmountsCell.className = 'local-amounts';
    localAmountsCell.innerHTML = `
        <div class="local-info">
            <div>Tax: ${result.currency} ${result.taxAmount.toLocaleString()}</div>
            <div>Net: ${result.currency} ${result.netIncome.toLocaleString()}</div>
        </div>
    `;
    row.appendChild(localAmountsCell);

    // Exchange rate (if different from 1)
    const exchangeRateCell = document.createElement('td');
    exchangeRateCell.className = 'exchange-rate';
    if (result.exchangeRate && result.exchangeRate !== 1) {
        exchangeRateCell.textContent = result.exchangeRate.toFixed(4);
    } else {
        exchangeRateCell.textContent = '-';
    }
    row.appendChild(exchangeRateCell);

    return row;
}

// Handle column sort
export function sortByColumn(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'desc'; // Default to descending for most columns
    }

    renderTable();
}

// Update sort indicators in table headers
function updateSortIndicators() {
    document.querySelectorAll('.sort-header').forEach(header => {
        const column = header.dataset.column;
        const indicator = header.querySelector('.sort-indicator');

        if (column === currentSortColumn) {
            indicator.textContent = currentSortDirection === 'asc' ? '↑' : '↓';
            header.classList.add('active-sort');
        } else {
            indicator.textContent = '↕';
            header.classList.remove('active-sort');
        }
    });
}

// Filter results based on search
function filterResults(searchTerm) {
    const rows = document.querySelectorAll('.results-row');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const countryName = row.querySelector('.country-info strong').textContent.toLowerCase();
        const currency = row.querySelector('.country-info small').textContent.toLowerCase();

        if (countryName.includes(term) || currency.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update currency display throughout the interface
function updateCurrencyDisplay(currency) {
    document.querySelectorAll('.currency-display').forEach(element => {
        element.textContent = currency;
    });
}

// Update summary statistics
function updateSummaryStats(results, displayCurrency) {
    if (results.length === 0) return;

    const totalTax = results.reduce((sum, r) => sum + r.taxAmountInDisplayCurrency, 0);
    const avgTax = totalTax / results.length;
    const maxTax = Math.max(...results.map(r => r.taxAmountInDisplayCurrency));
    const minTax = Math.min(...results.map(r => r.taxAmountInDisplayCurrency));

    const maxTaxCountry = results.find(r => r.taxAmountInDisplayCurrency === maxTax);
    const minTaxCountry = results.find(r => r.taxAmountInDisplayCurrency === minTax);

    // Update summary elements
    const summaryElements = {
        'avgTax': `${displayCurrency} ${avgTax.toLocaleString()}`,
        'maxTax': `${displayCurrency} ${maxTax.toLocaleString()} (${maxTaxCountry.countryName})`,
        'minTax': `${displayCurrency} ${minTax.toLocaleString()} (${minTaxCountry.countryName})`,
        'totalCountries': results.length
    };

    Object.entries(summaryElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// Clear results table
export function clearResultsTable() {
    const tableContainer = document.getElementById('resultsTableContainer');
    if (tableContainer) {
        tableContainer.style.display = 'none';
    }

    const tableBody = document.getElementById('resultsTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    currentResults = [];
}

// Export results to CSV
export function exportToCSV() {
    if (currentResults.length === 0) return;

    const headers = [
        'Rank',
        'Country',
        'Currency',
        `Tax Amount (${currentDisplayCurrency})`,
        'Effective Rate (%)',
        `Net Income (${currentDisplayCurrency})`,
        `Local Tax (Local Currency)`,
        `Local Net Income (Local Currency)`,
        'Exchange Rate'
    ];

    const csvData = [
        headers.join(','),
        ...currentResults.map((result, index) => [
            index + 1,
            `"${result.countryName}"`,
            result.currency,
            result.taxAmountInDisplayCurrency.toFixed(2),
            result.effectiveRate.toFixed(2),
            result.netIncomeInDisplayCurrency.toFixed(2),
            result.taxAmount.toFixed(2),
            result.netIncome.toFixed(2),
            result.exchangeRate ? result.exchangeRate.toFixed(4) : '1'
        ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}