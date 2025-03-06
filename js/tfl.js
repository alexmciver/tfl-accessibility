import { StationService } from './modules/stations.js';
import { MapService } from './modules/map.js';
import { handleError, ErrorTypes } from './utils/errorHandler.js';
import { initializeDarkMode } from './modules/darkMode.js';

// Initialize services
const stationService = new StationService();
const mapService = new MapService();

// DOM elements - these will be properly initialized in the fetchTFL function
let loadingSpinner;
let startStationSelect;
let endStationSelect;
let mapContainer;
let overlay;

const updateSpinnerMessage = (message) => {
    const spinnerMessage = document.querySelector('.spinner-message');
    if (spinnerMessage) {
        spinnerMessage.textContent = message;
    }
};

export const fetchTFL = async () => {
    // Initialize DOM elements here to ensure they're available
    loadingSpinner = document.getElementById("loading-spinner");
    startStationSelect = document.getElementById("start-station");
    endStationSelect = document.getElementById("end-station");
    mapContainer = document.getElementById("map-container");
    overlay = document.getElementById("overlay");
    
    if (loadingSpinner) {
        loadingSpinner.style.display = "block";
        updateSpinnerMessage("Loading station data...");
    }

    try {
        const data = await stationService.fetchStationData();
        
        if (loadingSpinner) {
            updateSpinnerMessage("Preparing station options...");
        }
        
        stationService.populateDropdowns();
        setupEventListeners();
        
        const mapElement = document.getElementById("map");
        if (mapElement) {
            await mapService.initialize(mapElement);
        } else {
            console.error("Map element not found");
        }
    } catch (error) {
        console.error(`Failed to load station data. Error: ${error.message}`);
        handleError(error, ErrorTypes.STATION_DATA);
    } finally {
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }
    }
};

const setupEventListeners = () => {
    const planRouteBtn = document.getElementById("plan-route");
    if (planRouteBtn) {
        planRouteBtn.addEventListener("click", planRoute);
    }
    
    if (overlay) {
        overlay.addEventListener("click", hideOverlay);
    }
    
    const resetButton = document.getElementById("reset-button");
    if (resetButton) {
        resetButton.addEventListener("click", (event) => {
            event.preventDefault();
            resetSelections().catch(error => {
                console.error("Error resetting selections:", error);
            });
        });
    }
};

const getAccessibilityDescription = (accessibilityLevel) => {
    switch(accessibilityLevel) {
        case 'Full':
            return 'Full wheelchair access';
        case 'Partial':
            return 'Partial wheelchair access';
        case 'Interchange':
            return 'Accessible interchange';
        case 'None':
            return 'Limited accessibility - may require assistance';
        default:
            return 'Accessibility information unavailable';
    }
};

