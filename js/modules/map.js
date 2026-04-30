import { API_KEY } from '../config.js';
import { handleError, ErrorTypes } from '../utils/errorHandler.js';

export class MapService {
    constructor() {
        this.API_KEY = API_KEY;
        this.mapElement = null;
    }

    async initialize(mapElement) {
        this.mapElement = mapElement;
    }

    planRoute(startStation, endStation) {
        if (!this.mapElement) return;
        const origin = `${startStation} Station, London`;
        const destination = `${endStation} Station, London`;
        const mapUrl = this.API_KEY
            ? `https://www.google.com/maps/embed/v1/directions?key=${this.API_KEY}`
                + `&origin=${encodeURIComponent(origin)}`
                + `&destination=${encodeURIComponent(destination)}`
                + `&mode=transit&zoom=12`
            : `https://maps.google.com/maps?output=embed&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=r`;

        this.mapElement.src = mapUrl;
    }

    reset() {
        if (this.mapElement) {
            this.mapElement.src = '';
        }
    }
} 