import { taxData, getTaxRateColor } from './taxData.js';
import { calculateTaxesForAllCountries, getTaxAmountColor } from './taxCalculator.js';

let map;
let countryMarkers = {};
let currentTaxResults = [];

// Initialize the map
export function initializeMap() {
    // Initialize the map centered on the world
    map = L.map('worldMap').setView([20, 0], 2);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 2
    }).addTo(map);

    // Add country markers (initially with default colors)
    addCountryMarkers();

    // Set map bounds to prevent excessive panning
    const southWest = L.latLng(-60, -180);
    const northEast = L.latLng(85, 180);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });
}

// Add markers for each country
function addCountryMarkers() {
    Object.entries(taxData).forEach(([countryKey, countryInfo]) => {
        // Start with default color based on tax rates
        const color = '#ccc'; // Default gray until calculations are done

        // Create a circle marker for each country
        const marker = L.circleMarker(countryInfo.coordinates, {
            radius: 8,
            fillColor: color,
            color: '#333',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Create initial popup content
        const popupContent = `
            <div class="custom-popup">
                <h4>${countryInfo.name}</h4>
                <p><strong>Currency:</strong> ${countryInfo.currency}</p>
                <p><strong>System:</strong> ${countryInfo.system.replace('_', ' ')}</p>
                <p style="margin-top: 8px; font-size: 11px; color: #666;">Enter salary to see tax calculations</p>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Add hover effects
        marker.on('mouseover', function(e) {
            this.setStyle({
                radius: 10,
                weight: 2
            });
        });

        marker.on('mouseout', function(e) {
            this.setStyle({
                radius: 8,
                weight: 1
            });
        });

        marker.addTo(map);
        countryMarkers[countryKey] = marker;
    });
}

// Calculate taxes for all countries and update map
export async function calculateAndUpdateMap(monthlyAmount, inputCurrency = 'USD', displayCurrency = 'USD') {
    if (!monthlyAmount || monthlyAmount <= 0) {
        resetMapToDefault();
        return;
    }

    try {
        // Show loading state
        showLoadingState();

        // Calculate taxes for all countries
        const results = await calculateTaxesForAllCountries(monthlyAmount, inputCurrency, displayCurrency);
        currentTaxResults = results;

        // Update map colors based on tax amounts
        updateMapColors(results, displayCurrency);

        // Update popups with tax information
        updateMapPopups(results, displayCurrency);

        // Dispatch event for results table update
        const event = new CustomEvent('taxCalculationsComplete', {
            detail: { results, displayCurrency }
        });
        document.dispatchEvent(event);

        hideLoadingState();

    } catch (error) {
        console.error('Error calculating taxes for all countries:', error);
        hideLoadingState();
        alert('Error calculating taxes: ' + error.message);
    }
}

// Update map marker colors based on tax amounts
function updateMapColors(results, displayCurrency) {
    if (results.length === 0) return;

    // Find max tax amount for color scaling
    const maxTaxAmount = Math.max(...results.map(r => r.taxAmountInDisplayCurrency));

    results.forEach(result => {
        const marker = countryMarkers[result.countryKey];
        if (marker) {
            const color = getTaxAmountColor(result.taxAmountInDisplayCurrency, maxTaxAmount);
            marker.setStyle({
                fillColor: color
            });
        }
    });
}

// Update map popups with tax information
function updateMapPopups(results, displayCurrency) {
    results.forEach(result => {
        const marker = countryMarkers[result.countryKey];
        if (marker) {
            const popupContent = `
                <div class="custom-popup">
                    <h4>${result.countryName}</h4>
                    <p><strong>Currency:</strong> ${result.currency}</p>
                    <p><strong>Tax System:</strong> ${taxData[result.countryKey].system.replace('_', ' ')}</p>
                    <hr style="margin: 8px 0;">
                    <p><strong>Annual Tax:</strong> ${displayCurrency} ${result.taxAmountInDisplayCurrency.toLocaleString()}</p>
                    <p><strong>Effective Rate:</strong> ${result.effectiveRate.toFixed(2)}%</p>
                    <p><strong>Net Income:</strong> ${displayCurrency} ${result.netIncomeInDisplayCurrency.toLocaleString()}</p>
                    ${result.exchangeRate !== 1 ? `<p><small>Exchange Rate: 1 ${result.inputCurrency} = ${result.exchangeRate.toFixed(4)} ${result.currency}</small></p>` : ''}
                </div>
            `;
            marker.setPopupContent(popupContent);
        }
    });
}

// Reset map to default state
function resetMapToDefault() {
    Object.entries(countryMarkers).forEach(([countryKey, marker]) => {
        marker.setStyle({
            fillColor: '#ccc'
        });

        const popupContent = `
            <div class="custom-popup">
                <h4>${taxData[countryKey].name}</h4>
                <p><strong>Currency:</strong> ${taxData[countryKey].currency}</p>
                <p><strong>System:</strong> ${taxData[countryKey].system.replace('_', ' ')}</p>
                <p style="margin-top: 8px; font-size: 11px; color: #666;">Enter salary to see tax calculations</p>
            </div>
        `;
        marker.setPopupContent(popupContent);
    });

    currentTaxResults = [];
}

// Show loading state
function showLoadingState() {
    const loadingDiv = document.getElementById('mapLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
}

// Hide loading state
function hideLoadingState() {
    const loadingDiv = document.getElementById('mapLoading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Get current tax results
export function getCurrentTaxResults() {
    return currentTaxResults;
}

// Highlight country on map
export function highlightCountryOnMap(countryKey) {
    // Reset all markers
    Object.values(countryMarkers).forEach(marker => {
        marker.setStyle({
            weight: 1,
            radius: 8
        });
    });

    // Highlight selected country
    if (countryMarkers[countryKey]) {
        countryMarkers[countryKey].setStyle({
            weight: 3,
            radius: 12
        });

        // Pan to the selected country
        map.panTo(countryMarkers[countryKey].getLatLng());

        // Open popup
        countryMarkers[countryKey].openPopup();
    }
}