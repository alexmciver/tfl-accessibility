import { handleError, ErrorTypes } from '../utils/errorHandler.js';
import { elements } from '../utils/domUtils.js';

export class StationService {
    constructor() {
        this.stationData = {};
        this.CACHE_KEY = 'tfl_station_data';
        this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    }

    async fetchStationData() {
        try {
            // Check cache first
            const cachedData = this.getFromCache();
            if (cachedData) {
                this.stationData = cachedData;
                return cachedData;
            }

            const response = await fetch('./stations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.stationData = data;
            
            // Save to cache
            this.saveToCache(data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch station data: ${error.message}`);
        }
    }

    getFromCache() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > this.CACHE_DURATION) {
            localStorage.removeItem(this.CACHE_KEY);
            return null;
        }

        return data;
    }

    saveToCache(data) {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
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