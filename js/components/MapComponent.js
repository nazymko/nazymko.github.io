// Map Component - Handles all map-related functionality
import { taxData, getTaxRateColor, getCountryVAT, formatVATInfo } from '../taxData.js';
import { getTaxAmountColor } from '../taxCalculator.js';

export class MapComponent {
    constructor(containerId = 'worldMap') {
        this.containerId = containerId;
        this.map = null;
        this.countryMarkers = {};
        this.countryLabels = {};
        this.currentTaxResults = [];
        this.loadingElement = null;
        this.expandedLabel = null; // Track which label is expanded
        this.isFullscreen = false;

        this.init();
    }

    // Initialize the map
    init() {
        this.createMap();
        this.addCountryMarkers();
        this.setupMapBounds();
        this.setupLoadingElement();
        this.setupFullscreenToggle();
    }

    // Create the Leaflet map
    createMap() {
        this.map = L.map(this.containerId).setView([20, 0], 2);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 2
        }).addTo(this.map);
    }

    // Add markers for each country
    addCountryMarkers() {
        Object.entries(taxData).forEach(([countryKey, countryInfo]) => {
            const marker = this.createCountryMarker(countryKey, countryInfo);
            this.countryMarkers[countryKey] = marker;
            marker.addTo(this.map);
        });
    }

    // Create individual country marker
    createCountryMarker(countryKey, countryInfo) {
        // Use neutral color for initial load (no calculation)
        const marker = L.circleMarker(countryInfo.coordinates, {
            radius: 8,
            fillColor: '#9e9e9e', // Neutral gray for no calculation
            color: '#333',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        });

        // Create initial popup
        this.updateMarkerPopup(marker, countryKey, countryInfo);

        // Add hover effects
        this.addMarkerHoverEffects(marker);

        // Create label placeholder (will be updated with tax data)
        this.createCountryLabel(countryKey, countryInfo);

        return marker;
    }

    // Create label for country
    createCountryLabel(countryKey, countryInfo) {
        // Calculate label position (slightly offset from marker)
        const labelPosition = [
            countryInfo.coordinates[0] + 2, // Offset latitude
            countryInfo.coordinates[1] + 3  // Offset longitude
        ];

        const label = L.marker(labelPosition, {
            icon: L.divIcon({
                className: 'country-tax-label compact',
                html: `<div class="tax-label-content compact" data-country="${countryKey}">
                    <div class="country-name">${countryInfo.name}</div>
                    <div class="tax-info">Enter salary to see taxes</div>
                </div>`,
                iconSize: [100, 30],
                iconAnchor: [0, 15]
            })
        });

        // Add click handler to open popup like marker click
        label.on('click', (e) => {
            e.originalEvent.stopPropagation();
            this.openCountryPopup(countryKey);
        });

        this.countryLabels[countryKey] = label;
        label.addTo(this.map);

        return label;
    }

    // Update marker popup content
    updateMarkerPopup(marker, countryKey, countryInfo, taxResult = null) {
        const vatInfo = getCountryVAT(countryKey);

        // Determine the main color scheme based on calculation state
        const isCalculated = taxResult !== null;
        const mainColor = isCalculated ? this.getTaxBurdenColor(taxResult.effectiveRate) : '#9e9e9e';
        const headerTextColor = isCalculated && taxResult.effectiveRate > 35 ? '#ffffff' : '#333333';

        // Build the standardized popup structure
        const popupContent = `
            <div class="unified-tax-popup">
                ${this.buildPopupHeader(countryInfo, mainColor, headerTextColor, isCalculated)}
                ${this.buildPopupBody(countryInfo, taxResult, vatInfo, mainColor, isCalculated)}
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 350,
            className: 'enhanced-tax-popup'
        });
    }

    // Build standardized popup header
    buildPopupHeader(countryInfo, color, textColor, isCalculated) {
        const icon = isCalculated ? '🏆' : '🌍';
        const statusText = isCalculated ? 'Calculated' : 'Ready for Calculation';

        return `
            <div class="popup-header" style="background: linear-gradient(135deg, ${color}, ${color}dd); color: ${textColor}; padding: 12px; margin: -10px -10px 10px -10px; border-radius: 8px 8px 0 0;">
                <div class="header-title">
                    <h4 style="margin: 0; font-size: 16px; display: flex; align-items: center; gap: 6px;">
                        <span>${icon}</span>
                        <span>${countryInfo.name}</span>
                    </h4>
                    <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">
                        ${countryInfo.system.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Tax System • ${statusText}
                    </div>
                </div>
            </div>
        `;
    }

    // Build standardized popup body
    buildPopupBody(countryInfo, taxResult, vatInfo, color, isCalculated) {
        return `
            <div class="popup-body" style="padding: 8px;">
                ${this.buildCountryInfoSection(countryInfo, vatInfo, color)}
                ${isCalculated ? this.buildTaxCalculationSection(taxResult, color) : this.buildPreCalculationSection(color)}
                ${isCalculated ? this.buildAdditionalInfoSection(countryInfo, taxResult, color) : ''}
            </div>
        `;
    }

    // Build country information section (consistent across all popups)
    buildCountryInfoSection(countryInfo, vatInfo, color) {
        return `
            <div class="country-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                <div class="info-card" style="background: linear-gradient(135deg, ${color}22, ${color}11); border: 1px solid ${color}44; border-radius: 6px; padding: 8px; text-align: center;">
                    <div style="font-size: 10px; color: ${color}; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Currency</div>
                    <div style="font-weight: bold; color: #333; margin-top: 2px;">${countryInfo.currency}</div>
                </div>
                <div class="info-card" style="background: linear-gradient(135deg, ${color}22, ${color}11); border: 1px solid ${color}44; border-radius: 6px; padding: 8px; text-align: center;">
                    <div style="font-size: 10px; color: ${color}; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">VAT Rate</div>
                    <div style="font-weight: bold; color: #333; margin-top: 2px; font-size: 12px;">
                        ${vatInfo && vatInfo.hasVAT ? `${vatInfo.standard}%` : 'No VAT'}
                    </div>
                </div>
            </div>
        `;
    }

    // Build tax calculation section
    buildTaxCalculationSection(taxResult, color) {
        const textColor = taxResult.effectiveRate > 35 ? '#ffffff' : '#333333';

        // Format all amounts
        const grossIncome = taxResult.grossIncomeInDisplayCurrency.toLocaleString();
        const totalTax = taxResult.taxAmountInDisplayCurrency.toLocaleString();
        const incomeTax = taxResult.incomeTaxInDisplayCurrency.toLocaleString();
        const vatAmount = taxResult.vatAmountInDisplayCurrency.toLocaleString();
        const netIncome = taxResult.netIncomeInDisplayCurrency.toLocaleString();

        // Calculate breakdown percentages
        const incomeTaxRate = taxResult.hasVAT ?
            ((taxResult.incomeTaxInDisplayCurrency / taxResult.grossIncomeInDisplayCurrency) * 100) :
            taxResult.effectiveRate;
        const vatRate = taxResult.hasVAT ?
            ((taxResult.vatAmountInDisplayCurrency / taxResult.grossIncomeInDisplayCurrency) * 100) : 0;

        return `
            <div class="tax-calculation-section">
                <!-- Gross Income -->
                <div class="calculation-row" style="background: #f8f9fa; border-radius: 6px; padding: 10px; margin-bottom: 8px; border-left: 4px solid ${color};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase;">📊 Annual Gross Income</div>
                            <div style="font-size: 10px; color: #888; margin-top: 1px;">Monthly × 12</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: #333; font-size: 14px;">${taxResult.displayCurrency} ${grossIncome}</div>
                            ${taxResult.currency !== taxResult.displayCurrency ? `<div style="font-size: 11px; color: #666; opacity: 0.8;">${taxResult.currency} ${taxResult.grossIncome.toLocaleString()}</div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Tax Breakdown -->
                <div class="tax-breakdown" style="background: linear-gradient(135deg, ${color}15, ${color}08); border: 1px solid ${color}33; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                    <div style="font-size: 11px; color: ${color}; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">💸 Tax Breakdown</div>

                    ${this.buildTaxBreakdownRows(taxResult, color, incomeTax, incomeTaxRate, vatAmount)}
                </div>

                <!-- Total Tax -->
                <div class="total-tax" style="background: ${color}; color: ${textColor}; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">💰 Total Tax Burden</div>
                            <div style="font-size: 10px; opacity: 0.9; margin-bottom: 6px;">${taxResult.effectiveRate.toFixed(1)}% effective rate</div>
                            ${this.buildTotalTaxDescription(taxResult, incomeTaxRate)}
                        </div>
                        <div style="text-align: right; margin-left: 10px;">
                            <div style="font-weight: bold; font-size: 14px;">${taxResult.displayCurrency} ${totalTax}</div>
                            ${taxResult.currency !== taxResult.displayCurrency ? `<div style="font-size: 11px; opacity: 0.8;">${taxResult.currency} ${taxResult.taxAmount.toLocaleString()}</div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Net Income -->
                <div class="net-income" style="background: linear-gradient(135deg, #28a74522, #28a74511); border: 1px solid #28a74544; border-radius: 6px; padding: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: #28a745; font-size: 12px;">💚 Net Annual Income</div>
                            <div style="font-size: 10px; color: #666;">After all taxes</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: #28a745; font-size: 14px;">${taxResult.displayCurrency} ${netIncome}</div>
                            ${taxResult.currency !== taxResult.displayCurrency ? `<div style="font-size: 11px; color: #28a745; opacity: 0.8;">${taxResult.currency} ${taxResult.netIncome.toLocaleString()}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Build tax breakdown rows
    buildTaxBreakdownRows(taxResult, color, incomeTax, incomeTaxRate, vatAmount) {
        const nativeIncomeTax = this.formatNumber(taxResult.incomeTax);
        const showNativeCurrency = taxResult.currency !== taxResult.displayCurrency;

        let rows = `
            <div class="breakdown-row" style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 6px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                <span style="color: #555; font-size: 11px;">🏛️ Income Tax (${incomeTaxRate.toFixed(1)}%)</span>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${incomeTax}</div>
                    ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeIncomeTax}</div>` : ''}
                </div>
            </div>
        `;

        // Add special taxes breakdown if available
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            for (const specialTax of taxResult.specialTaxesInDisplayCurrency) {
                const icon = this.getSpecialTaxIcon(specialTax.type);
                const displayAmount = this.formatNumber(specialTax.taxAmountInDisplayCurrency);
                const nativeAmount = this.formatNumber(specialTax.taxAmount);

                rows += `
                    <div class="breakdown-row" style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 6px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                        <span style="color: #555; font-size: 11px;" title="${specialTax.description}">${icon} ${this.formatSpecialTaxName(specialTax.type)} (${specialTax.rate}%)</span>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${displayAmount}</div>
                            ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeAmount}</div>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            const nativeVatAmount = this.formatNumber(taxResult.vatAmount);

            rows += `
                <div class="breakdown-row" style="display: flex; justify-content: space-between; padding: 6px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                    <span style="color: #555; font-size: 11px;">🛍️ VAT on Spending (${taxResult.vatRate}%)</span>
                    <div style="text-align: right;">
                        <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${vatAmount}</div>
                        ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeVatAmount}</div>` : ''}
                    </div>
                </div>
            `;
        }

        return rows;
    }

    // Build total tax description with breakdown in brackets
    buildTotalTaxDescription(taxResult, incomeTaxRate) {
        const taxComponents = [];

        // Income tax component
        const incomeTaxDisplay = this.formatNumber(taxResult.incomeTaxInDisplayCurrency);
        taxComponents.push(`Income Tax ${incomeTaxRate.toFixed(1)}%: ${taxResult.displayCurrency} ${incomeTaxDisplay}`);

        // Special taxes components
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            for (const specialTax of taxResult.specialTaxesInDisplayCurrency) {
                const displayAmount = this.formatNumber(specialTax.taxAmountInDisplayCurrency);
                const taxName = this.formatSpecialTaxName(specialTax.type);
                taxComponents.push(`${taxName} ${specialTax.rate}%: ${taxResult.displayCurrency} ${displayAmount}`);
            }
        }

        // VAT component
        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            const vatDisplay = this.formatNumber(taxResult.vatAmountInDisplayCurrency);
            taxComponents.push(`VAT on Spending ${taxResult.vatRate}%: ${taxResult.displayCurrency} ${vatDisplay}`);
        }

        if (taxComponents.length === 0) {
            return '<div style="font-size: 9px; opacity: 0.8; line-height: 1.3;">No tax breakdown available</div>';
        }

        return `<div style="font-size: 9px; opacity: 0.8; line-height: 1.3;">(${taxComponents.join(' + ')})</div>`;
    }

    // Get icon for special tax type
    getSpecialTaxIcon(taxType) {
        const iconMap = {
            'military_levy': '🛡️',
            'united_social_tax': '🤝',
            'social_security': '👥',
            'health_insurance': '🏥',
            'unemployment_insurance': '📋',
            'pension_contribution': '👴',
            'default': '💼'
        };
        return iconMap[taxType] || iconMap.default;
    }

    // Format special tax name for display
    formatSpecialTaxName(taxType) {
        const nameMap = {
            'military_levy': 'Military Levy',
            'united_social_tax': 'United Social Tax',
            'social_security': 'Social Security',
            'health_insurance': 'Health Insurance',
            'unemployment_insurance': 'Unemployment',
            'pension_contribution': 'Pension',
        };
        return nameMap[taxType] || taxType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Format number with proper localization
    formatNumber(number) {
        if (typeof number !== 'number') return '0';
        return number.toLocaleString();
    }

    // Build pre-calculation section
    buildPreCalculationSection(color) {
        return `
            <div class="pre-calculation-section">
                <div class="calculation-prompt" style="background: linear-gradient(135deg, ${color}33, ${color}22); border: 1px solid ${color}66; border-radius: 6px; padding: 12px; text-align: center;">
                    <div style="color: #666; font-weight: bold; margin-bottom: 6px; font-size: 12px;">💡 Tax Calculator Ready</div>
                    <div style="font-size: 11px; color: #888; line-height: 1.4;">Enter your monthly salary above to see detailed tax calculations and comparisons with other countries</div>
                </div>
            </div>
        `;
    }

    // Build additional information section
    buildAdditionalInfoSection(countryInfo, taxResult, color) {
        let additionalInfo = '';

        // Tax bracket information for progressive systems
        if (countryInfo.system === 'progressive') {
            const relevantBrackets = countryInfo.brackets.filter(bracket =>
                bracket.min <= taxResult.grossIncome &&
                (bracket.max === null || bracket.max >= taxResult.grossIncome)
            );

            if (relevantBrackets.length > 0) {
                const topBracket = relevantBrackets[relevantBrackets.length - 1];
                additionalInfo += `
                    <div class="tax-bracket-info" style="background: linear-gradient(135deg, ${color}15, ${color}08); border: 1px solid ${color}33; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 11px;">
                        <div style="font-weight: bold; margin-bottom: 4px; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">📈 Tax Bracket Details</div>
                        <div style="color: #555; margin-bottom: 2px;">Marginal Rate: <span style="font-weight: bold; color: ${color};">${topBracket.rate}%</span></div>
                        <div style="color: #555;">Effective Rate: <span style="font-weight: bold; color: ${color};">${taxResult.effectiveRate.toFixed(2)}%</span></div>
                    </div>
                `;
            }
        }

        // Exchange rate information
        if (taxResult.exchangeRate !== 1) {
            additionalInfo += `
                <div class="exchange-rate-info" style="background: linear-gradient(135deg, ${color}15, ${color}08); border: 1px solid ${color}33; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 11px;">
                    <div style="font-weight: bold; color: ${color}; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">💱 Exchange Rate</div>
                    <div style="color: #555;">1 ${taxResult.inputCurrency} = <span style="font-weight: bold; color: ${color};">${taxResult.exchangeRate.toFixed(4)} ${taxResult.currency}</span></div>
                </div>
            `;
        }

        return additionalInfo;
    }


    // Get color based on tax burden (green to red scale)
    getTaxBurdenColor(taxRate) {
        if (taxRate === 0) return '#28a745'; // Green for tax havens
        if (taxRate <= 10) return '#40c057'; // Light green
        if (taxRate <= 20) return '#69db7c'; // Green-yellow
        if (taxRate <= 30) return '#ffeb3b'; // Yellow
        if (taxRate <= 40) return '#ff9800'; // Orange
        if (taxRate <= 50) return '#f44336'; // Red
        if (taxRate <= 60) return '#d32f2f'; // Dark red
        return '#b71c1c'; // Very dark red for highest rates
    }

    // Add hover effects to markers
    addMarkerHoverEffects(marker) {
        marker.on('mouseover', function() {
            this.setStyle({
                radius: 10,
                weight: 2
            });
        });

        marker.on('mouseout', function() {
            this.setStyle({
                radius: 8,
                weight: 1
            });
        });
    }

    // Setup map bounds to prevent excessive panning
    setupMapBounds() {
        const southWest = L.latLng(-60, -180);
        const northEast = L.latLng(85, 180);
        const bounds = L.latLngBounds(southWest, northEast);

        this.map.setMaxBounds(bounds);
        this.map.on('drag', () => {
            this.map.panInsideBounds(bounds, { animate: false });
        });
    }

    // Setup loading element reference
    setupLoadingElement() {
        this.loadingElement = document.getElementById('mapLoading');
    }

    // Update map with tax calculation results
    updateWithTaxResults(results, displayCurrency) {
        this.currentTaxResults = results;

        if (results.length === 0) {
            this.resetToDefault();
            return;
        }

        this.updateMarkerColors(results);
        this.updateMarkerPopups(results, displayCurrency);
        this.updateCountryLabels(results, displayCurrency);
    }

    // Update marker colors based on tax rates (green to red)
    updateMarkerColors(results) {
        results.forEach(result => {
            const marker = this.countryMarkers[result.countryKey];
            if (marker) {
                const color = this.getTaxBurdenColor(result.effectiveRate);
                marker.setStyle({
                    fillColor: color,
                    color: '#333',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }
        });
    }

    // Update marker popups with tax results
    updateMarkerPopups(results, displayCurrency) {
        results.forEach(result => {
            const marker = this.countryMarkers[result.countryKey];
            const countryInfo = taxData[result.countryKey];

            if (marker && countryInfo) {
                this.updateMarkerPopup(marker, result.countryKey, countryInfo, result);
            }
        });
    }

    // Update country labels with tax information
    updateCountryLabels(results, displayCurrency) {
        results.forEach(result => {
            const label = this.countryLabels[result.countryKey];

            if (label) {
                this.updateLabelContent(result.countryKey, result, displayCurrency, false);
            }
        });
    }

    // Update individual label content (compact or expanded)
    updateLabelContent(countryKey, result, displayCurrency, isExpanded = false) {
        const label = this.countryLabels[countryKey];
        if (!label) return;

        // Format tax amount for display
        const taxAmount = result.taxAmountInDisplayCurrency.toLocaleString();
        const effectiveRate = result.effectiveRate.toFixed(1);

        // Determine if country has VAT for styling
        const hasVATClass = result.hasVAT && result.vatAmount > 0 ? 'has-vat' : 'no-vat';

        let labelHtml, iconSize, iconAnchor, className;

        if (isExpanded) {
            // Expanded view with full details
            const incomeTax = result.incomeTaxInDisplayCurrency.toLocaleString();
            const vatAmount = result.vatAmountInDisplayCurrency.toLocaleString();
            const netIncome = result.netIncomeInDisplayCurrency.toLocaleString();

            let vatBreakdown = '';
            if (result.hasVAT && result.vatAmountInDisplayCurrency > 0) {
                vatBreakdown = `
                    <div class="tax-breakdown-expanded">
                        <div class="breakdown-row">
                            <span class="breakdown-label">Income Tax:</span>
                            <span class="breakdown-value">${displayCurrency} ${incomeTax}</span>
                        </div>
                        <div class="breakdown-row">
                            <span class="breakdown-label">VAT (${result.vatRate}%):</span>
                            <span class="breakdown-value">${displayCurrency} ${vatAmount}</span>
                        </div>
                    </div>
                `;
            }

            labelHtml = `<div class="tax-label-content expanded ${hasVATClass}" data-country="${countryKey}">
                <div class="country-name">${result.countryName}
                    <span class="collapse-indicator">✕</span>
                </div>
                <div class="tax-amount-large">${displayCurrency} ${taxAmount}</div>
                <div class="tax-rate-large">${effectiveRate}% total rate</div>
                ${vatBreakdown}
                <div class="net-income">Net: ${displayCurrency} ${netIncome}</div>
                <div class="currency-info">${result.currency} → ${displayCurrency}</div>
            </div>`;

            className = 'country-tax-label expanded';
            iconSize = [200, 120];
            iconAnchor = [0, 60];
        } else {
            // Compact view
            labelHtml = `<div class="tax-label-content compact ${hasVATClass}" data-country="${countryKey}">
                <div class="country-name-compact">${result.countryName}</div>
                <div class="tax-amount-compact">${displayCurrency} ${taxAmount}</div>
                <div class="tax-rate-compact">${effectiveRate}%</div>
            </div>`;

            className = 'country-tax-label compact';
            iconSize = [110, 35];
            iconAnchor = [0, 17];
        }

        label.setIcon(L.divIcon({
            className: className,
            html: labelHtml,
            iconSize: iconSize,
            iconAnchor: iconAnchor
        }));
    }

    // Toggle label expansion
    toggleLabelExpansion(countryKey) {
        if (!this.currentTaxResults || this.currentTaxResults.length === 0) return;

        const result = this.currentTaxResults.find(r => r.countryKey === countryKey);
        if (!result) return;

        // Collapse currently expanded label if different country
        if (this.expandedLabel && this.expandedLabel !== countryKey) {
            const prevResult = this.currentTaxResults.find(r => r.countryKey === this.expandedLabel);
            if (prevResult) {
                this.updateLabelContent(this.expandedLabel, prevResult, result.displayCurrency, false);
            }
        }

        // Toggle current label
        const isCurrentlyExpanded = this.expandedLabel === countryKey;
        this.expandedLabel = isCurrentlyExpanded ? null : countryKey;

        this.updateLabelContent(countryKey, result, result.displayCurrency, !isCurrentlyExpanded);
    }

    // Reset map to default state
    resetToDefault() {
        Object.entries(this.countryMarkers).forEach(([countryKey, marker]) => {
            // Reset to neutral gray color
            marker.setStyle({
                fillColor: '#9e9e9e',
                color: '#333',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            });

            const countryInfo = taxData[countryKey];
            this.updateMarkerPopup(marker, countryKey, countryInfo);
        });

        // Reset labels to default state
        Object.entries(this.countryLabels).forEach(([countryKey, label]) => {
            const countryInfo = taxData[countryKey];
            if (countryInfo) {
                label.setIcon(L.divIcon({
                    className: 'country-tax-label compact',
                    html: `<div class="tax-label-content compact" data-country="${countryKey}">
                        <div class="country-name">${countryInfo.name}</div>
                        <div class="tax-info">Enter salary to see taxes</div>
                    </div>`,
                    iconSize: [100, 30],
                    iconAnchor: [0, 15]
                }));
            }
        });

        this.expandedLabel = null;
        this.currentTaxResults = [];
    }

    // Highlight specific country on map
    highlightCountry(countryKey) {
        // Reset all markers to normal size but preserve colors
        Object.entries(this.countryMarkers).forEach(([key, marker]) => {
            const result = this.currentTaxResults.find(r => r.countryKey === key);
            let fillColor = '#9e9e9e'; // Default neutral color

            if (result) {
                fillColor = this.getTaxBurdenColor(result.effectiveRate);
            }

            marker.setStyle({
                weight: 1,
                radius: 8,
                fillColor: fillColor,
                fillOpacity: result ? 0.8 : 0.7
            });
        });

        // Highlight selected country
        const marker = this.countryMarkers[countryKey];
        if (marker) {
            const result = this.currentTaxResults.find(r => r.countryKey === countryKey);
            let fillColor = '#9e9e9e';

            if (result) {
                fillColor = this.getTaxBurdenColor(result.effectiveRate);
            }

            marker.setStyle({
                weight: 3,
                radius: 12,
                fillColor: fillColor,
                fillOpacity: result ? 0.9 : 0.8
            });

            // Pan to country and open popup
            this.map.panTo(marker.getLatLng());
            marker.openPopup();
        }
    }

    // Open country popup (called by label clicks)
    openCountryPopup(countryKey) {
        const marker = this.countryMarkers[countryKey];
        if (marker) {
            // Pan to the country and open its popup
            this.map.panTo(marker.getLatLng());
            marker.openPopup();

            // Also highlight the country (optional - for visual feedback)
            this.highlightCountry(countryKey);
        }
    }

    // Show loading state
    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
    }

    // Hide loading state
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    // Get current tax results
    getCurrentResults() {
        return this.currentTaxResults;
    }

    // Setup fullscreen toggle functionality
    setupFullscreenToggle() {
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        if (!fullscreenBtn) return;

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Handle escape key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });
    }

    // Toggle fullscreen mode
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    // Enter fullscreen mode
    enterFullscreen() {
        const mapContainer = document.querySelector('.map-container');
        const expandIcon = document.querySelector('.expand-icon');
        const contractIcon = document.querySelector('.contract-icon');

        if (mapContainer && expandIcon && contractIcon) {
            // Add fullscreen classes
            mapContainer.classList.add('fullscreen');
            document.body.classList.add('map-fullscreen');

            // Switch icons
            expandIcon.style.display = 'none';
            contractIcon.style.display = 'block';

            this.isFullscreen = true;

            // Trigger map resize after transition
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 300);
        }
    }

    // Exit fullscreen mode
    exitFullscreen() {
        const mapContainer = document.querySelector('.map-container');
        const expandIcon = document.querySelector('.expand-icon');
        const contractIcon = document.querySelector('.contract-icon');

        if (mapContainer && expandIcon && contractIcon) {
            // Remove fullscreen classes
            mapContainer.classList.remove('fullscreen');
            document.body.classList.remove('map-fullscreen');

            // Switch icons back
            expandIcon.style.display = 'block';
            contractIcon.style.display = 'none';

            this.isFullscreen = false;

            // Trigger map resize after transition
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                }
            }, 300);
        }
    }

    // Destroy the map
    destroy() {
        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.exitFullscreen();
        }

        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.countryMarkers = {};
        this.currentTaxResults = [];
    }
}