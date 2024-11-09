import { API_KEY } from './config.js';

// Station data management
let stationData = {};

// DOM Elements
const elements = {
    loadingSpinner: document.getElementById("loading-spinner"),
    startStationSelect: document.getElementById("start-station"),
    endStationSelect: document.getElementById("end-station"),
    mapContainer: document.getElementById("map-container"),
    overlay: document.getElementById("overlay"),
    startAccessibility: document.getElementById("start-accessibility"),
    endAccessibility: document.getElementById("end-accessibility"),
};

// Data fetching
export const fetchTFL = async () => {
    showLoadingSpinner();
    try {
        const data = await fetchStationData();
        initializeApplication(data);
    } catch (error) {
        handleError(error);
    } finally {
        hideLoadingSpinner();
    }
};

const fetchStationData = async () => {
    const response = await fetch('./stations.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};

// Initialization
const initializeApplication = (data) => {
    stationData = data;
    populateStationDropdowns();
    setupEventListeners();
};

// UI Management
const showLoadingSpinner = () => elements.loadingSpinner.style.display = "block";
const hideLoadingSpinner = () => elements.loadingSpinner.style.display = "none";
const hideOverlay = () => elements.overlay.classList.add("hidden");

const populateStationDropdowns = () => {
    const stations = Object.keys(stationData);
    stations.forEach(stationName => {
        addStationOption(elements.startStationSelect, stationName);
        addStationOption(elements.endStationSelect, stationName);
    });
};

const addStationOption = (selectElement, stationName) => {
    const option = document.createElement("option");
    option.value = stationName;
    option.text = stationName;
    selectElement.add(option.cloneNode(true));
};

// Event Handlers
const setupEventListeners = () => {
    document.getElementById("plan-route").addEventListener("click", handlePlanRoute);
    elements.overlay.addEventListener("click", hideOverlay);
    document.getElementById("reset-button").addEventListener("click", handleReset);
};

const handlePlanRoute = () => {
    const start = elements.startStationSelect.value;
    const end = elements.endStationSelect.value;

    if (!validateRouteSelection(start, end)) return;

    displayAccessibilityInfo(start, end);
    updateMap(start, end);
};

// Validation
const validateRouteSelection = (start, end) => {
    if (start === end) {
        alert("Please select different stations for the start and end points.");
        return false;
    }
    return true;
};

// Accessibility Information
const displayAccessibilityInfo = (start, end) => {
    const startAccessibility = getStationAccessibility(start);
    const endAccessibility = getStationAccessibility(end);
    
    elements.startAccessibility.textContent = `Accessibility: ${startAccessibility}`;
    elements.endAccessibility.textContent = `Accessibility: ${endAccessibility}`;
};

const getStationAccessibility = (station) => stationData[station] || 'N/A';

// Map Management
const updateMap = (start, end) => {
    const mapConfig = createMapConfig(start, end);
    initializeGoogleMap(mapConfig);
};

const createMapConfig = (start, end) => ({
    origin: start,
    destination: end,
    mapOptions: {
        zoom: 12,
        center: { lat: 51.5074, lng: -0.1278 },
    },
    transitOptions: {
        modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN],
        routingPreference: google.maps.TransitRoutePreference.PREFER_ACCESSIBLE,
    }
});

const initializeGoogleMap = (config) => {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    
    const map = new google.maps.Map(document.getElementById("map"), config.mapOptions);
    directionsRenderer.setMap(map);

    const request = {
        origin: config.origin,
        destination: config.destination,
        travelMode: google.maps.TravelMode.TRANSIT,
        transitOptions: config.transitOptions,
    };

    directionsService.route(request, (result, status) => 
        handleDirectionsResponse(result, status, directionsRenderer));
};

const handleDirectionsResponse = (result, status, directionsRenderer) => {
    if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        elements.mapContainer.style.display = "block";
        elements.overlay.classList.add("hidden");
    } else {
        alert("Directions request failed due to " + status);
    }
};

// Reset functionality
const handleReset = () => {
    resetSelections();
    resetAccessibilityInfo();
    resetMapDisplay();
};

const resetSelections = () => {
    elements.startStationSelect.selectedIndex = 0;
    elements.endStationSelect.selectedIndex = 0;
};

const resetAccessibilityInfo = () => {
    elements.startAccessibility.textContent = '';
    elements.endAccessibility.textContent = '';
};

const resetMapDisplay = () => {
    elements.mapContainer.style.display = "none";
    elements.overlay.classList.remove("hidden");
};

// Error handling
const handleError = (error) => {
    console.error('Error fetching station data:', error);
    alert(`Failed to load station data. Error: ${error.message}`);
};

// Call the function to fetch data
fetchTFL();
