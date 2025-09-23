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
        this.isGridView = false;
        this.fullscreenInputs = null;

        this.init();
    }

    // Initialize the map
    init() {
        this.createMap();
        this.addCountryMarkers();
        this.setupMapBounds();
        this.setupLoadingElement();
        this.setupFullscreenToggle();
        this.setupFullscreenInputs();
        this.setupGridView();
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
        // Calculate label position (right next to marker)
        const labelPosition = [
            countryInfo.coordinates[0] + 0.5, // Small offset latitude (0.5 degrees ≈ 55km)
            countryInfo.coordinates[1] + 1.0   // Small offset longitude (1 degree ≈ 60-110km depending on latitude)
        ];

        const label = L.marker(labelPosition, {
            icon: L.divIcon({
                className: 'country-tax-label compact',
                html: `<div class="tax-label-content compact" data-country="${countryKey}">
                    <div class="country-name">${countryInfo.name}</div>
                    <div class="tax-info">Enter salary to see taxes</div>
                </div>`,
                iconSize: [100, 30],
                iconAnchor: [-10, 15]  // Offset left to position next to marker
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
            <div class="breakdown-row income-tax-row" style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 6px; background: rgba(255,255,255,0.7); border-radius: 4px; cursor: pointer; transition: all 0.2s ease;"
                 onmouseover="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateX(3px)'"
                 onmouseout="this.style.background='rgba(255,255,255,0.7)'; this.style.transform='translateX(0px)'"
                 onclick="window.taxCalculatorApp.components.map.showIncomeTaxDetails('${taxResult.countryKey}', '${taxResult.grossIncome}', event)">
                <span style="color: #555; font-size: 11px;">🏛️ Income Tax (${incomeTaxRate.toFixed(1)}%) <span style="color: #007bff; font-size: 10px;">ℹ️ Click for details</span></span>
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

    // Get best text color (white or black) for given background color
    getLabelTextColor(backgroundColor) {
        // For yellow and light colors, use dark text
        if (backgroundColor === '#ffeb3b' || backgroundColor === '#69db7c' || backgroundColor === '#40c057' || backgroundColor === '#28a745') {
            return '#333333';
        }
        // For darker colors, use white text
        return '#ffffff';
    }

    // Generate short tax source description using actual tax rates
    getTaxSourceInfo(taxResult) {
        const sources = [];

        // Check for income tax - calculate effective rate
        if (taxResult.incomeTaxInDisplayCurrency > 0) {
            const incomeRate = ((taxResult.incomeTaxInDisplayCurrency / taxResult.grossIncomeInDisplayCurrency) * 100).toFixed(0);
            sources.push(`${incomeRate}% Income`);
        }

        // Check for special taxes - show combined rate
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            const specialTaxTotal = taxResult.specialTaxesInDisplayCurrency.reduce((sum, tax) => sum + tax.taxAmountInDisplayCurrency, 0);
            const specialRate = ((specialTaxTotal / taxResult.grossIncomeInDisplayCurrency) * 100).toFixed(0);
            sources.push(`${specialRate}% Social`);
        }

        // Check for VAT - use the actual VAT rate from config
        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            sources.push(`${taxResult.vatRate}% VAT`);
        }

        return sources.length > 0 ? sources.join(' + ') : 'Tax Components';
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

        // Update grid view if active
        if (this.isGridView) {
            this.populateGridView();
        }
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

        // Get color based on tax burden level
        const taxBurdenColor = this.getTaxBurdenColor(result.effectiveRate);
        const textColor = this.getLabelTextColor(taxBurdenColor);

        // Get tax source information
        const taxSourceInfo = this.getTaxSourceInfo(result);

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

            labelHtml = `<div class="tax-label-content expanded ${hasVATClass}" data-country="${countryKey}" style="background: ${taxBurdenColor}; color: ${textColor}; border: 2px solid ${taxBurdenColor};">
                <div class="country-name" style="color: ${textColor}; font-weight: bold;">${result.countryName}
                    <span class="collapse-indicator">✕</span>
                </div>
                <div class="tax-amount-large" style="color: ${textColor};">${displayCurrency} ${taxAmount}</div>
                <div class="tax-rate-large" style="color: ${textColor};">${effectiveRate}% total rate</div>
                <div class="tax-source-expanded" style="color: ${textColor}; font-size: 10px; opacity: 0.9; margin: 2px 0;">${taxSourceInfo}</div>
                ${vatBreakdown}
                <div class="net-income" style="color: ${textColor}; opacity: 0.9;">Net: ${displayCurrency} ${netIncome}</div>
                <div class="currency-info" style="color: ${textColor}; opacity: 0.8;">${result.currency} → ${displayCurrency}</div>
            </div>`;

            className = 'country-tax-label expanded';
            iconSize = [200, 120];
            iconAnchor = [-20, 60];  // Offset left for expanded view
        } else {
            // Compact view
            labelHtml = `<div class="tax-label-content compact ${hasVATClass}" data-country="${countryKey}" style="background: ${taxBurdenColor}; color: ${textColor}; border: 2px solid ${taxBurdenColor};">
                <div class="country-name-compact" style="color: ${textColor}; font-weight: bold;">${result.countryName}</div>
                <div class="tax-amount-compact" style="color: ${textColor};">${displayCurrency} ${taxAmount}</div>
                <div class="tax-rate-compact" style="color: ${textColor}; font-weight: bold;">${effectiveRate}%</div>
                <div class="tax-source-compact" style="color: ${textColor}; font-size: 8px; opacity: 0.9; margin-top: 1px;">${taxSourceInfo}</div>
            </div>`;

            className = 'country-tax-label compact';
            iconSize = [110, 35];
            iconAnchor = [-10, 17];  // Offset left for compact view
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
                    iconAnchor: [-10, 15]  // Offset left to position next to marker
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

            // Sync fullscreen inputs with main inputs
            this.syncFullscreenInputs();

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

    // Setup fullscreen input functionality
    setupFullscreenInputs() {
        this.fullscreenInputs = {
            salary: document.getElementById('fullscreenSalary'),
            inputCurrency: document.getElementById('fullscreenInputCurrency'),
            displayCurrency: document.getElementById('fullscreenDisplayCurrency')
        };

        // Sync with main inputs when entering fullscreen
        if (this.fullscreenInputs.salary && this.fullscreenInputs.inputCurrency && this.fullscreenInputs.displayCurrency) {
            const mainSalary = document.getElementById('salary');
            const mainInputCurrency = document.getElementById('inputCurrency');
            const mainDisplayCurrency = document.getElementById('displayCurrency');

            if (mainSalary && mainInputCurrency && mainDisplayCurrency) {
                // Sync values on input change
                [this.fullscreenInputs.salary, mainSalary].forEach(input => {
                    input.addEventListener('input', (e) => {
                        const value = e.target.value;
                        [this.fullscreenInputs.salary, mainSalary].forEach(syncInput => {
                            if (syncInput !== e.target) {
                                syncInput.value = value;
                            }
                        });
                        // Trigger calculation
                        mainSalary.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                });

                [this.fullscreenInputs.inputCurrency, mainInputCurrency].forEach(select => {
                    select.addEventListener('change', (e) => {
                        const value = e.target.value;
                        [this.fullscreenInputs.inputCurrency, mainInputCurrency].forEach(syncSelect => {
                            if (syncSelect !== e.target) {
                                syncSelect.value = value;
                            }
                        });
                        // Trigger calculation
                        mainInputCurrency.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                });

                [this.fullscreenInputs.displayCurrency, mainDisplayCurrency].forEach(select => {
                    select.addEventListener('change', (e) => {
                        const value = e.target.value;
                        [this.fullscreenInputs.displayCurrency, mainDisplayCurrency].forEach(syncSelect => {
                            if (syncSelect !== e.target) {
                                syncSelect.value = value;
                            }
                        });
                        // Trigger calculation
                        mainDisplayCurrency.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                });
            }
        }
    }

    // Sync fullscreen inputs with main inputs
    syncFullscreenInputs() {
        const mainSalary = document.getElementById('salary');
        const mainInputCurrency = document.getElementById('inputCurrency');
        const mainDisplayCurrency = document.getElementById('displayCurrency');

        if (this.fullscreenInputs.salary && mainSalary) {
            this.fullscreenInputs.salary.value = mainSalary.value;
        }

        if (this.fullscreenInputs.inputCurrency && mainInputCurrency) {
            this.fullscreenInputs.inputCurrency.value = mainInputCurrency.value;
        }

        if (this.fullscreenInputs.displayCurrency && mainDisplayCurrency) {
            this.fullscreenInputs.displayCurrency.value = mainDisplayCurrency.value;
        }
    }

    // Setup grid view functionality
    setupGridView() {
        const viewToggleBtn = document.getElementById('fullscreenViewToggle');
        if (!viewToggleBtn) return;

        viewToggleBtn.addEventListener('click', () => {
            this.toggleGridView();
        });
    }

    // Toggle between map and grid view
    toggleGridView() {
        const mapContainer = document.querySelector('.map-container');
        const gridIcon = document.querySelector('.grid-icon');
        const mapIcon = document.querySelector('.map-icon');

        if (!mapContainer || !gridIcon || !mapIcon) return;

        this.isGridView = !this.isGridView;

        if (this.isGridView) {
            mapContainer.classList.add('grid-view');
            gridIcon.style.display = 'none';
            mapIcon.style.display = 'block';
            this.populateGridView();
        } else {
            mapContainer.classList.remove('grid-view');
            gridIcon.style.display = 'block';
            mapIcon.style.display = 'none';
        }
    }

    // Populate grid view with country cards
    populateGridView() {
        const labelsGrid = document.getElementById('labelsGrid');
        if (!labelsGrid || !this.currentTaxResults || this.currentTaxResults.length === 0) return;

        labelsGrid.innerHTML = '';

        // Sort results by tax amount
        const sortedResults = [...this.currentTaxResults].sort((a, b) =>
            a.taxAmountInDisplayCurrency - b.taxAmountInDisplayCurrency
        );

        sortedResults.forEach(result => {
            const card = this.createGridCard(result);
            labelsGrid.appendChild(card);
        });
    }

    // Create individual grid card
    createGridCard(result) {
        const card = document.createElement('div');
        const taxBurdenColor = this.getTaxBurdenColor(result.effectiveRate);
        const taxSourceInfo = this.getTaxSourceInfo(result);

        // Format amounts
        const taxAmount = result.taxAmountInDisplayCurrency.toLocaleString();
        const effectiveRate = result.effectiveRate.toFixed(1);
        const netIncome = result.netIncomeInDisplayCurrency.toLocaleString();

        // Create breakdown if VAT is present
        let vatBreakdown = '';
        if (result.hasVAT && result.vatAmountInDisplayCurrency > 0) {
            const incomeTax = result.incomeTaxInDisplayCurrency.toLocaleString();
            const vatAmount = result.vatAmountInDisplayCurrency.toLocaleString();

            vatBreakdown = `
                <div class="grid-breakdown">
                    <div class="grid-breakdown-row">
                        <span class="grid-breakdown-label">Income Tax:</span>
                        <span class="grid-breakdown-value">${result.displayCurrency} ${incomeTax}</span>
                    </div>
                    <div class="grid-breakdown-row">
                        <span class="grid-breakdown-label">VAT (${result.vatRate}%):</span>
                        <span class="grid-breakdown-value">${result.displayCurrency} ${vatAmount}</span>
                    </div>
                </div>
            `;
        }

        card.className = 'grid-label-card';
        card.style.background = `linear-gradient(135deg, ${taxBurdenColor} 0%, ${this.darkenColor(taxBurdenColor, 20)} 100%)`;
        card.dataset.country = result.countryKey;

        card.innerHTML = `
            <div class="grid-card-header">
                <div class="grid-country-name">${result.countryName}</div>
                <div class="grid-tax-amount">${result.displayCurrency} ${taxAmount}</div>
                <div class="grid-tax-rate">${effectiveRate}% total rate</div>
                <div class="grid-tax-source">${taxSourceInfo}</div>
            </div>
            <div class="grid-card-body">
                ${vatBreakdown}
                <div class="grid-net-income">Net: ${result.displayCurrency} ${netIncome}</div>
                <div class="grid-currency-info">${result.currency} → ${result.displayCurrency}</div>
            </div>
        `;

        // Add click handler to open country popup
        card.addEventListener('click', () => {
            this.openCountryPopup(result.countryKey);
        });

        return card;
    }

    // Show detailed income tax bracket information
    showIncomeTaxDetails(countryKey, annualIncome, event) {
        event.stopPropagation(); // Prevent popup from closing

        // Remove any existing bracket panel
        this.removeBracketPanel();

        const countryInfo = taxData[countryKey];
        if (!countryInfo) return;

        // Validate and parse annual income
        const parsedIncome = parseFloat(annualIncome);
        if (isNaN(parsedIncome) || parsedIncome <= 0) {
            console.warn('Invalid annual income for tax bracket calculation:', annualIncome);
            return;
        }

        // Find the corresponding tax result for currency conversion
        let taxResult = null;
        if (this.currentTaxResults) {
            taxResult = this.currentTaxResults.find(result => result.countryKey === countryKey);
        }

        // Create the bracket details panel
        this.createBracketPanel(countryKey, countryInfo, parsedIncome, event, taxResult);
    }

    // Create bracket details panel to the right of popup
    createBracketPanel(countryKey, countryInfo, annualIncome, event, taxResult = null) {
        // Find the popup element
        const popup = document.querySelector('.leaflet-popup-content');
        if (!popup) return;

        const popupContainer = popup.closest('.leaflet-popup');
        if (!popupContainer) return;

        // Get popup position and dimensions
        const popupRect = popupContainer.getBoundingClientRect();
        const mapContainer = document.getElementById(this.containerId);
        const mapRect = mapContainer.getBoundingClientRect();

        // Create bracket panel
        const bracketPanel = document.createElement('div');
        bracketPanel.id = 'tax-bracket-panel';
        bracketPanel.className = 'tax-bracket-panel';
        bracketPanel.tabIndex = -1; // Make it focusable but not tabbable

        // Position panel to the right of popup
        const panelLeft = popupRect.right - mapRect.left + 10;
        const panelTop = popupRect.top - mapRect.top;

        bracketPanel.style.cssText = `
            position: absolute;
            left: ${panelLeft}px;
            top: ${panelTop}px;
            width: 320px;
            max-height: 400px;
            background: white;
            border: 2px solid #007bff;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10000;
            overflow-y: auto;
            overflow-x: hidden;
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease-out;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        `;

        // Generate content
        const content = this.generateDetailedBracketContent(countryInfo, annualIncome, taxResult);
        bracketPanel.innerHTML = content;

        // Add close button functionality
        bracketPanel.addEventListener('click', (e) => {
            if (e.target.classList.contains('bracket-close-btn')) {
                this.removeBracketPanel();
            }
        });

        // Ensure mouse wheel scrolling works properly
        bracketPanel.addEventListener('wheel', (e) => {
            // Allow the panel to scroll with mouse wheel
            e.stopPropagation();
        }, { passive: true });

        // Focus the panel to ensure it can receive scroll events
        setTimeout(() => {
            if (bracketPanel.scrollHeight > bracketPanel.clientHeight) {
                bracketPanel.focus();
                // Add a subtle visual indicator that it's scrollable
                bracketPanel.style.cursor = 'default';
            }
        }, 100);

        // Add to map container
        mapContainer.appendChild(bracketPanel);

        // Auto-remove when popup closes or on escape key
        document.addEventListener('keydown', this.handleBracketPanelEscape.bind(this));

        // Auto-remove when clicking outside the panel or popup
        document.addEventListener('click', this.handleBracketPanelOutsideClick.bind(this), true);

        // Store reference for cleanup
        this.currentBracketPanel = bracketPanel;
    }

    // Remove bracket panel
    removeBracketPanel() {
        const existingPanel = document.getElementById('tax-bracket-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        document.removeEventListener('keydown', this.handleBracketPanelEscape);
        document.removeEventListener('click', this.handleBracketPanelOutsideClick, true);
        this.currentBracketPanel = null;
    }

    // Handle escape key for bracket panel
    handleBracketPanelEscape(event) {
        if (event.key === 'Escape') {
            this.removeBracketPanel();
        }
    }

    // Handle clicking outside bracket panel
    handleBracketPanelOutsideClick(event) {
        const bracketPanel = document.getElementById('tax-bracket-panel');
        const popup = document.querySelector('.leaflet-popup');

        if (bracketPanel && popup) {
            const clickedInsidePanel = bracketPanel.contains(event.target);
            const clickedInsidePopup = popup.contains(event.target);

            if (!clickedInsidePanel && !clickedInsidePopup) {
                this.removeBracketPanel();
            }
        }
    }

    // Generate detailed bracket content with individual calculations
    generateDetailedBracketContent(countryInfo, annualIncome, taxResult = null) {
        const { system, brackets, currency, name } = countryInfo;

        // Helper function to format amounts in both local and input currency
        const formatAmountWithInputCurrency = (localAmount) => {
            const localFormatted = `${currency} ${Math.round(localAmount).toLocaleString()}`;
            if (taxResult && taxResult.inputCurrency && taxResult.exchangeRate && taxResult.inputCurrency !== currency) {
                const inputAmount = localAmount / taxResult.exchangeRate;
                const inputFormatted = `${taxResult.inputCurrency} ${Math.round(inputAmount).toLocaleString()}`;
                return `
                    <div style="font-weight: bold;">${localFormatted}</div>
                    <div style="font-size: 10px; color: #666; opacity: 0.8;">(${inputFormatted})</div>
                `;
            }
            return `<div style="font-weight: bold;">${localFormatted}</div>`;
        };

        // Validate annual income
        if (isNaN(annualIncome) || annualIncome <= 0) {
            return `
                <div style="padding: 20px; text-align: center; color: #dc3545;">
                    <div style="font-size: 16px; margin-bottom: 10px;">⚠️ Invalid Income Data</div>
                    <div style="font-size: 12px;">Unable to calculate tax brackets. Please ensure a valid salary is entered.</div>
                </div>
            `;
        }

        let content = `
            <div class="bracket-panel-header" style="padding: 15px; border-bottom: 2px solid #e9ecef; background: linear-gradient(135deg, #007bff, #0056b3); color: white; border-radius: 10px 10px 0 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${name}</h3>
                        <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">Tax Bracket Breakdown</p>
                    </div>
                    <button class="bracket-close-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
                </div>
                <div style="margin-top: 8px; font-size: 12px; background: rgba(255,255,255,0.1); padding: 6px 10px; border-radius: 6px;">
                    Annual Income: ${currency} ${annualIncome.toLocaleString()}
                </div>
            </div>
            <div class="bracket-panel-body" style="padding: 15px;">
        `;

        if (system === 'flat') {
            const rate = brackets[0].rate;
            const totalTax = annualIncome * (rate / 100);

            content += `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 18px; font-weight: bold; color: #007bff; margin-bottom: 10px;">📊 Flat Tax System</div>

                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #2196f3;">
                        <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${rate}%</div>
                        <div style="font-size: 12px; color: #666;">flat rate on all income from ${currency} 0</div>
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; margin-bottom: 15px;">
                        <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Tax Calculation:</div>
                        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                            ${currency} ${annualIncome.toLocaleString()} × ${rate}% =
                        </div>
                        <div style="font-size: 20px; color: #d63384; margin-bottom: 8px;">
                            ${formatAmountWithInputCurrency(totalTax)}
                        </div>
                        <div style="font-size: 12px; color: #28a745;">
                            Net Income: ${formatAmountWithInputCurrency(annualIncome - totalTax)}
                        </div>
                    </div>

                    <div style="background: rgba(0, 123, 255, 0.1); padding: 12px; border-radius: 6px; border: 1px solid #007bff;">
                        <div style="font-size: 11px; color: #007bff; font-weight: bold; margin-bottom: 4px;">ℹ️ How Flat Tax Works</div>
                        <div style="font-size: 10px; color: #666; line-height: 1.4;">
                            Every ${currency} you earn is taxed at exactly ${rate}%, regardless of income level. No brackets, no complexity.
                        </div>
                    </div>
                </div>
            `;
        } else if (system === 'progressive') {
            content += `
                <div style="font-size: 14px; font-weight: bold; color: #007bff; margin-bottom: 12px; text-align: center;">📊 Progressive Tax Brackets</div>
            `;

            let totalTax = 0;
            let highestActiveBracket = -1;

            // Calculate which brackets are active and tax amounts
            brackets.forEach((bracket, index) => {
                const min = bracket.min;
                const max = bracket.max;

                // A bracket is active if income exceeds its minimum
                if (annualIncome > min) {
                    highestActiveBracket = index;
                }
            });

            // Second pass: display all brackets with calculations
            brackets.forEach((bracket, index) => {
                const min = bracket.min;
                const max = bracket.max;
                const rate = bracket.rate;

                // Calculate tax for this bracket using progressive logic
                let taxableInThisBracket = 0;
                let taxFromThisBracket = 0;

                // Check if this bracket applies to the income
                if (annualIncome > min) {
                    // Calculate the upper bound for this bracket
                    const upperBound = max === null ? annualIncome : Math.min(max, annualIncome);

                    // Taxable amount in this bracket is the difference
                    taxableInThisBracket = upperBound - min;

                    // Only count if the taxable amount is positive
                    if (taxableInThisBracket > 0) {
                        taxFromThisBracket = taxableInThisBracket * (rate / 100);
                        totalTax += taxFromThisBracket;
                    }
                }

                const isActive = taxableInThisBracket > 0;
                const isHighestActive = index === highestActiveBracket && isActive;

                // Styling based on bracket status
                let backgroundColor, borderColor, textColor;
                if (isHighestActive) {
                    backgroundColor = '#e8f5e8';
                    borderColor = '#28a745';
                    textColor = '#155724';
                } else if (isActive) {
                    backgroundColor = '#fff3cd';
                    borderColor = '#ffc107';
                    textColor = '#856404';
                } else {
                    backgroundColor = '#f8f9fa';
                    borderColor = '#dee2e6';
                    textColor = '#6c757d';
                }

                const maxDisplay = max === null ? '∞' : max.toLocaleString();
                const statusIcon = isHighestActive ? '🎯' : isActive ? '✅' : '⚪';

                content += `
                    <div style="margin-bottom: 8px; padding: 12px; background: ${backgroundColor}; border: 2px solid ${borderColor}; border-radius: 8px; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-weight: bold; color: ${textColor}; font-size: 12px;">
                                ${statusIcon} ${currency} ${min.toLocaleString()} - ${maxDisplay}
                            </span>
                            <span style="background: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; border: 1px solid ${borderColor};">
                                ${rate}%
                            </span>
                        </div>
                        ${isActive ? `
                            <div style="font-size: 11px; color: ${textColor}; margin-bottom: 4px;">
                                Taxable amount: ${currency} ${Math.round(taxableInThisBracket).toLocaleString()}
                            </div>
                            <div style="font-size: 12px; color: #d63384;">
                                Tax from this bracket: ${formatAmountWithInputCurrency(taxFromThisBracket)}
                            </div>
                        ` : `
                            <div style="font-size: 11px; color: ${textColor}; font-style: italic;">
                                ${annualIncome <= min ? 'Income below this bracket' : 'No tax in this bracket'}
                            </div>
                        `}
                        ${isHighestActive ? `
                            <div style="margin-top: 6px; padding: 4px 8px; background: rgba(40, 167, 69, 0.1); border-radius: 4px; border-left: 3px solid #28a745;">
                                <div style="font-size: 10px; color: #28a745; font-weight: bold;">🎯 YOUR CURRENT BRACKET</div>
                            </div>
                            ${this.generateNextBracketInfo(brackets, index, annualIncome, currency)}
                        ` : ''}
                    </div>
                `;
            });

            content += `
                <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 8px; border: 2px solid #2196f3;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #1976d2; margin-bottom: 4px;">TOTAL INCOME TAX</div>
                        <div style="font-size: 20px; color: #0d47a1;">${formatAmountWithInputCurrency(totalTax)}</div>
                        <div style="font-size: 11px; color: #1976d2; margin-top: 4px;">
                            Effective Rate: ${((totalTax / annualIncome) * 100).toFixed(1)}%
                        </div>
                        <div style="font-size: 10px; color: #1976d2; margin-top: 2px; opacity: 0.8;">
                            Net Income: ${formatAmountWithInputCurrency(annualIncome - totalTax)}
                        </div>
                    </div>
                </div>
            `;
        }

        content += `
            </div>
            <div style="padding: 10px 15px; background: #f8f9fa; border-radius: 0 0 10px 10px; border-top: 1px solid #dee2e6;">
                <div style="font-size: 10px; color: #6c757d; text-align: center;">
                    💡 Click outside or press ESC to close
                </div>
            </div>
        `;

        return content;
    }

    // Generate detailed tax bracket information
    generateTaxBracketDetails(countryInfo, annualIncome) {
        const { system, brackets, currency } = countryInfo;

        if (system === 'flat') {
            const rate = brackets[0].rate;
            return `
                <div style="font-size: 11px; color: #333;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #007bff;">📊 Flat Tax System</div>
                    <div style="margin-bottom: 4px;">
                        <span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px; font-weight: bold;">
                            ${rate}% flat rate on all income from ${currency} 0
                        </span>
                    </div>
                    <div style="font-size: 10px; color: #666; margin-top: 6px;">
                        💡 This country applies a single tax rate to all income levels starting from the first ${currency} earned.
                    </div>
                </div>
            `;
        } else if (system === 'progressive') {
            let bracketDetails = `
                <div style="font-size: 11px; color: #333;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #007bff;">📊 Progressive Tax Brackets</div>
                    <div style="font-size: 10px; color: #666; margin-bottom: 8px;">Your annual income: ${currency} ${annualIncome.toLocaleString()}</div>
            `;

            let totalTax = 0;
            let remainingIncome = annualIncome;

            brackets.forEach((bracket, index) => {
                const min = bracket.min;
                const max = bracket.max;
                const rate = bracket.rate;

                // Calculate how much income falls in this bracket
                const bracketStart = min;
                const bracketEnd = max === null ? Infinity : max;

                let taxableInThisBracket = 0;
                if (annualIncome > bracketStart) {
                    const incomeUpToBracketEnd = Math.min(annualIncome, bracketEnd);
                    taxableInThisBracket = incomeUpToBracketEnd - bracketStart;
                }

                const taxFromThisBracket = taxableInThisBracket * (rate / 100);
                totalTax += taxFromThisBracket;

                const isCurrentBracket = taxableInThisBracket > 0;
                const backgroundColor = isCurrentBracket ? '#e8f5e8' : '#f8f9fa';
                const borderColor = isCurrentBracket ? '#28a745' : '#dee2e6';
                const textWeight = isCurrentBracket ? 'bold' : 'normal';

                const maxDisplay = max === null ? '∞' : max.toLocaleString();

                bracketDetails += `
                    <div style="margin-bottom: 4px; padding: 6px; background: ${backgroundColor}; border: 1px solid ${borderColor}; border-radius: 4px; font-weight: ${textWeight};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${currency} ${min.toLocaleString()} - ${maxDisplay}</span>
                            <span style="background: #fff; padding: 2px 6px; border-radius: 3px; font-size: 10px; border: 1px solid ${borderColor};">${rate}%</span>
                        </div>
                        ${isCurrentBracket ? `<div style="font-size: 10px; color: #28a745; margin-top: 2px;">✓ Your tax: ${currency} ${taxFromThisBracket.toFixed(2)}</div>` : ''}
                    </div>
                `;
            });

            bracketDetails += `
                    <div style="margin-top: 8px; padding: 6px; background: #e3f2fd; border-radius: 4px; font-weight: bold;">
                        Total Income Tax: ${currency} ${totalTax.toFixed(2)}
                    </div>
                </div>
            `;

            return bracketDetails;
        } else {
            return `
                <div style="font-size: 11px; color: #333;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #007bff;">📊 Tax System Information</div>
                    <div style="margin-bottom: 4px;">
                        Tax system: ${system}
                    </div>
                    <div style="font-size: 10px; color: #666;">
                        Detailed bracket information not available for this tax system.
                    </div>
                </div>
            `;
        }
    }

    // Generate information about the next tax bracket
    generateNextBracketInfo(brackets, currentBracketIndex, currentIncome, currency) {
        // Check if there's a next bracket
        const nextBracketIndex = currentBracketIndex + 1;
        if (nextBracketIndex >= brackets.length) {
            // This is the highest bracket
            return `
                <div style="margin-top: 8px; padding: 6px 8px; background: rgba(108, 117, 125, 0.1); border-radius: 4px; border-left: 3px solid #6c757d;">
                    <div style="font-size: 10px; color: #6c757d; font-weight: bold;">🏆 HIGHEST TAX BRACKET</div>
                    <div style="font-size: 9px; color: #6c757d; margin-top: 2px;">
                        You're in the top tax bracket. All additional income is taxed at ${brackets[currentBracketIndex].rate}%.
                    </div>
                </div>
            `;
        }

        const nextBracket = brackets[nextBracketIndex];
        const currentBracket = brackets[currentBracketIndex];

        // Calculate how much more income is needed to reach the next bracket
        const nextBracketStart = nextBracket.min;
        const incomeNeededForNextBracket = nextBracketStart - currentIncome;

        // Calculate additional tax that would be paid in the next bracket
        // (This is just for the first dollar in the next bracket)
        const currentTaxRate = currentBracket.rate;
        const nextTaxRate = nextBracket.rate;
        const rateDifference = nextTaxRate - currentTaxRate;

        if (incomeNeededForNextBracket > 0) {
            // Calculate examples of additional tax for common amounts
            const example1Amount = Math.min(1000, incomeNeededForNextBracket);
            const example2Amount = Math.min(10000, incomeNeededForNextBracket);

            const example1Tax = example1Amount * (currentTaxRate / 100);
            const example2Tax = example2Amount * (currentTaxRate / 100);

            return `
                <div style="margin-top: 8px; padding: 6px 8px; background: rgba(255, 193, 7, 0.1); border-radius: 4px; border-left: 3px solid #ffc107;">
                    <div style="font-size: 10px; color: #856404; font-weight: bold;">📈 NEXT BRACKET INFO</div>
                    <div style="font-size: 9px; color: #856404; margin-top: 3px; line-height: 1.3;">
                        <div style="margin-bottom: 3px; font-weight: bold;">
                            Need <strong>+${currency} ${Math.round(incomeNeededForNextBracket).toLocaleString()}</strong> to reach ${nextTaxRate}% bracket
                        </div>
                        <div style="margin-bottom: 3px; padding: 3px; background: rgba(255,255,255,0.3); border-radius: 3px;">
                            <div style="font-size: 8px; margin-bottom: 1px;">💡 Tax on additional income:</div>
                            <div style="font-size: 8px;">+${currency} ${example1Amount.toLocaleString()} → +${currency} ${Math.round(example1Tax).toLocaleString()} tax</div>
                            ${example2Amount > example1Amount ? `<div style="font-size: 8px;">+${currency} ${example2Amount.toLocaleString()} → +${currency} ${Math.round(example2Tax).toLocaleString()} tax</div>` : ''}
                        </div>
                        <div style="font-size: 8px; opacity: 0.8;">
                            Future income will be taxed at ${nextTaxRate}% (+${rateDifference}% more)
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Edge case: somehow already in or past the next bracket
            return '';
        }
    }

    // Helper function to darken a color
    darkenColor(color, percent) {
        // Simple color darkening - convert hex to rgb and reduce values
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * percent / 100));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * percent / 100));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * percent / 100));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Handle language change
    handleLanguageChange() {
        // Update map popups if there are current results
        if (this.currentTaxResults && this.currentTaxResults.length > 0) {
            // Get current display currency from the first result
            const displayCurrency = this.currentTaxResults[0].displayCurrency;
            this.updateMarkerPopups(this.currentTaxResults, displayCurrency);
            this.updateCountryLabels(this.currentTaxResults, displayCurrency);
        }

        // Update grid view if it's currently active
        if (document.querySelector('.labels-grid').style.display !== 'none') {
            this.updateGridView();
        }

        console.log('🗺️ Map component language updated');
    }

    // Destroy the map
    destroy() {
        // Exit fullscreen if active
        if (this.isFullscreen) {
            this.exitFullscreen();
        }

        // Remove bracket panel if active
        this.removeBracketPanel();

        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.countryMarkers = {};
        this.currentTaxResults = [];
    }
}
