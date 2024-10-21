import { API_KEY } from './config.js';

let stationData = {};

const loadingSpinner = document.getElementById("loading-spinner");
const startStationSelect = document.getElementById("start-station");
const endStationSelect = document.getElementById("end-station");
const mapContainer = document.getElementById("map-container");
const overlay = document.getElementById("overlay");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");

// Function to apply dark mode based on preference
const applyDarkMode = (isDarkMode) => {
    const header = document.querySelector('header'); // Get the header element
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        header.classList.add('dark-mode'); // Add dark mode class to header
        moonIcon.style.display = "none"; // Hide moon icon
        sunIcon.style.display = "inline"; // Show sun icon
        darkModeToggle.checked = true; // Set the toggle to checked
    } else {
        document.body.classList.remove('dark-mode');
        header.classList.remove('dark-mode'); // Remove dark mode class from header
        moonIcon.style.display = "inline"; // Show moon icon
        sunIcon.style.display = "none"; // Hide sun icon
        darkModeToggle.checked = false; // Set the toggle to unchecked
    }
};

// Check localStorage for the user's preference or use system preference
const darkModePreference = localStorage.getItem('darkMode');
if (darkModePreference === 'enabled') {
    applyDarkMode(true);
} else if (darkModePreference === 'disabled') {
    applyDarkMode(false);
} else {
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDarkMode(systemPrefersDark);
}

// Event listener for the toggle
darkModeToggle.addEventListener('change', () => {
    const isChecked = darkModeToggle.checked;
    applyDarkMode(isChecked);
    localStorage.setItem('darkMode', isChecked ? 'enabled' : 'disabled'); // Save preference
});

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

const planRoute = () => {
  const start = startStationSelect.value;
  const end = endStationSelect.value;

  if (start === end) {
    alert("Please select different stations for the start and end points.");
    return;
  }

  displayAccessibilityInfo(start, end);
  updateMap(start, end);
};

const displayAccessibilityInfo = (start, end) => {
  const startAccessibility = stationData[start] || 'N/A';
  const endAccessibility = stationData[end] || 'N/A';
  document.getElementById("start-accessibility").textContent = `Accessibility: ${startAccessibility}`;
  document.getElementById("end-accessibility").textContent = `Accessibility: ${endAccessibility}`;
};

const updateMap = (start, end) => {
  const mapIframe = document.getElementById("map");
  mapIframe.src = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${encodeURIComponent(start + " Station, London")}&destination=${encodeURIComponent(end + " Station, London")}&mode=transit&zoom=12`;

  mapContainer.style.display = "block"; // Show the map container
  overlay.classList.add("hidden"); // Hide the overlay
};

const hideOverlay = () => {
  overlay.classList.add("hidden"); // Hide the overlay
};

const resetSelections = () => {
  startStationSelect.selectedIndex = 0; // Reset dropdowns
  endStationSelect.selectedIndex = 0;
  document.getElementById("start-accessibility").textContent = '';
  document.getElementById("end-accessibility").textContent = '';
  mapContainer.style.display = "none"; // Hide the map container
  overlay.classList.remove("hidden"); // Show the overlay
};

// Call the function to fetch data
fetchTFL();
