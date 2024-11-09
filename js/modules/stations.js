import { handleError, ErrorTypes } from '../utils/errorHandler.js';
import { elements } from '../utils/domUtils.js';

export class StationService {
    constructor() {
        this.stationData = {};
    }

    async fetchStationData() {
        try {
            const response = await fetch('./stations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.stationData = await response.json();
            return this.stationData;
        } catch (error) {
            throw new Error(`Failed to fetch station data: ${error.message}`);
        }
    }

    populateDropdowns() {
        const stations = Object.keys(this.stationData);
        stations.forEach(stationName => {
            this.addStationOption(elements.startStationSelect, stationName);
            this.addStationOption(elements.endStationSelect, stationName);
        });
    }

    addStationOption(selectElement, stationName) {
        const option = document.createElement("option");
        option.value = stationName;
        option.text = stationName;
        selectElement.add(option.cloneNode(true));
    }

    validateRouteSelection(start, end) {
        try {
            if (!start || !end) {
                throw new Error('Please select both start and end stations.');
            }
            if (start === end) {
                throw new Error('Please select different stations for the start and end points.');
            }
            return true;
        } catch (error) {
            handleError(error, ErrorTypes.VALIDATION);
            return false;
        }
    }

    getStationAccessibility(station) {
        return this.stationData[station] || 'N/A';
    }

    displayAccessibilityInfo(start, end) {
        const startAccessibility = this.getStationAccessibility(start);
        const endAccessibility = this.getStationAccessibility(end);
        
        elements.startAccessibility.textContent = `Accessibility: ${startAccessibility}`;
        elements.endAccessibility.textContent = `Accessibility: ${endAccessibility}`;
    }
} 