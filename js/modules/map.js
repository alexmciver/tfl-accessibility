import { API_KEY } from '../config.js';
import { handleError, ErrorTypes } from '../utils/errorHandler.js';

export class MapService {
    constructor() {
        this.API_KEY = API_KEY;
        this.mapElement = null;
    }

    async initialize(mapElement) {
        if (!mapElement) {
            return Promise.reject(new Error("Map element is null"));
        }
        
        this.mapElement = mapElement;
        
        return Promise.resolve();
    }

    async planRoute(startStation, endStation, routePreference = 'best') {
        if (!this.mapElement) {
            console.error("Map element not found");
            return Promise.reject(new Error("Map element not found"));
        }
        
        return new Promise((resolve, reject) => {
            try {
                // Simplest possible URL with minimal parameters
                const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${this.API_KEY}`
                    + `&origin=${encodeURIComponent(startStation + ' Station, London')}`
                    + `&destination=${encodeURIComponent(endStation + ' Station, London')}`
                    + `&mode=transit`;

                // Handle iframe load event
                const handleLoad = () => {
                    this.mapElement.removeEventListener('load', handleLoad);
                    this.mapElement.removeEventListener('error', handleError);
                    resolve();
                };

                // Handle iframe error event
                const handleError = (error) => {
                    this.mapElement.removeEventListener('load', handleLoad);
                    this.mapElement.removeEventListener('error', handleError);
                    reject(new Error("Failed to load map: " + error));
                };

                // Add event listeners
                this.mapElement.addEventListener('load', handleLoad);
                this.mapElement.addEventListener('error', handleError);

                // Set iframe src
                this.mapElement.src = mapUrl;
            } catch (error) {
                reject(error);
            }
        });
    }

    async reset() {
        if (!this.mapElement) {
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            // Set up a load handler for when the iframe src is cleared
            const handleLoad = () => {
                this.mapElement.removeEventListener('load', handleLoad);
                resolve();
            };
            
            this.mapElement.addEventListener('load', handleLoad);
            
            // Clear the iframe src
            this.mapElement.src = '';
            
            // If the load event doesn't fire (which can happen with empty src),
            // resolve after a short timeout
            setTimeout(resolve, 100);
        });
    }
} 