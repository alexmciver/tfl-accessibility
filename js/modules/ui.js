import { elements } from '../utils/domUtils.js';

export class UIService {
    constructor() {
        this.pendingUpdates = new Set();
        this.frameRequested = false;
    }

    scheduleUpdate(element, update) {
        this.pendingUpdates.add({ element, update });
        if (!this.frameRequested) {
            this.frameRequested = true;
            requestAnimationFrame(() => this.flushUpdates());
        }
    }

    flushUpdates() {
        this.pendingUpdates.forEach(({ element, update }) => update(element));
        this.pendingUpdates.clear();
        this.frameRequested = false;
    }

    showLoadingSpinner() {
        this.scheduleUpdate(
            elements.loadingSpinner,
            el => el.style.display = "block"
        );
    }

    hideLoadingSpinner() {
        this.scheduleUpdate(
            elements.loadingSpinner,
            el => el.style.display = "none"
        );
    }

    hideOverlay() {
        elements.overlay.classList.add("hidden");
    }

    resetUI() {
        // Batch DOM updates
        requestAnimationFrame(() => {
            this.resetSelections();
            this.resetAccessibilityInfo();
            this.resetMapDisplay();
        });
    }

    resetSelections() {
        elements.startStationSelect.selectedIndex = 0;
        elements.endStationSelect.selectedIndex = 0;
    }

    resetAccessibilityInfo() {
        elements.startAccessibility.textContent = '';
        elements.endAccessibility.textContent = '';
    }

    resetMapDisplay() {
        elements.mapContainer.style.display = "none";
        elements.overlay.classList.remove("hidden");
    }
} 