import { elements } from '../utils/domUtils.js';

export class UIService {
    showLoadingSpinner() {
        elements.loadingSpinner.style.display = "block";
    }

    hideLoadingSpinner() {
        elements.loadingSpinner.style.display = "none";
    }

    hideOverlay() {
        elements.overlay.classList.add("hidden");
    }

    resetUI() {
        this.resetSelections();
        this.resetAccessibilityInfo();
        this.resetMapDisplay();
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