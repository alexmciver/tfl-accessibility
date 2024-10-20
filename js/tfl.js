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
    if (start && end) {
        const mapIframe = document.getElementById("map");
        mapIframe.src = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${encodeURIComponent(start + " Station, London")}&destination=${encodeURIComponent(end + " Station, London")}&mode=transit&zoom=12`;

        // Display accessibility information
        const startAccessibility = stationData[start] || 'N/A';
        const endAccessibility = stationData[end] || 'N/A';
        document.getElementById("start-accessibility").textContent = `Accessibility: ${startAccessibility}`;
        document.getElementById("end-accessibility").textContent = `Accessibility: ${endAccessibility}`;
    }
};

// Call the function to fetch data
fetchTFL();
