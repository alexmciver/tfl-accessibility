import { MapService } from './modules/map.js';
import { StationService } from './modules/stations.js';
import { UIService } from './modules/ui.js';
import { handleError, ErrorTypes } from './utils/errorHandler.js';
import { elements } from './utils/domUtils.js';
import { debounce } from './utils/debounce.js';

class TFLService {
    constructor() {
        this.mapService = new MapService();
        this.stationService = new StationService();
        this.uiService = new UIService();
        
        // Debounce route planning to prevent excessive API calls
        this.debouncedPlanRoute = debounce(
            this.handlePlanRoute.bind(this),
            300
        );
    }

    async initialize() {
        this.uiService.showLoadingSpinner();
        try {
            await this.stationService.fetchStationData();
            this.stationService.populateDropdowns();
            this.mapService.initialize(elements.map);
            this.setupEventListeners();
        } catch (error) {
            handleError(error, ErrorTypes.STATION_DATA);
        } finally {
            this.uiService.hideLoadingSpinner();
        }
    }

    setupEventListeners() {
        document.getElementById("plan-route")
            .addEventListener("click", () => this.debouncedPlanRoute());
        
        elements.overlay
            .addEventListener("click", () => this.uiService.hideOverlay());
        
        document.getElementById("reset-button")
            .addEventListener("click", () => this.handleReset());
    }

    async handlePlanRoute() {
        const start = elements.startStationSelect.value;
        const end = elements.endStationSelect.value;

        if (!this.stationService.validateRouteSelection(start, end)) return;

        this.stationService.displayAccessibilityInfo(start, end);
        await this.mapService.planRoute(start, end);
    }

    handleReset() {
        this.uiService.resetUI();
        this.mapService.reset();
    }
}

// Export instance for use in index.js
export const tflService = new TFLService();
