import { handleError, ErrorTypes } from '../utils/errorHandler.js';
import { elements } from '../utils/domUtils.js';
import { stationsDataFallback } from '../data/stationsData.js';

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

            const data = await this.fetchFromKnownPathsOrFallback();
            if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
                throw new Error('Station data is empty or invalid.');
            }
            this.stationData = data;
            
            this.saveToCache(data);
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch station data: ${error.message}`);
        }
    }

    async fetchFromKnownPathsOrFallback() {
        const paths = [
            './data/stations.json',
            'data/stations.json',
        ];

        let lastError = null;

        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    return data;
                }
            } catch (error) {
                lastError = error;
            }
        }

        if (stationsDataFallback && typeof stationsDataFallback === 'object' && Object.keys(stationsDataFallback).length > 0) {
            return stationsDataFallback;
        }

        throw lastError || new Error('Unable to load station data from known paths or fallback.');
    }

    getCachedData() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (!cached) return null;

        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp > this.CACHE_DURATION) {
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }

            return data;
        } catch (error) {
            localStorage.removeItem(this.CACHE_KEY);
            return null;
        }
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

        elements.startStationSelect.innerHTML = '';
        elements.endStationSelect.innerHTML = '';
        this.addPlaceholderOption(elements.startStationSelect, 'Select a start station');
        this.addPlaceholderOption(elements.endStationSelect, 'Select an end station');

        const allStations = Object.entries(this.stationData)
            .map(([station, accessibility]) => {
                const display = `${station} ${this.getAccessibilityIcon(accessibility)}`;
                return {
                    name: station,
                    display: display,
                    accessibility
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        allStations.forEach(station => {
            this.addStationOption(elements.startStationSelect, station);
            this.addStationOption(elements.endStationSelect, station);
        });
    }

    addPlaceholderOption(selectElement, text) {
        const option = document.createElement("option");
        option.value = '';
        option.text = text;
        option.disabled = true;
        option.selected = true;
        selectElement.add(option);
    }

    getAccessibilityIcon(accessibility) {
        switch(accessibility) {
            case 'Full': return '♿';
            case 'Partial': return '⚡';
            case 'Interchange': return '↔️';
            case 'None': return '⚠️';
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

    reset() {
        elements.startStationSelect.selectedIndex = 0;
        elements.endStationSelect.selectedIndex = 0;
    }
} 