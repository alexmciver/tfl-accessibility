import { API_KEY } from '../config.js';
import { handleError, ErrorTypes } from '../utils/errorHandler.js';

export class MapService {
    constructor() {
        this.mapElement = null;
        console.log('MapService initialized'); // Debug log
    }

    initialize(mapElement) {
        console.log('Initializing map with element:', mapElement); // Debug log
        if (!(mapElement instanceof HTMLIFrameElement)) {
            console.error('Map element is not an iframe');
            return;
        }
        this.mapElement = mapElement;
    }

    async planRoute(start, end) {
        try {
            console.log('Planning route from', start, 'to', end); // Debug log
            console.log('Map element:', this.mapElement); // Debug log

            if (!this.mapElement) {
                throw new Error('Map iframe not initialized');
            }
            
            const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}&origin=${encodeURIComponent(start + " Station, London")}&destination=${encodeURIComponent(end + " Station, London")}&mode=transit&zoom=12`;
            
            console.log('Map URL:', mapUrl); // Debug log
            this.mapElement.src = mapUrl;
            console.log('Map source updated'); // Debug log

        } catch (error) {
            console.error('Route planning error:', error);
            handleError(error, ErrorTypes.MAPS_INITIALIZATION);
        }
    }

    reset() {
        if (this.mapElement) {
            this.mapElement.src = '';
        }
    }
} 