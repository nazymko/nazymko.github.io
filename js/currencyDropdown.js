// Searchable Currency Dropdown Component
export class SearchableCurrencyDropdown {
    constructor(selectElement) {
        this.originalSelect = selectElement;
        this.selectedValue = selectElement.value;
        this.isOpen = false;
        this.highlightedIndex = -1;
        this.filteredOptions = [];

        // Currency data with search keywords
        this.currencies = [
            { code: 'USD', name: 'US Dollar', country: 'United States', keywords: 'usa america dollar' },
            { code: 'EUR', name: 'Euro', country: 'European Union', keywords: 'europe eurozone' },
            { code: 'GBP', name: 'British Pound', country: 'United Kingdom', keywords: 'uk britain england sterling' },
            { code: 'JPY', name: 'Japanese Yen', country: 'Japan', keywords: 'japan yen' },
            { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', keywords: 'canada canadian' },
            { code: 'AUD', name: 'Australian Dollar', country: 'Australia', keywords: 'australia aussie' },
            { code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', keywords: 'switzerland swiss' },
            { code: 'CNY', name: 'Chinese Yuan', country: 'China', keywords: 'china chinese yuan renminbi' },
            { code: 'SEK', name: 'Swedish Krona', country: 'Sweden', keywords: 'sweden swedish' },
            { code: 'NOK', name: 'Norwegian Krone', country: 'Norway', keywords: 'norway norwegian' },
            { code: 'DKK', name: 'Danish Krone', country: 'Denmark', keywords: 'denmark danish' },
            { code: 'PLN', name: 'Polish Zloty', country: 'Poland', keywords: 'poland polish' },
            { code: 'CZK', name: 'Czech Koruna', country: 'Czech Republic', keywords: 'czech republic' },
            { code: 'HUF', name: 'Hungarian Forint', country: 'Hungary', keywords: 'hungary hungarian' },
            { code: 'RON', name: 'Romanian Leu', country: 'Romania', keywords: 'romania romanian' },
            { code: 'BGN', name: 'Bulgarian Lev', country: 'Bulgaria', keywords: 'bulgaria bulgarian' },
            { code: 'HRK', name: 'Croatian Kuna', country: 'Croatia', keywords: 'croatia croatian' },
            { code: 'RUB', name: 'Russian Ruble', country: 'Russia', keywords: 'russia russian' },
            { code: 'UAH', name: 'Ukrainian Hryvnia', country: 'Ukraine', keywords: 'ukraine ukrainian' },
            { code: 'TRY', name: 'Turkish Lira', country: 'Turkey', keywords: 'turkey turkish' },
            { code: 'INR', name: 'Indian Rupee', country: 'India', keywords: 'india indian' },
            { code: 'KRW', name: 'South Korean Won', country: 'South Korea', keywords: 'korea korean south' },
            { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', keywords: 'singapore' },
            { code: 'HKD', name: 'Hong Kong Dollar', country: 'Hong Kong', keywords: 'hong kong' },
            { code: 'NZD', name: 'New Zealand Dollar', country: 'New Zealand', keywords: 'new zealand kiwi' },
            { code: 'MXN', name: 'Mexican Peso', country: 'Mexico', keywords: 'mexico mexican' },
            { code: 'BRL', name: 'Brazilian Real', country: 'Brazil', keywords: 'brazil brazilian' },
            { code: 'ARS', name: 'Argentine Peso', country: 'Argentina', keywords: 'argentina argentine' },
            { code: 'CLP', name: 'Chilean Peso', country: 'Chile', keywords: 'chile chilean' },
            { code: 'COP', name: 'Colombian Peso', country: 'Colombia', keywords: 'colombia colombian' },
            { code: 'ZAR', name: 'South African Rand', country: 'South Africa', keywords: 'south africa african' },
            { code: 'EGP', name: 'Egyptian Pound', country: 'Egypt', keywords: 'egypt egyptian' },
            { code: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', keywords: 'uae emirates dubai' },
            { code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', keywords: 'saudi arabia' },
            { code: 'ILS', name: 'Israeli Shekel', country: 'Israel', keywords: 'israel israeli' },
            { code: 'THB', name: 'Thai Baht', country: 'Thailand', keywords: 'thailand thai' },
            { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', keywords: 'malaysia malaysian' },
            { code: 'IDR', name: 'Indonesian Rupiah', country: 'Indonesia', keywords: 'indonesia indonesian' },
            { code: 'PHP', name: 'Philippine Peso', country: 'Philippines', keywords: 'philippines filipino' },
            { code: 'VND', name: 'Vietnamese Dong', country: 'Vietnam', keywords: 'vietnam vietnamese' },
            { code: 'PKR', name: 'Pakistani Rupee', country: 'Pakistan', keywords: 'pakistan pakistani' },
            { code: 'BDT', name: 'Bangladeshi Taka', country: 'Bangladesh', keywords: 'bangladesh bangladeshi' },
            { code: 'LKR', name: 'Sri Lankan Rupee', country: 'Sri Lanka', keywords: 'sri lanka' },
            { code: 'MMK', name: 'Myanmar Kyat', country: 'Myanmar', keywords: 'myanmar burma' },
            { code: 'KZT', name: 'Kazakhstani Tenge', country: 'Kazakhstan', keywords: 'kazakhstan' },
            { code: 'UZS', name: 'Uzbekistani Som', country: 'Uzbekistan', keywords: 'uzbekistan' },
            { code: 'GEL', name: 'Georgian Lari', country: 'Georgia', keywords: 'georgia georgian' },
            { code: 'AMD', name: 'Armenian Dram', country: 'Armenia', keywords: 'armenia armenian' },
            { code: 'AZN', name: 'Azerbaijani Manat', country: 'Azerbaijan', keywords: 'azerbaijan' },
            { code: 'BYN', name: 'Belarusian Ruble', country: 'Belarus', keywords: 'belarus belarusian' },
            { code: 'MDL', name: 'Moldovan Leu', country: 'Moldova', keywords: 'moldova moldovan' },
            { code: 'MKD', name: 'North Macedonian Denar', country: 'North Macedonia', keywords: 'macedonia macedonian' },
            { code: 'RSD', name: 'Serbian Dinar', country: 'Serbia', keywords: 'serbia serbian' },
            { code: 'BAM', name: 'Bosnia-Herzegovina Mark', country: 'Bosnia and Herzegovina', keywords: 'bosnia herzegovina' },
            { code: 'ALL', name: 'Albanian Lek', country: 'Albania', keywords: 'albania albanian' },
            { code: 'MNT', name: 'Mongolian Tugrik', country: 'Mongolia', keywords: 'mongolia mongolian' },
            { code: 'NGN', name: 'Nigerian Naira', country: 'Nigeria', keywords: 'nigeria nigerian' },
            { code: 'KES', name: 'Kenyan Shilling', country: 'Kenya', keywords: 'kenya kenyan' },
            { code: 'GHS', name: 'Ghanaian Cedi', country: 'Ghana', keywords: 'ghana ghanaian' },
            { code: 'ETB', name: 'Ethiopian Birr', country: 'Ethiopia', keywords: 'ethiopia ethiopian' },
            { code: 'UGX', name: 'Ugandan Shilling', country: 'Uganda', keywords: 'uganda ugandan' },
            { code: 'TZS', name: 'Tanzanian Shilling', country: 'Tanzania', keywords: 'tanzania tanzanian' },
            { code: 'MAD', name: 'Moroccan Dirham', country: 'Morocco', keywords: 'morocco moroccan' },
            { code: 'DZD', name: 'Algerian Dinar', country: 'Algeria', keywords: 'algeria algerian' },
            { code: 'TND', name: 'Tunisian Dinar', country: 'Tunisia', keywords: 'tunisia tunisian' },
            { code: 'XOF', name: 'West African CFA Franc', country: 'West Africa', keywords: 'west africa cfa burkina faso ivory coast mali niger senegal' },
            { code: 'XAF', name: 'Central African CFA Franc', country: 'Central Africa', keywords: 'central africa cfa cameroon chad gabon' }
        ];

        this.init();
    }

    init() {
        this.createDropdownElement();
        this.attachEventListeners();
        this.setInitialValue();
    }

    createDropdownElement() {
        // Create the searchable dropdown container
        this.container = document.createElement('div');
        this.container.className = 'searchable-currency-dropdown';

        // Create the main input element
        this.input = document.createElement('div');
        this.input.className = 'currency-search-input';
        this.input.innerHTML = `
            <span class="selected-currency">Select currency...</span>
            <span class="currency-dropdown-arrow">▼</span>
        `;

        // Create the options container
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'currency-options-container';

        // Create search box
        this.searchBox = document.createElement('input');
        this.searchBox.className = 'currency-search-box';
        this.searchBox.placeholder = 'Search currencies...';
        this.searchBox.type = 'text';

        // Create options list
        this.optionsList = document.createElement('div');
        this.optionsList.className = 'currency-options-list';

        this.optionsContainer.appendChild(this.searchBox);
        this.optionsContainer.appendChild(this.optionsList);

        this.container.appendChild(this.input);
        this.container.appendChild(this.optionsContainer);

        // Replace the original select element
        this.originalSelect.style.display = 'none';
        this.originalSelect.parentNode.appendChild(this.container);

        this.populateOptions();
    }

    populateOptions(filter = '') {
        this.optionsList.innerHTML = '';

        const searchTerm = filter.toLowerCase().trim();
        this.filteredOptions = this.currencies.filter(currency => {
            if (!searchTerm) return true;

            const searchFields = [
                currency.code.toLowerCase(),
                currency.name.toLowerCase(),
                currency.country.toLowerCase(),
                currency.keywords.toLowerCase()
            ].join(' ');

            return searchFields.includes(searchTerm);
        });

        if (this.filteredOptions.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No currencies found';
            this.optionsList.appendChild(noResults);
            return;
        }

        this.filteredOptions.forEach((currency, index) => {
            const option = document.createElement('div');
            option.className = 'currency-option';
            option.dataset.code = currency.code;
            option.dataset.index = index;

            if (currency.code === this.selectedValue) {
                option.classList.add('selected');
            }

            option.innerHTML = `
                <div>
                    <span class="currency-code">${currency.code}</span>
                    <span class="currency-name">${currency.name}</span>
                </div>
                <div class="currency-country">${currency.country}</div>
            `;

            option.addEventListener('click', () => this.selectOption(currency.code));
            this.optionsList.appendChild(option);
        });
    }

    attachEventListeners() {
        // Store bound methods for cleanup
        this.handleInputClick = (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        };

        this.handleSearchInput = (e) => {
            this.populateOptions(e.target.value);
            this.highlightedIndex = -1;
        };

        this.boundHandleKeydown = (e) => {
            this.handleKeydown(e);
        };

        this.handleDocumentClick = (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        };

        this.handleOptionsClick = (e) => {
            e.stopPropagation();
        };

        // Attach event listeners
        this.input.addEventListener('click', this.handleInputClick);
        this.searchBox.addEventListener('input', this.handleSearchInput);
        this.searchBox.addEventListener('keydown', this.boundHandleKeydown);
        document.addEventListener('click', this.handleDocumentClick);
        this.optionsContainer.addEventListener('click', this.handleOptionsClick);
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isOpen = true;
        this.input.classList.add('open');
        this.input.querySelector('.currency-dropdown-arrow').classList.add('open');
        this.optionsContainer.classList.add('open');

        // Focus search box and select all text
        setTimeout(() => {
            this.searchBox.focus();
            this.searchBox.select();
        }, 100);
    }

    closeDropdown() {
        this.isOpen = false;
        this.input.classList.remove('open');
        this.input.querySelector('.currency-dropdown-arrow').classList.remove('open');
        this.optionsContainer.classList.remove('open');
        this.searchBox.value = '';
        this.populateOptions();
        this.highlightedIndex = -1;
    }

    selectOption(code) {
        this.selectedValue = code;
        this.originalSelect.value = code;

        // Trigger change event on original select
        this.originalSelect.dispatchEvent(new Event('change', { bubbles: true }));

        // Update display
        const currency = this.currencies.find(c => c.code === code);
        this.input.querySelector('.selected-currency').textContent = `${currency.code} - ${currency.name}`;

        // Update selected option styling
        this.optionsList.querySelectorAll('.currency-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.code === code) {
                option.classList.add('selected');
            }
        });

        this.closeDropdown();
    }

    setInitialValue() {
        if (this.originalSelect.value) {
            this.selectOption(this.originalSelect.value);
        }
    }

    handleKeydown(e) {
        const options = this.optionsList.querySelectorAll('.currency-option:not(.no-results)');

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, options.length - 1);
                this.updateHighlight();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
                this.updateHighlight();
                break;

            case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0 && options[this.highlightedIndex]) {
                    const code = options[this.highlightedIndex].dataset.code;
                    this.selectOption(code);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.closeDropdown();
                break;
        }
    }

    updateHighlight() {
        const options = this.optionsList.querySelectorAll('.currency-option:not(.no-results)');

        options.forEach((option, index) => {
            option.classList.remove('highlighted');
            if (index === this.highlightedIndex) {
                option.classList.add('highlighted');
                option.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    // Method to programmatically set value
    setValue(code) {
        this.selectOption(code);
    }

    // Method to get current value
    getValue() {
        return this.selectedValue;
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        if (this.input) {
            this.input.removeEventListener('click', this.handleInputClick);
        }
        if (this.searchBox) {
            this.searchBox.removeEventListener('input', this.handleSearchInput);
            this.searchBox.removeEventListener('keydown', this.boundHandleKeydown);
        }
        if (this.optionsContainer) {
            this.optionsContainer.removeEventListener('click', this.handleOptionsClick);
        }
        document.removeEventListener('click', this.handleDocumentClick);

        // Remove DOM elements
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Show original select
        if (this.originalSelect) {
            this.originalSelect.style.display = '';
        }

        // Clear references
        this.container = null;
        this.input = null;
        this.searchBox = null;
        this.optionsList = null;
        this.optionsContainer = null;
        this.originalSelect = null;
        this.filteredOptions = [];
    }
}