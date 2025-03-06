export const elements = {
    get startStationSelect() {
        return document.getElementById('start-station');
    },
    get endStationSelect() {
        return document.getElementById('end-station');
    },
    get mapContainer() {
        return document.getElementById('map-container');
    },
    get loadingSpinner() {
        return document.getElementById('loading-spinner');
    },
    get startAccessibility() {
        return document.getElementById('start-accessibility');
    },
    get endAccessibility() {
        return document.getElementById('end-accessibility');
    }
};

export const createOption = (value, text) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
}; 