import { API_KEY } from './config.js';

let stationData = {};

export const fetchTFL = async () => {
  const loadingSpinner = document.getElementById("loading-spinner");
  loadingSpinner.style.display = "block"; // Show spinner

  try {
    const response = await fetch('./stations.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    stationData = await response.json();

    const startStationSelect = document.getElementById("start-station");
    const endStationSelect = document.getElementById("end-station");

    // Populate dropdowns with station names
    for (const stationName in stationData) {
      const option = document.createElement("option");
      option.value = stationName;
      option.text = stationName;
      startStationSelect.add(option.cloneNode(true));
      endStationSelect.add(option);
    }

    // Add event listener after populating dropdowns
    document.getElementById("plan-route").addEventListener("click", planRoute);

    // Add event listener to hide overlay on click anywhere
    const overlay = document.getElementById("overlay");
    overlay.addEventListener("click", () => {
      overlay.classList.add("hidden"); // Hide the overlay by adding the hidden class
    });

  } catch (error) {
    console.error('Error fetching station data:', error);
    alert(`Failed to load station data. Error: ${error.message}`);
  } finally {
    loadingSpinner.style.display = "none"; // Hide spinner
  }
};

const planRoute = () => {
  const startStationSelect = document.getElementById("start-station");
  const endStationSelect = document.getElementById("end-station");
  const start = startStationSelect.value;
  const end = endStationSelect.value;
  const mapContainer = document.getElementById("map-container");
  const overlay = document.getElementById("overlay");

  // Display accessibility information
  const startAccessibility = stationData[start] || 'N/A';
  const endAccessibility = stationData[end] || 'N/A';
  document.getElementById("start-accessibility").textContent = `Accessibility: ${startAccessibility}`;
  document.getElementById("end-accessibility").textContent = `Accessibility: ${endAccessibility}`;

  if (start && end) {
    const mapIframe = document.getElementById("map");
    mapIframe.src = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${encodeURIComponent(start + " Station, London")}&destination=${encodeURIComponent(end + " Station, London")}&mode=transit&zoom=12`;

    // Show the map container and hide the overlay
    mapContainer.style.display = "block"; // Show the map container
    overlay.classList.add("hidden"); // Hide the overlay
  } else {
    // Hide the map container and show the overlay if no route is selected
    mapContainer.style.display = "none"; // Hide the map container
    overlay.classList.remove("hidden"); // Show the overlay by removing the hidden class
  }
};

// Call the function to fetch data
fetchTFL();
