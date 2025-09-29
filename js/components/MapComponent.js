// Map Component - Handles all map-related functionality
import { taxData, getTaxRateColor, getCountryVAT, formatVATInfo } from '../taxData.js';
import { getTaxAmountColor } from '../taxCalculator.js';

export class MapComponent {
    constructor(containerId = 'worldMap') {
        this.containerId = containerId;
        this.map = null;
        this.countryMarkers = {};
        this.countryLabels = {};
        this.countryNameLabels = {}; // Labels showing just country names that pop from markers
        this.currentTaxResults = [];
        this.loadingElement = null;
        this.expandedLabel = null; // Track which label is expanded
        this.isFullscreen = false;
        this.isGridView = false;
        this.fullscreenInputs = null;
        // Check initial compact UI state from checkbox (default to full mode)
        const compactUICheckbox = document.getElementById('compactUI');
        this.compactUI = compactUICheckbox ? compactUICheckbox.checked : false;

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

            // Create country name label that pops from the marker
            this.createCountryNameLabel(countryKey, countryInfo);
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

    // Calculate appropriate label offset to position near marker
    calculateLabelOffset(coordinates) {
        const [lat, lng] = coordinates;

        // Use small, consistent offsets that work well across different zoom levels
        // Position labels slightly to the bottom-right of markers for better visibility
        const latOffset = -0.3;   // Small downward offset (south)
        const lngOffset = 0.5;    // Small rightward offset (east)

        // For countries in far east (near 180°), position labels to the left to avoid map edge
        // For countries in far west (near -180°), position labels to the right to avoid map edge
        let finalLngOffset = lngOffset;
        if (lng > 150) {
            finalLngOffset = -lngOffset; // Far east: position to the left
        } else if (lng < -150) {
            finalLngOffset = lngOffset;  // Far west: position to the right
        }

        return [
            lat + latOffset,
            lng + finalLngOffset
        ];
    }

    // Create label for country (using direct coordinates like dots)
    createCountryLabel(countryKey, countryInfo) {
        // Use the same direct coordinate approach as dots - no complex calculations
        const label = L.marker(countryInfo.coordinates, {
            icon: L.divIcon({
                className: 'country-tax-label compact',
                html: `<div class="tax-label-content compact" data-country="${countryKey}">
                    <div class="country-name">${countryInfo.name}</div>
                    <div class="tax-info">Enter salary to see taxes</div>
                </div>`,
                iconSize: [110, 35],
                iconAnchor: [55, -10]  // Position above the marker (negative Y to go up)
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

    // Calculate position for country name labels (comprehensive zoom-aware positioning)
    calculateNameLabelPosition(coordinates, countryName) {
        const [lat, lng] = coordinates;
        const currentZoom = this.map.getZoom();

        // Calculate label dimensions based on text length
        const textLength = countryName.length;
        const estimatedWidth = Math.max(60, Math.min(textLength * 7, 120)); // 7px per character, min 60px, max 120px
        const labelHeight = 20;

        // Approach 1: Fixed geographic offset (consistent distance regardless of zoom)
        const baseGeographicOffset = 0.4; // Base offset in degrees
        const geographicLatOffset = -baseGeographicOffset; // Position south of marker

        // Approach 2: Scale pixel offset based on zoom level
        const targetZoom = 3; // Optimal zoom level for positioning
        const basePixelOffset = 15; // Base pixel offset at target zoom
        const zoomScale = Math.pow(2, currentZoom - targetZoom); // Scale factor based on zoom difference
        const scaledPixelOffset = basePixelOffset / zoomScale; // Smaller geographic offset at higher zoom

        // Approach 3: Use hybrid approach - combine geographic and scaled pixel offsets
        // At low zoom: rely more on geographic offset
        // At high zoom: rely more on scaled pixel offset
        const zoomTransition = Math.min(Math.max((currentZoom - 2) / 6, 0), 1); // 0 at zoom 2, 1 at zoom 8+

        // Calculate final position using hybrid approach
        let finalPosition;

        if (currentZoom <= 4) {
            // Low zoom: Use primarily geographic offset
            finalPosition = [
                lat + geographicLatOffset * (1 - zoomTransition * 0.5),
                lng
            ];
        } else {
            // Higher zoom: Use scaled pixel positioning with geographic fallback
            const markerPoint = this.map.latLngToContainerPoint([lat, lng]);
            const labelPixelX = markerPoint.x - (estimatedWidth / 2); // Center horizontally
            const labelPixelY = markerPoint.y + scaledPixelOffset;

            // Ensure we don't go outside map bounds
            const mapBounds = this.map.getBounds();
            const labelLatLng = this.map.containerPointToLatLng([labelPixelX, labelPixelY]);

            if (mapBounds.contains(labelLatLng)) {
                finalPosition = labelLatLng;
            } else {
                // Fallback to geographic offset if pixel calculation goes out of bounds
                finalPosition = [
                    lat + geographicLatOffset * 0.8,
                    lng
                ];
            }
        }

        // Additional fine-tuning based on zoom level
        if (currentZoom >= 8) {
            // Very high zoom: reduce offset to keep labels close
            const reductionFactor = Math.min((currentZoom - 8) * 0.1, 0.5);
            if (Array.isArray(finalPosition)) {
                finalPosition[0] = lat + (finalPosition[0] - lat) * (1 - reductionFactor);
            }
        }

        return {
            position: Array.isArray(finalPosition) ? finalPosition : [finalPosition.lat, finalPosition.lng],
            width: estimatedWidth,
            height: labelHeight,
            zoomLevel: currentZoom,
            method: currentZoom <= 4 ? 'geographic' : 'hybrid'
        };
    }

    // Create country name label that pops from marker
    createCountryNameLabel(countryKey, countryInfo) {
        // Calculate custom position for this label
        const labelInfo = this.calculateNameLabelPosition(countryInfo.coordinates, countryInfo.name);

        const nameLabel = L.marker(labelInfo.position, {
            icon: L.divIcon({
                className: 'country-name-pop-label',
                html: `<div class="country-name-pop-content" data-country="${countryKey}" style="width: ${labelInfo.width}px;">
                    ${countryInfo.name}
                </div>`,
                iconSize: [labelInfo.width, labelInfo.height],
                iconAnchor: [0, 0]  // No anchoring - position calculated directly
            })
        });

        // Add click handler to open popup like marker click
        nameLabel.on('click', (e) => {
            e.originalEvent.stopPropagation();
            this.openCountryPopup(countryKey);
        });

        // Store label with update function for zoom changes
        nameLabel._updatePosition = () => {
            const updatedInfo = this.calculateNameLabelPosition(countryInfo.coordinates, countryInfo.name);
            nameLabel.setLatLng(updatedInfo.position);
            nameLabel.setIcon(L.divIcon({
                className: 'country-name-pop-label',
                html: `<div class="country-name-pop-content" data-country="${countryKey}" style="width: ${updatedInfo.width}px;">
                    ${countryInfo.name}
                </div>`,
                iconSize: [updatedInfo.width, updatedInfo.height],
                iconAnchor: [0, 0]
            }));
        };

        this.countryNameLabels[countryKey] = nameLabel;
        nameLabel.addTo(this.map);

        return nameLabel;
    }

    // Update all country name label positions (called on zoom/pan)
    updateCountryNameLabelPositions() {
        Object.values(this.countryNameLabels).forEach(label => {
            if (label._updatePosition) {
                label._updatePosition();
            }
        });
    }

    // Update marker popup content
    updateMarkerPopup(marker, countryKey, countryInfo, taxResult = null) {
        const vatInfo = getCountryVAT(countryKey);

        // Determine the main color scheme based on calculation state
        const isCalculated = taxResult !== null;
        const mainColor = isCalculated ? this.getTaxBurdenColor(taxResult.effectiveRate) : '#9e9e9e';
        const headerTextColor = isCalculated && taxResult.effectiveRate > 35 ? '#ffffff' : '#333333';

        // Build the popup structure based on UI mode
        const popupContent = `
            <div class="unified-tax-popup">
                ${this.compactUI ?
                    this.buildCompactPopupHeader(countryInfo, mainColor, headerTextColor, isCalculated) :
                    this.buildFullPopupHeader(countryInfo, mainColor, headerTextColor, isCalculated)
                }
                ${this.compactUI ?
                    this.buildCompactPopupBody(countryInfo, taxResult, vatInfo, mainColor, isCalculated) :
                    this.buildFullPopupBody(countryInfo, taxResult, vatInfo, mainColor, isCalculated)
                }
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: this.compactUI ? 280 : 350,
            className: this.compactUI ? 'compact-tax-popup' : 'enhanced-tax-popup',
            closeButton: true,
            autoClose: true,
            closeOnClick: false
        });
    }

    // Build compact popup header
    buildCompactPopupHeader(countryInfo, color, textColor, isCalculated) {
        const icon = isCalculated ? '🏆' : '🌍';
        const statusIcon = isCalculated ? '✅' : '⏳';

        return `
            <div class="compact-popup-header" style="
                background: linear-gradient(135deg, ${color}, ${color}dd);
                color: ${textColor};
                padding: 8px 12px;
                margin: -10px -10px 8px -10px;
                border-radius: 8px 8px 0 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 32px;
            ">
                <div class="header-left" style="display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;">
                    <span style="font-size: 16px; flex-shrink: 0;">${icon}</span>
                    <div style="min-width: 0; flex: 1;">
                        <div style="font-size: 14px; font-weight: bold; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${countryInfo.name}</div>
                        <div style="font-size: 9px; opacity: 0.8; line-height: 1;">
                            ${countryInfo.system.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • ${countryInfo.currency}
                        </div>
                    </div>
                </div>
                <div class="header-right" style="
                    background: rgba(255,255,255,0.2);
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-size: 9px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    flex-shrink: 0;
                ">
                    <span>${statusIcon}</span>
                </div>
            </div>
        `;
    }

    // Build compact popup body
    buildCompactPopupBody(countryInfo, taxResult, vatInfo, color, isCalculated) {
        return `
            <div class="compact-popup-body" style="padding: 6px;">
                ${this.buildCompactCountryInfoSection(countryInfo, vatInfo, color)}
                ${isCalculated ? this.buildCompactTaxCalculationSection(taxResult, color) : this.buildCompactPreCalculationSection(color)}
                ${isCalculated ? this.buildCompactAdditionalInfoSection(countryInfo, taxResult, color) : ''}
            </div>
        `;
    }

    // Build compact country information section
    buildCompactCountryInfoSection(countryInfo, vatInfo, color) {
        return `
            <div class="compact-country-info" style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 6px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                <div style="font-size: 10px; color: #666;">
                    <span style="font-weight: 500;">Currency:</span> <strong>${countryInfo.currency}</strong>
                </div>
                <div style="font-size: 10px; color: #666;">
                    <span style="font-weight: 500;">VAT:</span> <strong>${vatInfo && vatInfo.hasVAT ? `${vatInfo.standard}%` : 'None'}</strong>
                </div>
            </div>
        `;
    }

    // Build compact tax calculation section
    buildCompactTaxCalculationSection(taxResult, color) {
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
            <div class="compact-tax-calculation">
                <!-- Compact Summary Row -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 6px; background: rgba(0,0,0,0.05); border-radius: 4px; border-left: 3px solid ${color};">
                    <div style="font-size: 11px; color: #666;">
                        <div><strong>Gross:</strong> ${taxResult.displayCurrency} ${grossIncome}</div>
                        <div style="font-size: 9px; opacity: 0.8;">(Monthly × 12)</div>
                    </div>
                    <div style="font-size: 11px; color: #666; text-align: right;">
                        <div><strong>Tax:</strong> ${taxResult.displayCurrency} ${totalTax}</div>
                        <div style="font-size: 9px; opacity: 0.8;">${taxResult.effectiveRate.toFixed(1)}% rate</div>
                    </div>
                    <div style="font-size: 11px; color: #28a745; text-align: right;">
                        <div><strong>Net:</strong> ${taxResult.displayCurrency} ${netIncome}</div>
                        <div style="font-size: 9px; opacity: 0.8;">Take-home</div>
                    </div>
                </div>

                ${this.buildCompactTaxBreakdown(taxResult, color, incomeTax, incomeTaxRate, vatAmount)}
            </div>
        `;
    }

    // Build compact tax breakdown with numbered lines
    buildCompactTaxBreakdown(taxResult, color, incomeTax, incomeTaxRate, vatAmount) {
        let breakdown = `<div class="compact-breakdown" style="background: rgba(0,0,0,0.03); border-radius: 4px; padding: 4px 6px; margin-bottom: 4px;">`;
        breakdown += `<div style="font-size: 9px; color: ${color}; font-weight: bold; margin-bottom: 3px;">💸 Tax Components:</div>`;

        let lineNumber = 1;

        // Income tax row
        breakdown += `
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; cursor: pointer;"
                 onclick="window.taxCalculatorApp.components.map.showIncomeTaxDetails('${taxResult.countryKey}', '${taxResult.grossIncome}', event)">
                <span style="color: #666;"><strong style="color: ${color}; margin-right: 4px;">${lineNumber}.</strong>🏛️ Income Tax (${incomeTaxRate.toFixed(1)}%) <span style="color: #007bff; font-size: 8px;">ℹ️</span></span>
                <strong style="color: ${color};">${taxResult.displayCurrency} ${incomeTax}</strong>
            </div>`;
        lineNumber++;

        // Special taxes - each on separate numbered line
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            for (const specialTax of taxResult.specialTaxesInDisplayCurrency) {
                const icon = this.getSpecialTaxIcon(specialTax.type);
                const displayAmount = this.formatNumber(specialTax.taxAmountInDisplayCurrency);
                breakdown += `
                    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                        <span style="color: #666;"><strong style="color: ${color}; margin-right: 4px;">${lineNumber}.</strong>${icon} ${this.formatSpecialTaxName(specialTax.type)} (${specialTax.rate}%)</span>
                        <strong style="color: ${color};">${taxResult.displayCurrency} ${displayAmount}</strong>
                    </div>`;
                lineNumber++;
            }
        }

        // VAT
        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            breakdown += `
                <div style="display: flex; justify-content: space-between; font-size: 10px;">
                    <span style="color: #666;"><strong style="color: ${color}; margin-right: 4px;">${lineNumber}.</strong>🛍️ VAT on Spending (${taxResult.vatRate}%)</span>
                    <strong style="color: ${color};">${taxResult.displayCurrency} ${vatAmount}</strong>
                </div>`;
        }

        breakdown += `</div>`;
        return breakdown;
    }

    // Build tax breakdown rows with numbered lines
    buildTaxBreakdownRows(taxResult, color, incomeTax, incomeTaxRate, vatAmount) {
        const nativeIncomeTax = this.formatNumber(taxResult.incomeTax);
        const showNativeCurrency = taxResult.currency !== taxResult.displayCurrency;

        let lineNumber = 1;

        let rows = `
            <div class="breakdown-row income-tax-row" style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; cursor: pointer; transition: all 0.2s ease;"
                 onmouseover="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateX(3px)'"
                 onmouseout="this.style.background='rgba(255,255,255,0.7)'; this.style.transform='translateX(0px)'"
                 onclick="window.taxCalculatorApp.components.map.showTaxBracketDetails('${taxResult.countryKey}', ${taxResult.grossIncome}, event)">
                <div style="flex: 1;">
                    <span style="color: #555; font-size: 11px; font-weight: bold;"><strong style="color: ${color}; margin-right: 6px;">${lineNumber}.</strong>🏛️ Income Tax (${incomeTaxRate.toFixed(1)}%)</span>
                    <div style="font-size: 9px; color: #007bff; margin-top: 1px;">
                        💡 ${taxResult.displayCurrency} ${(taxResult.grossIncomeInDisplayCurrency).toLocaleString()} × ${incomeTaxRate.toFixed(1)}%
                    </div>
                    <div style="font-size: 9px; color: #007bff; margin-top: 1px;">
                        ℹ️ Click for detailed tax bracket breakdown
                    </div>
                </div>
                <div style="text-align: right; margin-left: 10px;">
                    <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${incomeTax}</div>
                    ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeIncomeTax}</div>` : ''}
                </div>
            </div>
        `;
        lineNumber++;

        // Add employee social security if available
        if (taxResult.hasSocialSecurity && taxResult.employeeSocialSecurityInDisplayCurrency > 0) {
            const empSS = taxResult.employeeSocialSecurityInDisplayCurrency.toLocaleString();
            const nativeEmpSS = this.formatNumber(taxResult.employeeSocialSecurity);
            const empSSRate = taxResult.employeeSocialSecurityRate;

            rows += `
                <div class="breakdown-row social-security-row" style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; transition: all 0.2s ease;"
                     onmouseover="this.style.background='rgba(255,255,255,0.9)'; this.style.transform='translateX(3px)'"
                     onmouseout="this.style.background='rgba(255,255,255,0.7)'; this.style.transform='translateX(0px)'">
                    <div style="flex: 1;">
                        <span style="color: #555; font-size: 11px; font-weight: bold;"><strong style="color: ${color}; margin-right: 6px;">${lineNumber}.</strong>🏥 Employee Social Security (${empSSRate}%${taxResult.employeeSocialSecurityTaxDeductible ? ', tax-deductible' : ''})</span>
                        <div style="font-size: 9px; color: #007bff; margin-top: 1px;">
                            💡 ${taxResult.displayCurrency} ${(taxResult.grossIncomeInDisplayCurrency).toLocaleString()} × ${empSSRate}%
                        </div>
                        <div style="font-size: 9px; color: #666; margin-top: 1px;">
                            ℹ️ ${taxResult.socialSecurityNotes || 'Pension, healthcare, and social insurance'}
                            ${taxResult.employeeSocialSecurityTaxDeductible ?
                                '<div style="font-size: 8px; color: #28a745; margin-top: 2px; font-style: italic;">✅ Reduces taxable income for income tax calculation</div>' : ''}
                        </div>
                    </div>
                    <div style="text-align: right; margin-left: 10px;">
                        <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${empSS}</div>
                        ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeEmpSS}</div>` : ''}
                    </div>
                </div>
            `;
            lineNumber++;
        }

        // Add missing income (employer social security) if available and enabled
        if (taxResult.hasSocialSecurity && taxResult.missingIncomeInDisplayCurrency > 0 && taxResult.treatEmployerSSAsSalary) {
            const missingIncome = taxResult.missingIncomeInDisplayCurrency.toLocaleString();
            const nativeMissingIncome = this.formatNumber(taxResult.missingIncome);
            const empSSRate = taxResult.employerSocialSecurityRate;

            rows += `
                <div class="breakdown-row missing-income-row" style="display: flex; justify-content: space-between; margin-bottom: 6px; padding: 8px; background: rgba(255,87,34,0.1); border-radius: 4px; border-left: 4px solid #ff5722; transition: all 0.2s ease;"
                     onmouseover="this.style.background='rgba(255,87,34,0.15)'; this.style.transform='translateX(3px)'"
                     onmouseout="this.style.background='rgba(255,87,34,0.1)'; this.style.transform='translateX(0px)'">
                    <div style="flex: 1;">
                        <span style="color: #555; font-size: 11px; font-weight: bold;"><strong style="color: ${color}; margin-right: 6px;">${lineNumber}.</strong>💸 Social Security Payment by Employer (${empSSRate}%)</span>
                        <div style="font-size: 9px; color: #ff5722; margin-top: 1px;">
                            💡 ${taxResult.displayCurrency} ${(taxResult.totalEmploymentCostInDisplayCurrency).toLocaleString()} × ${empSSRate}% = ${taxResult.displayCurrency} ${missingIncome}
                        </div>
                        <div style="font-size: 8px; color: #666; margin-top: 1px; font-style: italic;">
                            Note: This is potential salary lost to the employee
                        </div>
                    </div>
                    <div style="text-align: right; margin-left: 10px;">
                        <div style="font-weight: bold; color: #ff5722; font-size: 11px;">-${taxResult.displayCurrency} ${missingIncome}</div>
                        ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">-${taxResult.currency} ${nativeMissingIncome}</div>` : ''}
                    </div>
                </div>
            `;
            lineNumber++;
        }

        // Add special taxes breakdown if available with detailed line-by-line table
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            // Calculate total special taxes for summary
            const totalSpecialTaxes = taxResult.specialTaxesInDisplayCurrency.reduce((sum, tax) => sum + tax.taxAmountInDisplayCurrency, 0);
            const totalSpecialTaxesNative = taxResult.specialTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0);

            rows += `
                <div class="special-taxes-section" style="margin-bottom: 6px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <span style="color: #555; font-size: 11px; font-weight: bold;">🏛️ Social & Special Taxes</span>
                            <div style="font-size: 9px; color: #666; margin-top: 1px;">
                                ${taxResult.specialTaxesInDisplayCurrency.length} additional tax${taxResult.specialTaxesInDisplayCurrency.length > 1 ? 'es' : ''}
                            </div>
                        </div>
                        <div style="text-align: right; margin-left: 10px;">
                            <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${this.formatNumber(totalSpecialTaxes)}</div>
                            ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${this.formatNumber(totalSpecialTaxesNative)}</div>` : ''}
                        </div>
                    </div>

                    <!-- Detailed Line-by-Line Tax Table -->
                    <div class="special-tax-table" style="background: rgba(240,240,240,0.6); border-radius: 4px; padding: 6px; border: 1px solid #ddd;">
                        <table style="width: 100%; font-size: 9px; border-collapse: collapse;">
                            <thead>
                                <tr style="background: rgba(0,0,0,0.05);">
                                    <th style="text-align: left; padding: 4px 6px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc;">Tax Type</th>
                                    <th style="text-align: center; padding: 4px 6px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc;">Rate</th>
                                    <th style="text-align: right; padding: 4px 6px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            // Add each special tax as a numbered table row
            taxResult.specialTaxesInDisplayCurrency.forEach((specialTax, index) => {
                const icon = this.getSpecialTaxIcon(specialTax.type);
                const displayAmount = this.formatNumber(specialTax.taxAmountInDisplayCurrency);
                const nativeAmount = this.formatNumber(specialTax.taxAmount);
                const rowBg = index % 2 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(245,245,245,0.4)';

                rows += `
                                <tr style="background: ${rowBg};" title="${specialTax.description}">
                                    <td style="padding: 3px 6px; border-bottom: 1px solid #eee;">
                                        <div style="display: flex; align-items: center; gap: 3px;">
                                            <strong style="color: ${color}; margin-right: 4px;">${lineNumber}.</strong>
                                            <span>${icon}</span>
                                            <span style="font-weight: 500;">${this.formatSpecialTaxName(specialTax.type)}</span>
                                        </div>
                                    </td>
                                    <td style="padding: 3px 6px; text-align: center; border-bottom: 1px solid #eee;">
                                        <span style="background: #f8f9fa; padding: 1px 4px; border-radius: 3px; font-weight: bold; color: ${color};">${specialTax.rate}%</span>
                                    </td>
                                    <td style="padding: 3px 6px; text-align: right; border-bottom: 1px solid #eee;">
                                        <div style="font-weight: bold; color: ${color};">${taxResult.displayCurrency} ${displayAmount}</div>
                                        ${showNativeCurrency ? `<div style="font-size: 8px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeAmount}</div>` : ''}
                                    </td>
                                </tr>
                `;
                lineNumber++;
            });

            rows += `
                            </tbody>
                        </table>

                        <!-- Calculation Summary -->
                        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #ccc; background: rgba(0,123,255,0.05);">
                            <div style="font-size: 8px; color: #007bff; font-weight: bold; margin-bottom: 2px;">💡 Calculation Details:</div>
                            <div style="font-size: 8px; color: #666; line-height: 1.3;">
            `;

            // Add individual calculation explanations
            taxResult.specialTaxesInDisplayCurrency.forEach(specialTax => {
                const grossAmount = this.formatNumber(taxResult.grossIncomeInDisplayCurrency);
                const displayAmount = this.formatNumber(specialTax.taxAmountInDisplayCurrency);
                rows += `${this.formatSpecialTaxName(specialTax.type)}: ${taxResult.displayCurrency} ${grossAmount} × ${specialTax.rate}% = ${taxResult.displayCurrency} ${displayAmount}<br>`;
            });

            rows += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            const nativeVatAmount = this.formatNumber(taxResult.vatAmount);
            const netIncome = this.formatNumber(taxResult.netIncomeInDisplayCurrency);

            rows += `
                <div class="breakdown-row" style="display: flex; justify-content: space-between; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; margin-bottom: 6px;">
                    <div style="flex: 1;">
                        <span style="color: #555; font-size: 11px; font-weight: bold;"><strong style="color: ${color}; margin-right: 6px;">${lineNumber}.</strong>🛍️ VAT on Spending (${taxResult.vatRate}%)</span>
                        <div style="font-size: 9px; color: #007bff; margin-top: 1px;">
                            💡 ${taxResult.displayCurrency} ${netIncome} (net income) × ${taxResult.vatRate}%
                        </div>
                        <div style="font-size: 9px; color: #666; margin-top: 1px;">
                            Applied when spending your after-tax income
                        </div>
                    </div>
                    <div style="text-align: right; margin-left: 10px;">
                        <div style="font-weight: bold; color: ${color}; font-size: 11px;">${taxResult.displayCurrency} ${vatAmount}</div>
                        ${showNativeCurrency ? `<div style="font-size: 10px; color: #888; opacity: 0.8;">${taxResult.currency} ${nativeVatAmount}</div>` : ''}
                    </div>
                </div>
            `;
        }

        return rows;
    }

    // Build total tax description with detailed calculation explanation
    buildTotalTaxDescription(taxResult, incomeTaxRate) {
        const taxComponents = [];
        let calculationExplanation = '';

        // Income tax component with calculation detail
        const incomeTaxDisplay = this.formatNumber(taxResult.incomeTaxInDisplayCurrency);
        taxComponents.push(`Income Tax ${incomeTaxRate.toFixed(1)}%: ${taxResult.displayCurrency} ${incomeTaxDisplay}`);

        // Add calculation explanation for income tax
        const grossAmount = this.formatNumber(taxResult.grossIncomeInDisplayCurrency);
        calculationExplanation += `Income Tax: ${taxResult.displayCurrency} ${grossAmount} × ${incomeTaxRate.toFixed(1)}% = ${taxResult.displayCurrency} ${incomeTaxDisplay}`;

        // Employer social security component (only if treatEmployerSSAsSalary is enabled)
        if (taxResult.hasSocialSecurity && taxResult.missingIncomeInDisplayCurrency > 0 && taxResult.treatEmployerSSAsSalary) {
            const missingIncomeDisplay = this.formatNumber(taxResult.missingIncomeInDisplayCurrency);
            const empSSRate = taxResult.employerSocialSecurityRate;
            taxComponents.push(`Social Security Payment by Employer (${empSSRate}%): ${taxResult.displayCurrency} ${missingIncomeDisplay}`);

            // Add to calculation explanation
            calculationExplanation += ` + Social Security Payment by Employer: ${taxResult.displayCurrency} ${this.formatNumber(taxResult.totalEmploymentCostInDisplayCurrency)} × ${empSSRate}% = ${taxResult.displayCurrency} ${missingIncomeDisplay}`;
        }

        // Employee social security component
        if (taxResult.hasSocialSecurity && taxResult.employeeSocialSecurityInDisplayCurrency > 0) {
            const empSSDisplay = this.formatNumber(taxResult.employeeSocialSecurityInDisplayCurrency);
            const empSSRate = taxResult.employeeSocialSecurityRate;
            const deductibleNote = taxResult.employeeSocialSecurityTaxDeductible ? " (tax-deductible)" : "";
            taxComponents.push(`Employee SS ${empSSRate}%${deductibleNote}: ${taxResult.displayCurrency} ${empSSDisplay}`);

            // Add to calculation explanation
            calculationExplanation += ` + Employee SS: ${taxResult.displayCurrency} ${grossAmount} × ${empSSRate}% = ${taxResult.displayCurrency} ${empSSDisplay}`;
        }

        // Special taxes components - show as combined summary but list individual components
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            const totalSpecialTaxes = taxResult.specialTaxesInDisplayCurrency.reduce((sum, tax) => sum + tax.taxAmountInDisplayCurrency, 0);
            const specialTaxNames = taxResult.specialTaxesInDisplayCurrency.map(tax => this.formatSpecialTaxName(tax.type));

            // Add combined component
            taxComponents.push(`Social Taxes (${specialTaxNames.join(', ')}): ${taxResult.displayCurrency} ${this.formatNumber(totalSpecialTaxes)}`);

            // Add detailed calculation breakdown
            const individualCalculations = taxResult.specialTaxesInDisplayCurrency.map(specialTax => {
                const displayAmount = this.formatNumber(specialTax.taxAmountInDisplayCurrency);
                const taxName = this.formatSpecialTaxName(specialTax.type);
                return `${taxName}: ${taxResult.displayCurrency} ${grossAmount} × ${specialTax.rate}% = ${taxResult.displayCurrency} ${displayAmount}`;
            });

            calculationExplanation += ` + Social Taxes: [${individualCalculations.join(' + ')}] = ${taxResult.displayCurrency} ${this.formatNumber(totalSpecialTaxes)}`;
        }

        // VAT component with spending explanation
        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            const vatDisplay = this.formatNumber(taxResult.vatAmountInDisplayCurrency);
            taxComponents.push(`VAT on Spending ${taxResult.vatRate}%: ${taxResult.displayCurrency} ${vatDisplay}`);

            // Calculate estimated spending (assuming net income is spent)
            const netIncome = this.formatNumber(taxResult.netIncomeInDisplayCurrency);
            calculationExplanation += ` + VAT: ${taxResult.displayCurrency} ${netIncome} (net income) × ${taxResult.vatRate}% = ${taxResult.displayCurrency} ${vatDisplay}`;
        }

        if (taxComponents.length === 0) {
            return '<div style="font-size: 9px; opacity: 0.8; line-height: 1.3;">No tax breakdown available</div>';
        }

        // Return both component breakdown and calculation explanation
        return `
            <div style="font-size: 9px; opacity: 0.8; line-height: 1.3; margin-bottom: 4px;">
                <strong>Calculation:</strong> ${calculationExplanation}
            </div>
            <div style="font-size: 9px; opacity: 0.8; line-height: 1.3;">
                <strong>Components:</strong> ${taxComponents.join(' + ')}
            </div>
        `;
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

    // Build compact pre-calculation section
    buildCompactPreCalculationSection(color) {
        return `
            <div class="compact-pre-calculation" style="text-align: center; padding: 8px; background: rgba(0,0,0,0.03); border-radius: 4px; border-left: 3px solid ${color};">
                <div style="font-size: 11px; color: #666; font-weight: 500;">💡 Enter salary to calculate taxes</div>
            </div>
        `;
    }

    // Build compact additional information section
    buildCompactAdditionalInfoSection(countryInfo, taxResult, color) {
        let additionalInfo = '';

        // Compact additional info in one row
        const infoItems = [];

        // Tax bracket info for progressive systems
        if (countryInfo.system === 'progressive') {
            const relevantBrackets = countryInfo.brackets.filter(bracket =>
                bracket.min <= taxResult.grossIncome &&
                (bracket.max === null || bracket.max >= taxResult.grossIncome)
            );
            if (relevantBrackets.length > 0) {
                const topBracket = relevantBrackets[relevantBrackets.length - 1];
                infoItems.push(`📈 Bracket: ${topBracket.rate}%`);
            }
        }

        // Exchange rate info
        if (taxResult.exchangeRate !== 1) {
            infoItems.push(`💱 Rate: 1 ${taxResult.inputCurrency} = ${taxResult.exchangeRate.toFixed(2)} ${taxResult.currency}`);
        }

        if (infoItems.length > 0) {
            additionalInfo = `
                <div style="font-size: 9px; color: #666; text-align: center; padding: 4px; background: rgba(0,0,0,0.03); border-radius: 4px; margin-top: 4px;">
                    ${infoItems.join(' • ')}
                </div>
            `;
        }

        return additionalInfo;
    }

    // Build full popup header (original detailed version)
    buildFullPopupHeader(countryInfo, color, textColor, isCalculated) {
        const icon = isCalculated ? '🏆' : '🌍';
        const statusText = isCalculated ? 'Calculated' : 'Ready for Calculation';
        const statusIcon = isCalculated ? '✅' : '⏳';

        return `
            <div class="popup-header" style="
                background: linear-gradient(135deg, ${color}, ${color}dd);
                color: ${textColor};
                padding: 15px 16px;
                margin: -12px -12px 12px -12px;
                border-radius: 12px 12px 0 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            ">
                <!-- Decorative background pattern -->
                <div style="
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 60px;
                    height: 60px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    opacity: 0.3;
                "></div>

                <div class="header-content" style="position: relative; z-index: 1;">
                    <!-- Main title row -->
                    <div class="title-row" style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 8px;
                    ">
                        <div class="country-title" style="
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            flex: 1;
                        ">
                            <span style="
                                font-size: 20px;
                                line-height: 1;
                                display: flex;
                                align-items: center;
                                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                            ">${icon}</span>
                            <h4 style="
                                margin: 0;
                                font-size: 18px;
                                font-weight: bold;
                                letter-spacing: -0.5px;
                                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                                line-height: 1.2;
                            ">${countryInfo.name}</h4>
                        </div>

                        <div class="status-badge" style="
                            background: rgba(255,255,255,0.2);
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 10px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            border: 1px solid rgba(255,255,255,0.3);
                        ">
                            <span style="font-size: 12px;">${statusIcon}</span>
                            <span>${statusText}</span>
                        </div>
                    </div>

                    <!-- Tax system info row -->
                    <div class="system-info" style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        opacity: 0.9;
                    ">
                        <div class="tax-system" style="
                            background: rgba(255,255,255,0.15);
                            padding: 3px 8px;
                            border-radius: 6px;
                            font-size: 11px;
                            font-weight: 500;
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            border: 1px solid rgba(255,255,255,0.2);
                        ">
                            <span style="font-size: 12px;">⚖️</span>
                            <span>${countryInfo.system.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Tax System</span>
                        </div>

                        <div class="currency-code" style="
                            font-size: 11px;
                            font-weight: bold;
                            opacity: 0.8;
                            background: rgba(0,0,0,0.1);
                            padding: 2px 6px;
                            border-radius: 4px;
                        ">
                            ${countryInfo.currency}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Build full popup body (original detailed version)
    buildFullPopupBody(countryInfo, taxResult, vatInfo, color, isCalculated) {
        return `
            <div class="popup-body" style="padding: 8px;">
                ${this.buildFullCountryInfoSection(countryInfo, vatInfo, color)}
                ${isCalculated ? this.buildFullTaxCalculationSection(taxResult, color) : this.buildFullPreCalculationSection(color)}
                ${isCalculated ? this.buildFullAdditionalInfoSection(countryInfo, taxResult, color) : ''}
            </div>
        `;
    }

    // Build full country information section (original detailed version)
    buildFullCountryInfoSection(countryInfo, vatInfo, color) {
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

    // Build full tax calculation section (original detailed version)
    buildFullTaxCalculationSection(taxResult, color) {
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
                <!-- Employment Cost Structure -->
                <div class="calculation-row" style="background: #f8f9fa; border-radius: 6px; padding: 10px; margin-bottom: 8px; border-left: 4px solid ${color};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase;">💼 Employment Cost Structure</div>
                            <div style="font-size: 10px; color: #888; margin-top: 1px;">
                                Total employer budget: ${taxResult.displayCurrency} ${(taxResult.totalEmploymentCostInDisplayCurrency || taxResult.grossIncomeInDisplayCurrency).toLocaleString()}
                            </div>
                            ${taxResult.hasSocialSecurity && taxResult.missingIncomeInDisplayCurrency > 0 && taxResult.treatEmployerSSAsSalary ? `
                                <div style="font-size: 9px; color: #ff5722; margin-top: 2px; background: rgba(255,87,34,0.1); padding: 2px 4px; border-radius: 3px; display: inline-block;">
                                    💸 Social Security Payment by Employer: ${taxResult.displayCurrency} ${taxResult.missingIncomeInDisplayCurrency.toLocaleString()}
                                    <div style="font-size: 8px; color: #666; margin-top: 1px; font-style: italic;">(potential salary lost)</div>
                                </div>
                            ` : ''}
                            <div style="font-size: 9px; color: #007bff; margin-top: 2px; background: rgba(0,123,255,0.1); padding: 2px 4px; border-radius: 3px; display: inline-block;">
                                📊 Available for Salary: ${taxResult.displayCurrency} ${grossIncome}
                            </div>
                        </div>
                        <div style="text-align: right; margin-left: 10px;">
                            <div style="font-weight: bold; color: #333; font-size: 14px;">${taxResult.displayCurrency} ${grossIncome}</div>
                            <div style="font-size: 10px; color: #666; opacity: 0.8;">Actual Gross Salary</div>
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
                <div class="total-tax" style="background: ${color}; color: ${textColor}; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">💰 Total Tax Burden</div>
                            <div style="font-size: 10px; opacity: 0.9; margin-bottom: 6px;">${taxResult.effectiveRate.toFixed(1)}% effective rate on ${taxResult.displayCurrency} ${grossIncome}</div>
                        </div>
                        <div style="text-align: right; margin-left: 10px;">
                            <div style="font-weight: bold; font-size: 14px;">${taxResult.displayCurrency} ${totalTax}</div>
                            ${taxResult.currency !== taxResult.displayCurrency ? `<div style="font-size: 11px; opacity: 0.8;">${taxResult.currency} ${taxResult.taxAmount.toLocaleString()}</div>` : ''}
                        </div>
                    </div>

                    <!-- Detailed Calculation Explanation -->
                    <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; margin-top: 8px;">
                        <div style="font-size: 10px; opacity: 0.9; font-weight: bold; margin-bottom: 4px;">📋 How This Total Was Calculated:</div>
                        ${this.buildTotalTaxDescription(taxResult, incomeTaxRate)}
                    </div>
                </div>

                <!-- Net Income -->
                <div class="net-income" style="background: linear-gradient(135deg, #28a74522, #28a74511); border: 1px solid #28a74544; border-radius: 6px; padding: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #28a745; font-size: 12px;">💚 Net Annual Income</div>
                            <div style="font-size: 10px; color: #666; margin-top: 1px;">Take-home pay after all taxes</div>
                            <div style="font-size: 9px; color: #28a745; margin-top: 3px; background: rgba(40,167,69,0.1); padding: 2px 4px; border-radius: 3px; display: inline-block;">
                                💡 ${taxResult.displayCurrency} ${grossIncome} - ${taxResult.displayCurrency} ${totalTax} = ${taxResult.displayCurrency} ${netIncome}
                            </div>
                        </div>
                        <div style="text-align: right; margin-left: 10px;">
                            <div style="font-weight: bold; color: #28a745; font-size: 14px;">${taxResult.displayCurrency} ${netIncome}</div>
                            ${taxResult.currency !== taxResult.displayCurrency ? `<div style="font-size: 11px; color: #28a745; opacity: 0.8;">${taxResult.currency} ${taxResult.netIncome.toLocaleString()}</div>` : ''}
                            <div style="font-size: 9px; color: #28a745; margin-top: 2px; opacity: 0.8;">
                                ≈ ${taxResult.displayCurrency} ${(taxResult.netIncomeInDisplayCurrency / 12).toLocaleString()} per month
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Employment Cost Explanation (if social security exists) -->
                ${taxResult.hasSocialSecurity && taxResult.missingIncomeInDisplayCurrency > 0 && taxResult.treatEmployerSSAsSalary ? `
                    <div class="employment-explanation" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border: 1px solid #dee2e6; border-radius: 6px; padding: 12px; margin-top: 8px;">
                        <div style="font-weight: bold; color: #495057; font-size: 12px; margin-bottom: 8px;">💡 Employment Cost Breakdown</div>
                        <div style="font-size: 10px; color: #6c757d; line-height: 1.4;">
                            <div style="margin-bottom: 4px;"><strong>Total Employment Cost:</strong> ${taxResult.displayCurrency} ${(taxResult.totalEmploymentCostInDisplayCurrency || taxResult.grossIncomeInDisplayCurrency).toLocaleString()} (what employer budgets)</div>
                            <div style="margin-bottom: 4px;"><strong>Social Security Payment by Employer:</strong> ${taxResult.displayCurrency} ${taxResult.missingIncomeInDisplayCurrency.toLocaleString()} (potential salary lost to employee)</div>
                            <div style="margin-bottom: 4px;"><strong>Available for Salary:</strong> ${taxResult.displayCurrency} ${grossIncome} (what can actually be paid as salary)</div>
                            <div style="margin-bottom: 6px;"><strong>Employee Takes Home:</strong> ${taxResult.displayCurrency} ${netIncome} (after all taxes and employee SS)</div>
                            <div style="margin-top: 6px; padding: 6px; background: rgba(255,193,7,0.1); border-left: 3px solid #ffc107; border-radius: 3px;">
                                <strong style="color: #e65100;">📝 Key Insight:</strong> The employer social security payment represents potential salary lost to the employee - it's part of their total compensation that goes to the government instead of their pocket.
                            </div>
                        </div>
                    </div>
                ` : ''}

            </div>
        `;
    }

    // Build full pre-calculation section (original version)
    buildFullPreCalculationSection(color) {
        return `
            <div class="pre-calculation-section">
                <div class="calculation-prompt" style="background: linear-gradient(135deg, ${color}33, ${color}22); border: 1px solid ${color}66; border-radius: 6px; padding: 12px; text-align: center;">
                    <div style="color: #666; font-weight: bold; margin-bottom: 6px; font-size: 12px;">💡 Tax Calculator Ready</div>
                    <div style="font-size: 11px; color: #888; line-height: 1.4;">Enter your monthly salary above to see detailed tax calculations and comparisons with other countries</div>
                </div>
            </div>
        `;
    }

    // Build full additional information section (original version)
    buildFullAdditionalInfoSection(countryInfo, taxResult, color) {
        let additionalInfo = '';

        // Tax bracket information removed - now handled via income tax row click

        // For flat tax systems, show the flat rate
        if (countryInfo.system === 'flat' && countryInfo.brackets && countryInfo.brackets.length > 0) {
            const flatRate = countryInfo.brackets[0].rate;
            additionalInfo += `
                <div class="tax-bracket-info" style="background: linear-gradient(135deg, ${color}15, ${color}08); border: 1px solid ${color}33; border-radius: 6px; padding: 8px; margin-top: 8px; font-size: 11px;">
                    <div style="font-weight: bold; margin-bottom: 4px; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">📊 Flat Tax Rate</div>
                    <div style="display: flex; justify-content: space-between; padding: 4px 6px; background: rgba(255,255,255,0.7); border-radius: 4px;">
                        <span style="color: #555; font-weight: 500;">Tax Rate:</span>
                        <span style="font-weight: bold; color: ${color};">${flatRate}%</span>
                    </div>
                    <div style="font-size: 9px; color: #666; margin-top: 4px; text-align: center;">Applied to all income levels</div>
                </div>
            `;
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


    // Find the active tax bracket for given income
    findActiveBracket(brackets, grossIncome) {
        for (let bracket of brackets) {
            if (grossIncome >= bracket.min && (bracket.max === null || grossIncome <= bracket.max)) {
                return bracket;
            }
        }
        return brackets[brackets.length - 1]; // Return highest bracket if none found
    }

    // Get detailed information about the active bracket
    getActiveBracketInfo(brackets, grossIncome, currency) {
        const activeBracket = this.findActiveBracket(brackets, grossIncome);
        if (!activeBracket) return null;

        // Calculate taxable amount in this bracket
        const bracketMin = activeBracket.min;
        const bracketMax = activeBracket.max || Infinity;
        const taxableInThisBracket = Math.min(grossIncome - bracketMin, bracketMax - bracketMin);

        // Find next bracket info
        let nextBracketInfo = null;
        const currentBracketIndex = brackets.findIndex(b => b.min === activeBracket.min);
        if (currentBracketIndex >= 0 && currentBracketIndex < brackets.length - 1) {
            const nextBracket = brackets[currentBracketIndex + 1];
            const amountToNext = nextBracket.min - grossIncome;
            if (amountToNext > 0) {
                nextBracketInfo = `Next: ${currency} ${amountToNext.toLocaleString()} to ${nextBracket.rate}%`;
            }
        }

        return {
            taxableInThisBracket,
            nextBracketInfo
        };
    }

    // Show detailed tax bracket breakdown in sidebar
    showTaxBracketDetails(countryKey, grossIncome, event) {
        const countryInfo = taxData[countryKey];
        if (!countryInfo || countryInfo.system !== 'progressive') return;

        // Prevent event bubbling to avoid closing the popup
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        // Create sidebar content
        const sidebarContent = this.buildTaxBracketSidebar(countryInfo, grossIncome);

        // Find the popup element to position sidebar next to it
        let popupElement = null;
        if (event) {
            // Find the closest popup container
            popupElement = event.target.closest('.leaflet-popup') ||
                          event.target.closest('.unified-tax-popup') ||
                          document.querySelector('.leaflet-popup-content');
        }

        // Show the sidebar
        this.displayTaxBracketSidebar(sidebarContent, countryInfo.name, popupElement);
    }

    // Build the detailed tax bracket sidebar content
    buildTaxBracketSidebar(countryInfo, grossIncome) {
        let totalTax = 0;
        let remainingIncome = grossIncome;
        let bracketRows = '';

        // Calculate taxes for each bracket
        countryInfo.brackets.forEach((bracket, index) => {
            const min = bracket.min;
            const max = bracket.max || Infinity;
            const rate = bracket.rate;

            // Determine how much income falls in this bracket
            let taxableInBracket = 0;
            let taxFromBracket = 0;
            let status = '';

            if (grossIncome > min) {
                if (max === Infinity || grossIncome <= max) {
                    // Income is within this bracket
                    taxableInBracket = grossIncome - min;
                    status = `🎯 Current bracket (${countryInfo.currency} ${taxableInBracket.toLocaleString()} taxable)`;
                } else {
                    // Income exceeds this bracket
                    taxableInBracket = max - min;
                    status = `✅ Fully utilized (${countryInfo.currency} ${taxableInBracket.toLocaleString()} taxable)`;
                }
                taxFromBracket = taxableInBracket * (rate / 100);
                totalTax += taxFromBracket;
            } else {
                status = '⚪ Not reached';
            }

            const isActiveBracket = grossIncome >= min && (max === Infinity || grossIncome <= max);
            const rowColor = isActiveBracket ? '#e3f2fd' : (grossIncome > min ? '#e8f5e8' : '#f5f5f5');
            const borderColor = isActiveBracket ? '#2196f3' : '#ddd';

            bracketRows += `
                <div class="bracket-row" style="
                    margin-bottom: 8px;
                    padding: 12px;
                    background: ${rowColor};
                    border: 2px solid ${borderColor};
                    border-radius: 8px;
                    ${isActiveBracket ? 'box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);' : ''}
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: bold; color: #333; font-size: 14px;">
                            Bracket ${index + 1}: ${rate}%
                        </div>
                        <div style="font-weight: bold; color: ${isActiveBracket ? '#2196f3' : '#666'}; font-size: 14px;">
                            ${countryInfo.currency} ${taxFromBracket.toLocaleString()}
                        </div>
                    </div>
                    <div style="margin-bottom: 6px; color: #555; font-size: 12px;">
                        <strong>Range:</strong> ${countryInfo.currency} ${min.toLocaleString()} - ${max === Infinity ? '∞' : countryInfo.currency + ' ' + max.toLocaleString()}
                    </div>
                    <div style="margin-bottom: 6px; color: #555; font-size: 12px;">
                        <strong>Status:</strong> ${status}
                    </div>
                    ${taxFromBracket > 0 ? `
                        <div style="font-size: 11px; color: #666; font-style: italic;">
                            💡 Calculation: ${countryInfo.currency} ${taxableInBracket.toLocaleString()} × ${rate}% = ${countryInfo.currency} ${taxFromBracket.toLocaleString()}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        // Calculate effective rate
        const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

        return `
            <div class="bracket-breakdown">
                <div class="summary-section" style="
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    text-align: center;
                ">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
                        ${countryInfo.name} Tax Breakdown
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Annual Income: ${countryInfo.currency} ${grossIncome.toLocaleString()}
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Total Tax: ${countryInfo.currency} ${totalTax.toLocaleString()} (${effectiveRate.toFixed(2)}%)
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Net Income: ${countryInfo.currency} ${(grossIncome - totalTax).toLocaleString()}
                    </div>
                </div>

                <div class="brackets-section">
                    <h4 style="margin-bottom: 12px; color: #333; font-size: 16px;">📊 Tax Brackets Breakdown</h4>
                    ${bracketRows}
                </div>

                <div class="next-bracket-section" style="
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 15px;
                    border-left: 4px solid #17a2b8;
                ">
                    ${this.buildNextBracketInfo(countryInfo.brackets, grossIncome, countryInfo.currency)}
                </div>
            </div>
        `;
    }

    // Build information about the next tax bracket
    buildNextBracketInfo(brackets, grossIncome, currency) {
        const activeBracketIndex = brackets.findIndex(bracket =>
            grossIncome >= bracket.min && (bracket.max === null || grossIncome <= bracket.max)
        );

        if (activeBracketIndex >= 0 && activeBracketIndex < brackets.length - 1) {
            const nextBracket = brackets[activeBracketIndex + 1];
            const amountToNext = nextBracket.min - grossIncome;

            return `
                <h5 style="margin-bottom: 8px; color: #17a2b8;">🎯 Next Tax Bracket</h5>
                <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                    <strong>Next Rate:</strong> ${nextBracket.rate}% (starts at ${currency} ${nextBracket.min.toLocaleString()})
                </div>
                <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                    <strong>Amount Needed:</strong> ${currency} ${amountToNext.toLocaleString()}
                </div>
                <div style="font-size: 11px; color: #666; font-style: italic;">
                    💡 You need ${currency} ${amountToNext.toLocaleString()} more income to reach the ${nextBracket.rate}% tax bracket.
                </div>
            `;
        } else if (activeBracketIndex === brackets.length - 1) {
            return `
                <h5 style="margin-bottom: 8px; color: #17a2b8;">🏆 Highest Tax Bracket</h5>
                <div style="font-size: 13px; color: #555;">
                    You are in the highest tax bracket available. Any additional income will be taxed at ${brackets[brackets.length - 1].rate}%.
                </div>
            `;
        } else {
            return `
                <h5 style="margin-bottom: 8px; color: #17a2b8;">📈 Your Progress</h5>
                <div style="font-size: 13px; color: #555;">
                    Enter a valid salary amount to see detailed tax bracket progression.
                </div>
            `;
        }
    }

    // Display the tax bracket sidebar
    displayTaxBracketSidebar(content, countryName, popupElement = null) {
        // Remove existing sidebar if present
        this.removeTaxBracketSidebar();

        // Create sidebar element
        const sidebar = document.createElement('div');
        sidebar.id = 'tax-bracket-sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #007bff;
                color: white;
                border-radius: 8px 8px 0 0;
            ">
                <h3 style="margin: 0; font-size: 16px;">📈 ${countryName} Tax Details</h3>
                <button class="sidebar-close" onclick="window.taxCalculatorApp.components.map.removeTaxBracketSidebar()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            <div class="sidebar-content" style="
                padding: 15px;
                max-height: calc(100vh - 100px);
                overflow-y: auto;
            ">
                ${content}
            </div>
        `;

        // Calculate position relative to popup if available
        let sidebarPosition = {
            position: 'fixed',
            top: '20px',
            left: 'auto',
            right: '20px',
            width: '400px'
        };

        if (popupElement) {
            const popupRect = popupElement.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const sidebarWidth = 400;

            // Position to the right of the popup if there's space, otherwise to the left
            if (popupRect.right + sidebarWidth + 20 <= viewportWidth) {
                sidebarPosition = {
                    position: 'fixed',
                    top: `${popupRect.top}px`,
                    left: `${popupRect.right + 10}px`,
                    right: 'auto',
                    width: `${sidebarWidth}px`
                };
            } else if (popupRect.left - sidebarWidth - 10 >= 0) {
                sidebarPosition = {
                    position: 'fixed',
                    top: `${popupRect.top}px`,
                    left: `${popupRect.left - sidebarWidth - 10}px`,
                    right: 'auto',
                    width: `${sidebarWidth}px`
                };
            } else {
                // If no space on either side, position at edge with some offset
                sidebarPosition = {
                    position: 'fixed',
                    top: `${Math.max(20, popupRect.top)}px`,
                    left: 'auto',
                    right: '20px',
                    width: `${Math.min(sidebarWidth, viewportWidth - 40)}px`
                };
            }
        }

        // Apply sidebar styles
        sidebar.style.cssText = `
            position: ${sidebarPosition.position};
            top: ${sidebarPosition.top};
            ${sidebarPosition.left !== 'auto' ? `left: ${sidebarPosition.left};` : ''}
            ${sidebarPosition.right !== 'auto' ? `right: ${sidebarPosition.right};` : ''}
            width: ${sidebarPosition.width};
            max-width: calc(100vw - 40px);
            max-height: calc(100vh - 40px);
            background: white;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 10001;
            font-family: system-ui, -apple-system, sans-serif;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add animation keyframes if not already present
        if (!document.getElementById('sidebar-animations')) {
            const style = document.createElement('style');
            style.id = 'sidebar-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .sidebar-closing {
                    animation: slideOutRight 0.3s ease-in forwards;
                }
            `;
            document.head.appendChild(style);
        }

        // Add to DOM
        document.body.appendChild(sidebar);

        // Store reference to prevent multiple event listeners
        this.sidebarClickHandler = this.handleSidebarClickOutside.bind(this);

        // Add click outside to close with delay to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', this.sidebarClickHandler, true);
        }, 100);
    }

    // Remove the tax bracket sidebar
    removeTaxBracketSidebar() {
        const sidebar = document.getElementById('tax-bracket-sidebar');
        if (sidebar) {
            sidebar.classList.add('sidebar-closing');

            // Remove event listener if it exists
            if (this.sidebarClickHandler) {
                document.removeEventListener('click', this.sidebarClickHandler, true);
                this.sidebarClickHandler = null;
            }

            setTimeout(() => {
                sidebar.remove();
            }, 300);
        }
    }

    // Handle clicks outside sidebar to close it
    handleSidebarClickOutside(event) {
        const sidebar = document.getElementById('tax-bracket-sidebar');
        if (!sidebar) return;

        // Don't close if clicking inside the sidebar
        if (sidebar.contains(event.target)) return;

        // Don't close if clicking inside any popup or map popup
        const clickedInPopup = event.target.closest('.leaflet-popup') ||
                              event.target.closest('.unified-tax-popup') ||
                              event.target.closest('.leaflet-popup-content') ||
                              event.target.closest('.breakdown-row');

        if (clickedInPopup) return;

        // Close the sidebar
        this.removeTaxBracketSidebar();
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

    // Generate numbered line-by-line tax source description
    getTaxSourceInfo(taxResult) {
        const sources = [];
        let lineNumber = 1;

        // Check for income tax - calculate effective rate
        if (taxResult.incomeTaxInDisplayCurrency > 0) {
            const incomeRate = ((taxResult.incomeTaxInDisplayCurrency / taxResult.grossIncomeInDisplayCurrency) * 100).toFixed(0);
            sources.push(`${lineNumber}. ${incomeRate}% Income Tax`);
            lineNumber++;
        }

        // Check for missing income (employer social security) if enabled
        if (taxResult.hasSocialSecurity && taxResult.missingIncomeInDisplayCurrency > 0 && taxResult.treatEmployerSSAsSalary) {
            sources.push(`${lineNumber}. ${taxResult.employerSocialSecurityRate}% Social Security Payment by Employer`);
            lineNumber++;
        }

        // Check for employee social security
        if (taxResult.hasSocialSecurity && taxResult.employeeSocialSecurityRate > 0) {
            sources.push(`${lineNumber}. ${taxResult.employeeSocialSecurityRate}% Employee SS`);
            lineNumber++;
        }

        // Check for special taxes - show each tax on individual numbered lines
        if (taxResult.specialTaxesInDisplayCurrency && taxResult.specialTaxesInDisplayCurrency.length > 0) {
            // Always show individual special taxes as separate numbered lines
            taxResult.specialTaxesInDisplayCurrency.forEach(specialTax => {
                sources.push(`${lineNumber}. ${specialTax.rate}% ${this.formatSpecialTaxName(specialTax.type)}`);
                lineNumber++;
            });
        }

        // Check for VAT - use the actual VAT rate from config
        if (taxResult.hasVAT && taxResult.vatAmountInDisplayCurrency > 0) {
            sources.push(`${lineNumber}. ${taxResult.vatRate}% VAT`);
        }

        return sources.length > 0 ? sources.join('<br>') : 'Tax Components';
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

        // Update country name label positions and zoom classes on zoom/pan
        this.map.on('zoomend moveend', () => {
            this.updateCountryNameLabelPositions();
            this.updateZoomClasses();
        });

        // Set initial zoom class
        this.updateZoomClasses();
    }

    // Update zoom classes on the map container for responsive label sizing
    updateZoomClasses() {
        const zoom = this.map.getZoom();
        const mapContainer = document.getElementById(this.containerId);

        if (mapContainer) {
            // Remove existing zoom classes
            mapContainer.classList.remove('zoom-very-small', 'zoom-small', 'zoom-medium', 'zoom-large', 'zoom-xlarge');

            // Add appropriate zoom class based on current zoom level
            if (zoom < 2) {
                mapContainer.classList.add('zoom-very-small');
            } else if (zoom <= 3) {
                mapContainer.classList.add('zoom-small');
            } else if (zoom <= 5) {
                mapContainer.classList.add('zoom-medium');
            } else if (zoom <= 8) {
                mapContainer.classList.add('zoom-large');
            } else {
                mapContainer.classList.add('zoom-xlarge');
            }
        }
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

        // Keep label at direct coordinates - no offset calculations needed
        const countryInfo = taxData[countryKey];
        if (countryInfo) {
            label.setLatLng(countryInfo.coordinates);
        }

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

            let taxBreakdown = '';
            // Always show income tax
            taxBreakdown += `
                <div class="tax-breakdown-expanded">
                    <div class="breakdown-row">
                        <span class="breakdown-label">Income Tax:</span>
                        <span class="breakdown-value">${displayCurrency} ${incomeTax}</span>
                    </div>
            `;

            // Add missing income (employer social security) if available and enabled
            if (result.hasSocialSecurity && result.missingIncomeInDisplayCurrency > 0 && result.treatEmployerSSAsSalary) {
                const missingIncome = result.missingIncomeInDisplayCurrency.toLocaleString();
                taxBreakdown += `
                    <div class="breakdown-row">
                        <span class="breakdown-label">Social Security Payment by Employer (${result.employerSocialSecurityRate}%):</span>
                        <span class="breakdown-value">-${displayCurrency} ${missingIncome}</span>
                        <div style="font-size: 8px; color: #666; font-style: italic; margin-top: 2px;">Note: This is potential salary lost to the employee</div>
                    </div>
                `;
            }

            // Add employee social security if available
            if (result.hasSocialSecurity && result.employeeSocialSecurityInDisplayCurrency > 0) {
                const empSS = result.employeeSocialSecurityInDisplayCurrency.toLocaleString();
                taxBreakdown += `
                    <div class="breakdown-row">
                        <span class="breakdown-label">Employee SS (${result.employeeSocialSecurityRate}%${result.employeeSocialSecurityTaxDeductible ? ', tax-deductible' : ''}):</span>
                        <span class="breakdown-value">${displayCurrency} ${empSS}</span>
                    </div>
                `;
            }

            // Add VAT if available
            if (result.hasVAT && result.vatAmountInDisplayCurrency > 0) {
                taxBreakdown += `
                    <div class="breakdown-row">
                        <span class="breakdown-label">VAT (${result.vatRate}%):</span>
                        <span class="breakdown-value">${displayCurrency} ${vatAmount}</span>
                    </div>
                `;
            }

            taxBreakdown += `</div>`;

            // Show employment cost structure if social security exists
            let employmentInfo = '';
            if (result.hasSocialSecurity && result.missingIncomeInDisplayCurrency > 0 && result.treatEmployerSSAsSalary) {
                const totalCost = (result.totalEmploymentCostInDisplayCurrency || result.grossIncomeInDisplayCurrency).toLocaleString();
                const missingIncome = result.missingIncomeInDisplayCurrency.toLocaleString();
                employmentInfo = `
                    <div class="employment-cost-info" style="color: ${textColor}; opacity: 0.9; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.3);">
                        <div style="font-size: 9px; font-weight: bold;">Employment Cost: ${displayCurrency} ${totalCost}</div>
                        <div style="font-size: 8px; opacity: 0.8;">Social Security Payment by Employer: ${displayCurrency} ${missingIncome}</div>
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
                ${taxBreakdown}
                <div class="net-income" style="color: ${textColor}; opacity: 0.9;">Net: ${displayCurrency} ${netIncome}</div>
                ${employmentInfo}
                <div class="currency-info" style="color: ${textColor}; opacity: 0.8;">${result.currency} → ${displayCurrency}</div>
            </div>`;

            className = 'country-tax-label expanded';
            iconSize = [200, 120];
            iconAnchor = [100, 130];  // Position above the marker
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
            iconAnchor = [55, -10];  // Position above the marker
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
                // Keep label at direct coordinates - same as dots
                label.setLatLng(countryInfo.coordinates);

                label.setIcon(L.divIcon({
                    className: 'country-tax-label compact',
                    html: `<div class="tax-label-content compact" data-country="${countryKey}">
                        <div class="country-name">${countryInfo.name}</div>
                        <div class="tax-info">Enter salary to see taxes</div>
                    </div>`,
                    iconSize: [110, 35],
                    iconAnchor: [55, -10]  // Position above the marker
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
        const fullscreenInputs = document.getElementById('fullscreenInputs');

        if (mapContainer && expandIcon && contractIcon) {
            // Add fullscreen classes
            mapContainer.classList.add('fullscreen');
            document.body.classList.add('map-fullscreen');

            // Switch icons
            expandIcon.style.display = 'none';
            contractIcon.style.display = 'block';

            // Show fullscreen inputs
            if (fullscreenInputs) {
                fullscreenInputs.style.display = 'block';
            }

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
        const fullscreenInputs = document.getElementById('fullscreenInputs');

        if (mapContainer && expandIcon && contractIcon) {
            // Remove fullscreen classes
            mapContainer.classList.remove('fullscreen');
            document.body.classList.remove('map-fullscreen');

            // Switch icons back
            expandIcon.style.display = 'block';
            contractIcon.style.display = 'none';

            // Hide fullscreen inputs
            if (fullscreenInputs) {
                fullscreenInputs.style.display = 'none';
            }

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
            displayCurrency: document.getElementById('fullscreenDisplayCurrency'),
            includeVAT: document.getElementById('fullscreenIncludeVAT'),
            compactUI: document.getElementById('fullscreenCompactUI')
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

                // Sync toggle controls
                const mainIncludeVAT = document.getElementById('includeVAT');
                const mainCompactUI = document.getElementById('compactUI');

                if (this.fullscreenInputs.includeVAT && mainIncludeVAT) {
                    [this.fullscreenInputs.includeVAT, mainIncludeVAT].forEach(checkbox => {
                        checkbox.addEventListener('change', (e) => {
                            const checked = e.target.checked;
                            [this.fullscreenInputs.includeVAT, mainIncludeVAT].forEach(syncCheckbox => {
                                if (syncCheckbox !== e.target) {
                                    syncCheckbox.checked = checked;
                                }
                            });
                            // Trigger change event
                            mainIncludeVAT.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    });
                }

                if (this.fullscreenInputs.compactUI && mainCompactUI) {
                    [this.fullscreenInputs.compactUI, mainCompactUI].forEach(checkbox => {
                        checkbox.addEventListener('change', (e) => {
                            const checked = e.target.checked;
                            [this.fullscreenInputs.compactUI, mainCompactUI].forEach(syncCheckbox => {
                                if (syncCheckbox !== e.target) {
                                    syncCheckbox.checked = checked;
                                }
                            });
                            // Trigger change event
                            mainCompactUI.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    });
                }
            }
        }
    }

    // Sync fullscreen inputs with main inputs
    syncFullscreenInputs() {
        const mainSalary = document.getElementById('salary');
        const mainInputCurrency = document.getElementById('inputCurrency');
        const mainDisplayCurrency = document.getElementById('displayCurrency');
        const mainIncludeVAT = document.getElementById('includeVAT');
        const mainCompactUI = document.getElementById('compactUI');

        if (this.fullscreenInputs.salary && mainSalary) {
            this.fullscreenInputs.salary.value = mainSalary.value;
        }

        if (this.fullscreenInputs.inputCurrency && mainInputCurrency) {
            this.fullscreenInputs.inputCurrency.value = mainInputCurrency.value;
        }

        if (this.fullscreenInputs.displayCurrency && mainDisplayCurrency) {
            this.fullscreenInputs.displayCurrency.value = mainDisplayCurrency.value;
        }

        if (this.fullscreenInputs.includeVAT && mainIncludeVAT) {
            this.fullscreenInputs.includeVAT.checked = mainIncludeVAT.checked;
        }

        if (this.fullscreenInputs.compactUI && mainCompactUI) {
            this.fullscreenInputs.compactUI.checked = mainCompactUI.checked;
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
            width: 260px;
            max-height: 300px;
            background: white;
            border: 1px solid #007bff;
            border-radius: 6px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            z-index: 10000;
            overflow-y: auto;
            overflow-x: hidden;
            font-size: 12px;
        `;

        // Generate compact content
        const content = this.generateCompactBracketContent(countryInfo, annualIncome, taxResult);
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

    // Generate compact bracket content
    generateCompactBracketContent(countryInfo, annualIncome, taxResult = null) {
        const { system, brackets, currency, name } = countryInfo;

        if (isNaN(annualIncome) || annualIncome <= 0) {
            return `
                <div style="padding: 12px; text-align: center; color: #dc3545; font-size: 11px;">
                    <div>⚠️ Invalid Income</div>
                    <div style="font-size: 10px; margin-top: 2px;">Enter a valid salary</div>
                </div>
            `;
        }

        let content = `
            <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 8px 10px; border-radius: 6px 6px 0 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 13px; font-weight: bold;">${name}</div>
                        <div style="font-size: 9px; opacity: 0.8;">${currency} ${annualIncome.toLocaleString()}</div>
                    </div>
                    <button class="bracket-close-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 12px;">×</button>
                </div>
            </div>
            <div style="padding: 8px;">
        `;

        if (system === 'flat') {
            const rate = brackets[0].rate;
            const totalTax = annualIncome * (rate / 100);
            content += `
                <div style="text-align: center; font-size: 11px;">
                    <div style="background: #e3f2fd; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
                        <div style="font-weight: bold; font-size: 16px; color: #1976d2;">${rate}%</div>
                        <div style="font-size: 9px; color: #666;">flat rate</div>
                    </div>
                    <div style="font-size: 10px; color: #666; margin-bottom: 4px;">
                        ${currency} ${annualIncome.toLocaleString()} × ${rate}% =
                    </div>
                    <div style="font-weight: bold; color: #d63384;">${currency} ${Math.round(totalTax).toLocaleString()}</div>
                </div>
            `;
        } else if (system === 'progressive') {
            let totalTax = 0;
            content += '<div style="font-size: 10px;">';

            brackets.forEach((bracket, index) => {
                const min = bracket.min;
                const max = bracket.max;
                const rate = bracket.rate;

                let taxableInThisBracket = 0;
                let taxFromThisBracket = 0;

                if (annualIncome > min) {
                    const upperBound = max === null ? annualIncome : Math.min(max, annualIncome);
                    taxableInThisBracket = upperBound - min;
                    if (taxableInThisBracket > 0) {
                        taxFromThisBracket = taxableInThisBracket * (rate / 100);
                        totalTax += taxFromThisBracket;
                    }
                }

                const isActive = taxableInThisBracket > 0;
                const maxDisplay = max === null ? '∞' : max.toLocaleString();
                const bgColor = isActive ? '#e8f5e8' : '#f8f9fa';
                const icon = isActive ? '✓' : '○';

                content += `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 3px; padding: 3px 4px; background: ${bgColor}; border-radius: 3px; font-size: 9px;">
                        <span style="color: #666;">${icon} ${min.toLocaleString()}-${maxDisplay}</span>
                        <span style="font-weight: bold;">${rate}%</span>
                        ${isActive ? `<span style="color: #28a745;">${currency} ${Math.round(taxFromThisBracket).toLocaleString()}</span>` : ''}
                    </div>
                `;
            });

            content += `
                <div style="border-top: 1px solid #eee; margin-top: 4px; padding-top: 4px; text-align: center; font-size: 10px;">
                    <div style="font-weight: bold;">Total: ${currency} ${Math.round(totalTax).toLocaleString()}</div>
                    <div style="font-size: 9px; color: #666;">Effective: ${((totalTax / annualIncome) * 100).toFixed(1)}%</div>
                </div>
            `;
            content += '</div>';
        }

        content += '</div>';
        return content;
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
                                ${this.generateActiveBracketDetails(brackets, index, annualIncome, currency)}
                            </div>
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

    // Generate enhanced active bracket details with next bracket info integrated
    generateActiveBracketDetails(brackets, currentBracketIndex, currentIncome, currency) {
        const currentBracket = brackets[currentBracketIndex];
        const nextBracketIndex = currentBracketIndex + 1;

        // Calculate current bracket usage
        const bracketStart = currentBracket.min;
        const bracketEnd = currentBracket.max || null;
        const incomeInBracket = currentIncome - bracketStart;

        let bracketDetails = '';

        // If this is not the highest bracket, show progression and next bracket info
        if (nextBracketIndex < brackets.length && bracketEnd !== null) {
            const bracketSize = bracketEnd - bracketStart;
            const usagePercentage = Math.min(100, (incomeInBracket / bracketSize) * 100);
            const nextBracket = brackets[nextBracketIndex];
            const incomeNeededForNext = nextBracket.min - currentIncome;

            bracketDetails = `
                <div style="margin-top: 4px; font-size: 9px; color: #28a745;">
                    <!-- Bracket Usage Progress Bar -->
                    <div style="margin-bottom: 4px;">
                        <div style="font-size: 8px; color: #666; margin-bottom: 2px;">
                            Bracket usage: ${currency} ${incomeInBracket.toLocaleString()} / ${currency} ${bracketSize.toLocaleString()}
                        </div>
                        <div style="background: #e9ecef; border-radius: 3px; height: 6px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #28a745, #20c997); height: 100%; width: ${usagePercentage.toFixed(1)}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="font-size: 8px; color: #666; margin-top: 1px;">
                            ${usagePercentage.toFixed(1)}% used
                        </div>
                    </div>

                    <!-- Next Bracket Info -->
                    <div style="background: rgba(255,255,255,0.5); padding: 3px 4px; border-radius: 3px; border: 1px solid rgba(255,193,7,0.3);">
                        <div style="color: #856404; font-weight: bold; font-size: 8px; margin-bottom: 2px;">
                            📈 Need +${currency} ${incomeNeededForNext.toLocaleString()} for ${nextBracket.rate}% bracket
                        </div>
                        <div style="color: #666; font-size: 7px;">
                            Next ${currency} ${Math.min(1000, incomeNeededForNext).toLocaleString()} earned → ${nextBracket.rate}% tax rate
                        </div>
                    </div>
                </div>
            `;
        } else {
            // This is the highest bracket
            bracketDetails = `
                <div style="margin-top: 4px; font-size: 9px; color: #28a745;">
                    <div style="background: rgba(255,255,255,0.5); padding: 3px 4px; border-radius: 3px; border: 1px solid rgba(108,117,125,0.3);">
                        <div style="color: #6c757d; font-weight: bold; font-size: 8px; margin-bottom: 2px;">
                            🏆 Highest bracket - all additional income taxed at ${currentBracket.rate}%
                        </div>
                        <div style="color: #666; font-size: 7px;">
                            Income in this bracket: ${currency} ${incomeInBracket.toLocaleString()}
                        </div>
                    </div>
                </div>
            `;
        }

        return bracketDetails;
    }

    // Generate information about the next tax bracket (legacy function kept for compatibility)
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

        // Remove tax bracket sidebar if active
        this.removeTaxBracketSidebar();

        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.countryMarkers = {};
        this.currentTaxResults = [];
    }

    // Set UI mode (compact or full)
    setUIMode(compactUI) {
        this.compactUI = compactUI;

        // Refresh all existing popups with new UI mode
        if (this.currentTaxResults && this.currentTaxResults.length > 0) {
            this.refreshAllPopups();
        }
    }

    // Refresh all popups with current UI mode
    refreshAllPopups() {
        Object.entries(this.countryMarkers).forEach(([countryKey, marker]) => {
            const countryInfo = taxData[countryKey];
            if (countryInfo) {
                let taxResult = null;
                if (this.currentTaxResults) {
                    taxResult = this.currentTaxResults.find(result => result.countryKey === countryKey);
                }
                this.updateMarkerPopup(marker, countryKey, countryInfo, taxResult);
            }
        });
    }
}
