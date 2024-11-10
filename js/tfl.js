import { StationService } from './modules/stations.js';
import { MapService } from './modules/map.js';
import { handleError, ErrorTypes } from './utils/errorHandler.js';
import { initializeDarkMode } from './modules/darkMode.js';

// Initialize services
const stationService = new StationService();
const mapService = new MapService();

// DOM elements
const loadingSpinner = document.getElementById("loading-spinner");
const startStationSelect = document.getElementById("start-station");
const endStationSelect = document.getElementById("end-station");
const mapContainer = document.getElementById("map-container");
const overlay = document.getElementById("overlay");
const backToTopButton = document.getElementById("back-to-top");

export const fetchTFL = async () => {
    loadingSpinner.style.display = "block";

    try {
        const data = await stationService.fetchStationData();
        stationService.populateDropdowns();
        setupEventListeners();
        await mapService.initialize(document.getElementById("map"));
    } catch (error) {
        alert(`Failed to load station data. Error: ${error.message}`);
    } finally {
        loadingSpinner.style.display = "none";
    }
};

const setupEventListeners = () => {
    document.getElementById("plan-route").addEventListener("click", planRoute);
    overlay.addEventListener("click", hideOverlay);
    document.getElementById("reset-button").addEventListener("click", resetSelections);
};

const planRoute = async () => {
    const start = startStationSelect.value;
    const end = endStationSelect.value;

    if (start === end) {
        alert("Please select different stations for the start and end points.");
        return;
    }

    displayAccessibilityInfo(start, end);
    try {
        await mapService.planRoute(start, end);
        mapContainer.style.display = "block";
        overlay.classList.add("hidden");
    } catch (error) {
        handleError(error, ErrorTypes.MAPS_INITIALIZATION);
    }
};

const displayAccessibilityInfo = (start, end) => {
    const startAccessibility = stationService.stationData[start] || 'N/A';
    const endAccessibility = stationService.stationData[end] || 'N/A';
    document.getElementById("start-accessibility").textContent = `Accessibility: ${startAccessibility}`;
    document.getElementById("end-accessibility").textContent = `Accessibility: ${endAccessibility}`;
};

const hideOverlay = () => {
    overlay.classList.add("hidden");
};

const resetSelections = () => {
    startStationSelect.selectedIndex = 0;
    endStationSelect.selectedIndex = 0;
    document.getElementById("start-accessibility").textContent = '';
    document.getElementById("end-accessibility").textContent = '';
    mapContainer.style.display = "none";
    overlay.classList.remove("hidden");
    if (stationService) {
        stationService.reset();
    }
};

// Back to top functionality
const initializeBackToTop = () => {
    window.onscroll = function() {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    };

    backToTopButton.addEventListener("click", function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
};

// Initialize everything
const initialize = async () => {
    initializeDarkMode();
    initializeBackToTop();
    await fetchTFL();
};

// Call initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
