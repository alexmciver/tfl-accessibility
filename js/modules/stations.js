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
            const cachedData = this.getCachedData();
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
            
            this.saveToCache(data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch station data: ${error.message}`);
        }
    }

    getCachedData() {
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

    isAccessible(accessibility) {
        return ['Full', 'Partial', 'Interchange'].includes(accessibility);
    }

    populateDropdowns() {
        if (!this.stationData || Object.keys(this.stationData).length === 0) {
            return;
        }

        const accessibleStations = Object.entries(this.stationData)
            .filter(([_, accessibility]) => {
                const isAccessible = this.isAccessible(accessibility);
                return isAccessible;
            })
            .map(([station, accessibility]) => {
                const display = `${station} ${this.getAccessibilityIcon(accessibility)}`;
                return {
                    name: station,
                    display: display,
                    accessibility
                };
            });

        accessibleStations.forEach(station => {
            this.addStationOption(elements.startStationSelect, station);
            this.addStationOption(elements.endStationSelect, station);
        });
    }

    getAccessibilityIcon(accessibility) {
        switch(accessibility) {
            case 'Full': return '♿';
            case 'Partial': return '⚡';
            case 'Interchange': return '↔️';
            default: return '';
        }
    }

    addStationOption(selectElement, station) {
        const option = document.createElement("option");
        option.value = station.name;
        option.text = station.display;
        option.dataset.accessibility = station.accessibility;
        selectElement.add(option);
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