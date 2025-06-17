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
        
        const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${this.API_KEY}`
            + `&origin=${encodeURIComponent(startStation + ' Station, London')}`
            + `&destination=${encodeURIComponent(endStation + ' Station, London')}`
            + `&mode=transit&zoom=12`;

        this.mapElement.src = mapUrl;
    }

    reset() {
        if (this.mapElement) {
            this.mapElement.src = '';
        }
    }
} 