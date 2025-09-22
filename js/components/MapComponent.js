// Map Component - Handles all map-related functionality
import { taxData, getTaxRateColor } from '../taxData.js';
import { getTaxAmountColor } from '../taxCalculator.js';

export class MapComponent {
    constructor(containerId = 'worldMap') {
        this.containerId = containerId;
        this.map = null;
        this.countryMarkers = {};
        this.currentTaxResults = [];
        this.loadingElement = null;

        this.init();
    }

    // Initialize the map
    init() {
        this.createMap();
        this.addCountryMarkers();
        this.setupMapBounds();
        this.setupLoadingElement();
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
        const marker = L.circleMarker(countryInfo.coordinates, {
            radius: 8,
            fillColor: '#ccc',
            color: '#333',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Create initial popup
        this.updateMarkerPopup(marker, countryKey, countryInfo);

        // Add hover effects
        this.addMarkerHoverEffects(marker);

        return marker;
    }

    // Update marker popup content
    updateMarkerPopup(marker, countryKey, countryInfo, taxResult = null) {
        let popupContent;

        if (taxResult) {
            popupContent = `
                <div class="custom-popup">
                    <h4>${taxResult.countryName}</h4>
                    <p><strong>Currency:</strong> ${taxResult.currency}</p>
                    <p><strong>Tax System:</strong> ${countryInfo.system.replace('_', ' ')}</p>
                    <hr style="margin: 8px 0;">
                    <p><strong>Annual Tax:</strong> ${taxResult.displayCurrency} ${taxResult.taxAmountInDisplayCurrency.toLocaleString()}</p>
                    <p><strong>Effective Rate:</strong> ${taxResult.effectiveRate.toFixed(2)}%</p>
                    <p><strong>Net Income:</strong> ${taxResult.displayCurrency} ${taxResult.netIncomeInDisplayCurrency.toLocaleString()}</p>
                    ${taxResult.exchangeRate !== 1 ? `<p><small>Exchange Rate: 1 ${taxResult.inputCurrency} = ${taxResult.exchangeRate.toFixed(4)} ${taxResult.currency}</small></p>` : ''}
                </div>
            `;
        } else {
            popupContent = `
                <div class="custom-popup">
                    <h4>${countryInfo.name}</h4>
                    <p><strong>Currency:</strong> ${countryInfo.currency}</p>
                    <p><strong>System:</strong> ${countryInfo.system.replace('_', ' ')}</p>
                    <p style="margin-top: 8px; font-size: 11px; color: #666;">Enter salary to see tax calculations</p>
                </div>
            `;
        }

        marker.bindPopup(popupContent);
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
    }

    // Update marker colors based on tax amounts
    updateMarkerColors(results) {
        const maxTaxAmount = Math.max(...results.map(r => r.taxAmountInDisplayCurrency));

        results.forEach(result => {
            const marker = this.countryMarkers[result.countryKey];
            if (marker) {
                const color = getTaxAmountColor(result.taxAmountInDisplayCurrency, maxTaxAmount);
                marker.setStyle({ fillColor: color });
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

    // Reset map to default state
    resetToDefault() {
        Object.entries(this.countryMarkers).forEach(([countryKey, marker]) => {
            marker.setStyle({ fillColor: '#ccc' });

            const countryInfo = taxData[countryKey];
            this.updateMarkerPopup(marker, countryKey, countryInfo);
        });

        this.currentTaxResults = [];
    }

    // Highlight specific country on map
    highlightCountry(countryKey) {
        // Reset all markers
        Object.values(this.countryMarkers).forEach(marker => {
            marker.setStyle({
                weight: 1,
                radius: 8
            });
        });

        // Highlight selected country
        const marker = this.countryMarkers[countryKey];
        if (marker) {
            marker.setStyle({
                weight: 3,
                radius: 12
            });

            // Pan to country and open popup
            this.map.panTo(marker.getLatLng());
            marker.openPopup();
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

    // Destroy the map
    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.countryMarkers = {};
        this.currentTaxResults = [];
    }
}