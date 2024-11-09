import { handleMapsError, ErrorTypes, handleError } from '../utils/errorHandler.js';
import { elements } from '../utils/domUtils.js';

export class MapService {
    constructor() {
        this.directionsService = null;
        this.directionsRenderer = null;
        this.map = null;
    }

    initialize(mapElement) {
        try {
            if (!window.google || !window.google.maps) {
                throw new Error('Google Maps not loaded');
            }

            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer();
            
            this.map = new google.maps.Map(mapElement, {
                zoom: 12,
                center: { lat: 51.5074, lng: -0.1278 }, // London center
            });

            this.directionsRenderer.setMap(this.map);
        } catch (error) {
            handleError(error, ErrorTypes.MAPS_INITIALIZATION);
        }
    }

    async planRoute(start, end) {
        const request = {
            origin: `${start} Station, London`,
            destination: `${end} Station, London`,
            travelMode: google.maps.TravelMode.TRANSIT,
            transitOptions: {
                modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.TRAIN],
                routingPreference: google.maps.TransitRoutePreference.PREFER_ACCESSIBLE,
            },
        };

        try {
            const result = await this.getDirections(request);
            this.directionsRenderer.setDirections(result);
            elements.mapContainer.style.display = "block";
            elements.overlay.classList.add("hidden");
        } catch (error) {
            handleMapsError(error);
        }
    }

    getDirections(request) {
        return new Promise((resolve, reject) => {
            this.directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    resolve(result);
                } else {
                    reject(status);
                }
            });
        });
    }

    reset() {
        if (this.directionsRenderer) {
            this.directionsRenderer.setDirections({ routes: [] });
        }
    }
} 