const planRoute = async () => {
    if (!startStationSelect || !endStationSelect) {
        console.error("Station select elements not found");
        return;
    }
    
    const start = startStationSelect.value;
    const end = endStationSelect.value;

    if (start === end) {
        alert("Please select different stations for the start and end points.");
        return;
    }

    // Get route preferences
    const routePreferenceInputs = document.getElementsByName('route-preference');
    let routePreference = 'best'; // default
    
    for (const input of routePreferenceInputs) {
        if (input.checked) {
            routePreference = input.value;
            break;
        }
    }
    
    // Check if we should show accessibility info
    const showAccessibilityInfo = document.getElementById('wheelchair-accessible').checked;
    
    // Get station accessibility info if needed
    let startAccessibility = 'Unknown';
    let endAccessibility = 'Unknown';
    
    if (showAccessibilityInfo) {
        startAccessibility = stationService.getStationAccessibility(start);
        endAccessibility = stationService.getStationAccessibility(end);
        
        // Alert user if one of the stations has limited accessibility
        if (startAccessibility === 'None' || endAccessibility === 'None') {
            if (!confirm(`Note: ${startAccessibility === 'None' ? start : end} Station has limited accessibility. Would you like to proceed with planning this route?`)) {
                return; // User canceled
            }
        }
        
        // Display accessibility info in the form
        displayAccessibilityInfo(start, end);
    } else {
        // Clear accessibility info
        const startAccessibilityEl = document.getElementById("start-accessibility");
        if (startAccessibilityEl) {
            startAccessibilityEl.textContent = '';
        }
        
        const endAccessibilityEl = document.getElementById("end-accessibility");
        if (endAccessibilityEl) {
            endAccessibilityEl.textContent = '';
        }
    }
    
    // Get a user-friendly description of the route preference
    const preferenceDescription = getPreferenceDescription(routePreference);
    
    if (loadingSpinner) {
        loadingSpinner.style.display = "block";
        updateSpinnerMessage(`Planning route between ${start} and ${end}...`);
    }
    
    try {
        // Small delay to show initial message before updating
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (loadingSpinner) {
            updateSpinnerMessage(`Finding ${preferenceDescription.toLowerCase()}...`);
        }
        
        await mapService.planRoute(start, end, routePreference);
        
        // Update route details with accessibility info if needed
        const routeDetails = document.getElementById("route-details");
        if (routeDetails) {
            let routeHTML = `
                <div class="route-accessibility-info">
                    <p><strong>${preferenceDescription}</strong></p>`;
            
            if (showAccessibilityInfo) {
                routeHTML += `
                    <p><i class="fas fa-map-marker-alt"></i> ${start} - ${getAccessibilityDescription(startAccessibility)}</p>
                    <p><i class="fas fa-flag"></i> ${end} - ${getAccessibilityDescription(endAccessibility)}</p>
                    <p><i class="fas fa-wheelchair"></i> Consider accessibility when following this route</p>`;
            } else {
                routeHTML += `
                    <p><i class="fas fa-map-marker-alt"></i> ${start}</p>
                    <p><i class="fas fa-flag"></i> ${end}</p>`;
            }
            
            routeHTML += `</div>`;
            routeDetails.innerHTML = routeHTML;
        }
        
        // Small delay to show success message before hiding
        if (loadingSpinner) {
            updateSpinnerMessage(`Route found! Loading map view...`);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        if (mapContainer) {
            mapContainer.style.display = "block";
        }
        
        if (overlay) {
            overlay.classList.add("hidden");
        }
    } catch (error) {
        console.error("Error planning route:", error);
        handleError(error, ErrorTypes.MAPS_INITIALIZATION);
    } finally {
        if (loadingSpinner) {
            loadingSpinner.style.display = "none";
        }
    }
};

const getPreferenceDescription = (preference) => {
    switch(preference) {
        case 'best':
            return 'Route';
        case 'fewer_transfers':
            return 'Route with Fewer Transfers';
        case 'less_walking':
            return 'Route with Less Walking';
        default:
            return 'Route';
    }
};

const displayAccessibilityInfo = (start, end) => {
    const startAccessibility = stationService.stationData[start] || 'N/A';
    const endAccessibility = stationService.stationData[end] || 'N/A';
    
    const startAccessibilityEl = document.getElementById("start-accessibility");
    if (startAccessibilityEl) {
        startAccessibilityEl.textContent = `Accessibility: ${startAccessibility}`;
    }
    
    const endAccessibilityEl = document.getElementById("end-accessibility");
    if (endAccessibilityEl) {
        endAccessibilityEl.textContent = `Accessibility: ${endAccessibility}`;
    }
};

const hideOverlay = () => {
    if (overlay) {
        overlay.classList.add("hidden");
    }
};

const resetSelections = async () => {
    if (startStationSelect) {
        startStationSelect.selectedIndex = 0;
    }
    if (endStationSelect) {
        endStationSelect.selectedIndex = 0;
    }
    
    const startAccessibilityEl = document.getElementById("start-accessibility");
    if (startAccessibilityEl) {
        startAccessibilityEl.textContent = '';
    }
    
    const endAccessibilityEl = document.getElementById("end-accessibility");
    if (endAccessibilityEl) {
        endAccessibilityEl.textContent = '';
    }
    
    // Clear route details
    const routeDetails = document.getElementById("route-details");
    if (routeDetails) {
        routeDetails.innerHTML = '';
    }
    
    if (mapContainer) {
        mapContainer.style.display = "none";
    }
    
    if (overlay) {
        overlay.classList.remove("hidden");
    }
    
    // Reset services (now handling async properly)
    try {
        if (stationService) {
            stationService.reset();
        }
        
        if (mapService) {
            await mapService.reset();
        }
    } catch (error) {
        console.error("Error during reset:", error);
    }
};

// Initialize everything
const initialize = async () => {
    initializeDarkMode();
    await fetchTFL();
};

// Call initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
