export const elements = {
    startStationSelect: document.getElementById('start-station'),
    endStationSelect: document.getElementById('end-station'),
    mapContainer: document.getElementById('map-container'),
    loadingSpinner: document.getElementById('loading-spinner')
};

export const createOption = (value, text) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
}; 