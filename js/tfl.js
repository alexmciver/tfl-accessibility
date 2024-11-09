import { MapService } from './modules/map.js';
import { handleError, ErrorTypes } from './utils/errorHandler.js';

let mapService = new MapService();
let stationData = {};

const loadingSpinner = document.getElementById("loading-spinner");
const startStationSelect = document.getElementById("start-station");
const endStationSelect = document.getElementById("end-station");
const mapContainer = document.getElementById("map-container");
const overlay = document.getElementById("overlay");

export const fetchTFL = async () => {
    loadingSpinner.style.display = "block"; // Show spinner

    try {
        const response = await fetch('./stations.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        stationData = await response.json();
        populateStationDropdowns();
        setupEventListeners();
        await mapService.initialize(document.getElementById("map")); // Initialize map
    } catch (error) {
        console.error('Error fetching station data:', error);
        alert(`Failed to load station data. Error: ${error.message}`);
    } finally {
        loadingSpinner.style.display = "none"; // Hide spinner
    }
};

const populateStationDropdowns = () => {
    for (const stationName in stationData) {
        const option = document.createElement("option");
        option.value = stationName;
        option.text = stationName;
        startStationSelect.add(option.cloneNode(true));
        endStationSelect.add(option);
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
        await mapService.planRoute(start, end); // Use MapService instead of updateMap
        mapContainer.style.display = "block";
        overlay.classList.add("hidden");
    } catch (error) {
        handleError(error, ErrorTypes.MAPS_INITIALIZATION);
    }
};

const displayAccessibilityInfo = (start, end) => {
    const startAccessibility = stationData[start] || 'N/A';
    const endAccessibility = stationData[end] || 'N/A';
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
    if (mapService) {
        mapService.reset(); // Reset the map if needed
    }
};

// Call the function to fetch data
fetchTFL();
