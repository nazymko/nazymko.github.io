// Results Table Component - Handles results display and interaction
export class ResultsTableComponent {
    constructor(containerId = 'resultsTableContainer') {
        this.containerId = containerId;
        this.currentResults = [];
        this.currentSortColumn = 'taxAmountInDisplayCurrency';
        this.currentSortDirection = 'desc';
        this.currentDisplayCurrency = 'USD';
        this.listeners = new Map();

        this.init();
    }

    // Initialize the component
    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    // Setup DOM element references
    setupElements() {
        this.elements = {
            container: document.getElementById(this.containerId),
            tableBody: document.getElementById('resultsTableBody'),
            searchInput: document.getElementById('countrySearch'),
            exportButton: document.getElementById('exportBtn'),
            summaryStats: {
                totalCountries: document.getElementById('totalCountries'),
                avgTax: document.getElementById('avgTax'),
                maxTax: document.getElementById('maxTax'),
                minTax: document.getElementById('minTax')
            }
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.filterResults(e.target.value);
            });
        }

        // Export button
        if (this.elements.exportButton) {
            this.elements.exportButton.addEventListener('click', () => {
                this.exportToCSV();
            });
        }
    }

    // Update table with new results
    updateResults(results, displayCurrency) {
        this.currentResults = results;
        this.currentDisplayCurrency = displayCurrency;

        if (this.elements.container) {
            this.elements.container.style.display = 'block';
        }

        this.updateCurrencyDisplay(displayCurrency);
        this.renderTable();
        this.updateSummaryStats();
    }

    // Render the results table
    renderTable() {
        if (!this.elements.tableBody) return;

        // Sort results
        const sortedResults = this.getSortedResults();

        // Clear table
        this.elements.tableBody.innerHTML = '';

        // Add rows
        sortedResults.forEach((result, index) => {
            const row = this.createTableRow(result, index);
            this.elements.tableBody.appendChild(row);
        });

        this.updateSortIndicators();
    }

    // Get sorted results based on current sort settings
    getSortedResults() {
        return [...this.currentResults].sort((a, b) => {
            let aVal = a[this.currentSortColumn];
            let bVal = b[this.currentSortColumn];

            // Handle income tax rate calculation for sorting
            if (this.currentSortColumn === 'incomeTaxRate') {
                aVal = a.grossIncome > 0 ? (a.incomeTax / a.grossIncome) * 100 : 0;
                bVal = b.grossIncome > 0 ? (b.incomeTax / b.grossIncome) * 100 : 0;
            }

            if (typeof aVal === 'string') {
                return this.currentSortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return this.currentSortDirection === 'asc'
                ? aVal - bVal
                : bVal - aVal;
        });
    }

    // Create a table row element
    createTableRow(result, index) {
        const row = document.createElement('tr');
        row.className = 'results-row';
        row.dataset.countryKey = result.countryKey;

        // Add click handler
        row.addEventListener('click', () => {
            this.selectRow(row, result);
        });

        // Create cells
        row.appendChild(this.createCell(index + 1, 'rank-cell'));
        row.appendChild(this.createCountryCell(result));
        row.appendChild(this.createTaxAmountCell(result));
        row.appendChild(this.createIncomeTaxRateCell(result));
        row.appendChild(this.createRateCell(result));
        row.appendChild(this.createNetIncomeCell(result));
        row.appendChild(this.createEmployerCostCell(result));
        row.appendChild(this.createLocalAmountsCell(result));
        row.appendChild(this.createExchangeRateCell(result));

        return row;
    }

    // Create a basic table cell
    createCell(content, className = '') {
        const cell = document.createElement('td');
        cell.textContent = content;
        if (className) cell.className = className;
        return cell;
    }

    // Create country info cell
    createCountryCell(result) {
        const cell = document.createElement('td');
        cell.innerHTML = `
            <div class="country-info">
                <strong>${result.countryName}</strong>
                <small>${result.currency}</small>
            </div>
        `;
        return cell;
    }

    // Create tax amount cell
    createTaxAmountCell(result) {
        const cell = document.createElement('td');
        cell.className = 'tax-amount';

        if (result.hasVAT && result.vatAmountInDisplayCurrency > 0) {
            cell.innerHTML = `
                <div class="tax-breakdown">
                    <div class="total-tax"><strong>${this.currentDisplayCurrency} ${result.taxAmountInDisplayCurrency.toLocaleString()}</strong></div>
                    <div class="tax-components">
                        <small>Income: ${this.currentDisplayCurrency} ${result.incomeTaxInDisplayCurrency.toLocaleString()}</small><br>
                        <small>VAT: ${this.currentDisplayCurrency} ${result.vatAmountInDisplayCurrency.toLocaleString()} (${result.vatRate}%)</small>
                    </div>
                </div>
            `;
        } else {
            cell.textContent = `${this.currentDisplayCurrency} ${result.taxAmountInDisplayCurrency.toLocaleString()}`;
        }

        return cell;
    }

    // Create income tax rate cell
    createIncomeTaxRateCell(result) {
        const cell = document.createElement('td');
        cell.className = 'income-tax-rate';

        // Calculate income tax rate (income tax / gross income * 100)
        const incomeTaxRate = result.grossIncome > 0
            ? (result.incomeTax / result.grossIncome) * 100
            : 0;

        cell.textContent = `${incomeTaxRate.toFixed(2)}%`;
        return cell;
    }

    // Create tax rate cell
    createRateCell(result) {
        const cell = document.createElement('td');
        cell.className = 'tax-rate';
        cell.textContent = `${result.effectiveRate.toFixed(2)}%`;
        return cell;
    }

    // Create net income cell
    createNetIncomeCell(result) {
        const cell = document.createElement('td');
        cell.className = 'net-income';
        cell.textContent = `${this.currentDisplayCurrency} ${result.netIncomeInDisplayCurrency.toLocaleString()}`;
        return cell;
    }

    // Create employer cost cell
    createEmployerCostCell(result) {
        const cell = document.createElement('td');
        cell.className = 'employer-cost';

        if (result.hasSocialSecurity && result.totalEmployerCostInDisplayCurrency) {
            const employerCostRate = result.employerCostRate || 100;
            const costIncrease = employerCostRate - 100;

            cell.innerHTML = `
                <div class="employer-cost-breakdown">
                    <div class="total-cost"><strong>${this.currentDisplayCurrency} ${result.totalEmployerCostInDisplayCurrency.toLocaleString()}</strong></div>
                    <div class="cost-details">
                        <small>+${costIncrease.toFixed(1)}% vs salary</small><br>
                        <small>SS: ${this.currentDisplayCurrency} ${result.employerSocialSecurityInDisplayCurrency.toLocaleString()} (${result.employerSocialSecurityRate}%)</small>
                    </div>
                </div>
            `;
        } else {
            cell.innerHTML = `
                <div class="employer-cost-breakdown">
                    <div class="total-cost"><strong>${this.currentDisplayCurrency} ${result.grossIncomeInDisplayCurrency.toLocaleString()}</strong></div>
                    <div class="cost-details"><small>No employer SS</small></div>
                </div>
            `;
        }

        return cell;
    }

    // Create local amounts cell
    createLocalAmountsCell(result) {
        const cell = document.createElement('td');
        console.log(result.countryKey,result)
        cell.className = 'local-amounts';

        let breakdown = `<div class="local-info">`;

        // First line: Total gross income in bold black
        const grossIncome = result.grossIncome || (result.netIncome + result.taxAmount);
        breakdown += `<div style="font-weight: bold; color: #000; margin-bottom: 5px;">Salary: ${result.currency} ${grossIncome.toLocaleString()}</div>`;

        // Tax breakdown in red color
        breakdown += `<div style="color: #d32f2f; font-size: 0.9em;">Income Tax: ${result.currency} ${result.incomeTax.toLocaleString()}</div>`;

        // Add special taxes if available
        if (result.specialTaxes && result.specialTaxes.length > 0) {
            for (const tax of result.specialTaxes) {
                const taxName = tax.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const taxRate = tax.rate ? tax.rate.toFixed(1) : 'N/A';
                breakdown += `<div style="color: #d32f2f; font-size: 0.9em;">${taxName} (${taxRate}%): ${result.currency} ${tax.taxAmount.toLocaleString()}</div>`;
            }
        }

        // Add employee social security if available
        if (result.hasSocialSecurity && result.employeeSocialSecurity > 0) {
            const empSSRate = result.employeeSocialSecurityRate ? result.employeeSocialSecurityRate.toFixed(1) : 'N/A';
            breakdown += `<div style="color: #d32f2f; font-size: 0.9em;">Employee SS (${empSSRate}%): ${result.currency} ${result.employeeSocialSecurity.toLocaleString()}</div>`;
        }

        // Add VAT if available
        if (result.hasVAT && result.vatAmount > 0) {
            const vatRate = result.vatRate ? result.vatRate.toFixed(1) : 'N/A';
            breakdown += `<div style="color: #d32f2f; font-size: 0.9em;">VAT (${vatRate}%): ${result.currency} ${result.vatAmount.toLocaleString()}</div>`;
        }

        // Line separator and total
        breakdown += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #ccc;">`;
        breakdown += `<div style="font-weight: bold; color: #d32f2f; margin-bottom: 5px;">Total Employee Tax: ${result.currency} ${result.taxAmount.toLocaleString()}</div>`;

        // Net income in light green
        breakdown += `<div style="font-weight: bold; color: #4caf50; margin-top: 5px;">Net: ${result.currency} ${result.netIncome.toLocaleString()}</div>`;

        // Add employer cost if social security exists
        if (result.hasSocialSecurity && result.employerSocialSecurity > 0) {
            breakdown += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #ccc;">`;
            const empRateSSRate = result.employerSocialSecurityRate ? result.employerSocialSecurityRate.toFixed(1) : 'N/A';
            breakdown += `<div style="color: #ff5722; font-size: 0.9em;">Employer SS (${empRateSSRate}%): ${result.currency} ${result.employerSocialSecurity.toLocaleString()}</div>`;
            breakdown += `<div style="font-weight: bold; color: #ff5722; margin-top: 5px;">Total Employer Cost: ${result.currency} ${result.totalEmployerCost.toLocaleString()}</div>`;
        }

        breakdown += `</div>`;

        cell.innerHTML = breakdown;
        return cell;
    }

    // Create exchange rate cell
    createExchangeRateCell(result) {
        const cell = document.createElement('td');
        cell.className = 'exchange-rate';
        cell.textContent = result.exchangeRate && result.exchangeRate !== 1
            ? result.exchangeRate.toFixed(4)
            : '-';
        return cell;
    }

    // Select a row and emit event
    selectRow(row, result) {
        // Remove previous selection
        document.querySelectorAll('.results-row').forEach(r => r.classList.remove('selected'));

        // Add selection to current row
        row.classList.add('selected');

        // Emit selection event
        this.emit('rowSelected', { result, row });
    }

    // Sort by column
    sortByColumn(column) {
        if (this.currentSortColumn === column) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.currentSortDirection = 'desc';
        }

        this.renderTable();
    }

    // Update sort indicators
    updateSortIndicators() {
        document.querySelectorAll('.sort-header').forEach(header => {
            const column = header.dataset.column;
            const indicator = header.querySelector('.sort-indicator');

            if (column === this.currentSortColumn) {
                indicator.textContent = this.currentSortDirection === 'asc' ? '↑' : '↓';
                header.classList.add('active-sort');
            } else {
                indicator.textContent = '↕';
                header.classList.remove('active-sort');
            }
        });
    }

    // Filter results based on search term
    filterResults(searchTerm) {
        const rows = document.querySelectorAll('.results-row');
        const term = searchTerm.toLowerCase();

        rows.forEach(row => {
            const countryInfo = row.querySelector('.country-info');
            const countryName = countryInfo.querySelector('strong').textContent.toLowerCase();
            const currency = countryInfo.querySelector('small').textContent.toLowerCase();

            if (countryName.includes(term) || currency.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Update currency display
    updateCurrencyDisplay(currency) {
        document.querySelectorAll('.currency-display').forEach(element => {
            element.textContent = currency;
        });
    }

    // Update summary statistics
    updateSummaryStats() {
        if (this.currentResults.length === 0) return;

        const totalTax = this.currentResults.reduce((sum, r) => sum + r.taxAmountInDisplayCurrency, 0);
        const avgTax = totalTax / this.currentResults.length;
        const maxTax = Math.max(...this.currentResults.map(r => r.taxAmountInDisplayCurrency));
        const minTax = Math.min(...this.currentResults.map(r => r.taxAmountInDisplayCurrency));

        const maxTaxCountry = this.currentResults.find(r => r.taxAmountInDisplayCurrency === maxTax);
        const minTaxCountry = this.currentResults.find(r => r.taxAmountInDisplayCurrency === minTax);

        // Update summary elements
        if (this.elements.summaryStats.totalCountries) {
            this.elements.summaryStats.totalCountries.textContent = this.currentResults.length;
        }
        if (this.elements.summaryStats.avgTax) {
            this.elements.summaryStats.avgTax.textContent = `${this.currentDisplayCurrency} ${avgTax.toLocaleString()}`;
        }
        if (this.elements.summaryStats.maxTax) {
            this.elements.summaryStats.maxTax.textContent = `${this.currentDisplayCurrency} ${maxTax.toLocaleString()} (${maxTaxCountry.countryName})`;
        }
        if (this.elements.summaryStats.minTax) {
            this.elements.summaryStats.minTax.textContent = `${this.currentDisplayCurrency} ${minTax.toLocaleString()} (${minTaxCountry.countryName})`;
        }
    }

    // Export results to CSV
    exportToCSV() {
        if (this.currentResults.length === 0) return;

        const headers = [
            'Rank',
            'Country',
            'Currency',
            `Total Tax (${this.currentDisplayCurrency})`,
            `Income Tax (${this.currentDisplayCurrency})`,
            `Missing Income (${this.currentDisplayCurrency})`,
            `Employee SS (${this.currentDisplayCurrency})`,
            `VAT (${this.currentDisplayCurrency})`,
            'VAT Rate (%)',
            'Income Tax Rate (%)',
            'Missing Income Rate (%)',
            'Employee SS Rate (%)',
            'Effective Rate (%)',
            `Net Income (${this.currentDisplayCurrency})`,
            `Employment Cost (${this.currentDisplayCurrency})`,
            'Local Total Tax',
            'Local Income Tax',
            'Local Missing Income',
            'Local Employee SS',
            'Local VAT',
            'Local Net Income',
            'Local Employment Cost',
            'Exchange Rate'
        ];

        const csvData = [
            headers.join(','),
            ...this.currentResults.map((result, index) => {
                const incomeTaxRate = result.grossIncome > 0
                    ? (result.incomeTax / result.grossIncome) * 100
                    : 0;

                return [
                    index + 1,
                    `"${result.countryName}"`,
                    result.currency,
                    result.taxAmountInDisplayCurrency.toFixed(2),
                    result.incomeTaxInDisplayCurrency ? result.incomeTaxInDisplayCurrency.toFixed(2) : '0',
                    result.missingIncomeInDisplayCurrency ? result.missingIncomeInDisplayCurrency.toFixed(2) : '0',
                    result.employeeSocialSecurityInDisplayCurrency ? result.employeeSocialSecurityInDisplayCurrency.toFixed(2) : '0',
                    result.vatAmountInDisplayCurrency ? result.vatAmountInDisplayCurrency.toFixed(2) : '0',
                    result.vatRate ? result.vatRate.toFixed(2) : '0',
                    incomeTaxRate.toFixed(2),
                    result.employerSocialSecurityRate ? result.employerSocialSecurityRate.toFixed(2) : '0',
                    result.employeeSocialSecurityRate ? result.employeeSocialSecurityRate.toFixed(2) : '0',
                    result.effectiveRate.toFixed(2),
                    result.netIncomeInDisplayCurrency.toFixed(2),
                    result.totalEmploymentCostInDisplayCurrency ? result.totalEmploymentCostInDisplayCurrency.toFixed(2) : result.grossIncomeInDisplayCurrency.toFixed(2),
                    result.taxAmount.toFixed(2),
                    result.incomeTax ? result.incomeTax.toFixed(2) : '0',
                    result.missingIncome ? result.missingIncome.toFixed(2) : '0',
                    result.employeeSocialSecurity ? result.employeeSocialSecurity.toFixed(2) : '0',
                    result.vatAmount ? result.vatAmount.toFixed(2) : '0',
                    result.netIncome.toFixed(2),
                    result.totalEmploymentCost ? result.totalEmploymentCost.toFixed(2) : result.grossIncome.toFixed(2),
                    result.exchangeRate ? result.exchangeRate.toFixed(4) : '1'
                ].join(',');
            })
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

    // Clear results
    clear() {
        if (this.elements.container) {
            this.elements.container.style.display = 'none';
        }
        if (this.elements.tableBody) {
            this.elements.tableBody.innerHTML = '';
        }
        this.currentResults = [];
    }

    // Event emitter functionality
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
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

    // Get current results
    getCurrentResults() {
        return this.currentResults;
    }

    // Handle language change
    handleLanguageChange() {
        // Re-render table with current results to show translated content
        if (this.currentResults && this.currentResults.length > 0) {
            this.updateResults(this.currentResults, this.currentDisplayCurrency);
        }
        console.log('📊 Results table component language updated');
    }

    // Destroy the component
    destroy() {
        this.listeners.clear();
    }
}
