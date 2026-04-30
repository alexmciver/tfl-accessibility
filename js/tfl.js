import { StationService } from './modules/stations.js';
import { MapService } from './modules/map.js';
import { handleError, ErrorTypes } from './utils/errorHandler.js';
import { initializeDarkMode } from './modules/darkMode.js';
import { API_KEY } from './config.js';
import { buildDynamicRecommendations } from './modules/routingEngine.js';

const stationService = new StationService();
const mapService = new MapService();

const loadingSpinner = document.getElementById("loading-spinner");
const startStationSelect = document.getElementById("start-station");
const endStationSelect = document.getElementById("end-station");
const mapContainer = document.getElementById("map-container");
const overlay = document.getElementById("overlay");
const backToTopButton = document.getElementById("back-to-top");
const routeRecommendation = document.getElementById("route-recommendation");
const routeMeta = document.getElementById("route-meta");
const scenarioFired = document.getElementById("scenario-fired");
const accessibilityGuidance = document.getElementById("accessibility-guidance");
const stationBreakdownContainer = document.getElementById("station-breakdown");
const liftStatusContainer = document.getElementById("lift-status");
const liveDeparturesContainer = document.getElementById("live-departures");
const assistancePanel = document.getElementById("assistance-panel");
const mapPreviewControls = document.getElementById("map-preview-controls");
const routeOptionsContainer = document.getElementById("route-options");
const routeStepsContainer = document.getElementById("route-steps");
const mapElement = document.getElementById("map");
let listenersInitialized = false;
let currentMapUrls = { full: '', via: '', final: '' };

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderGuidanceList = (guidance) => {
    accessibilityGuidance.innerHTML = '';
    guidance.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        accessibilityGuidance.appendChild(listItem);
    });
};

const renderRouteSteps = (steps = []) => {
    routeStepsContainer.innerHTML = '';
    const orderedList = document.createElement('ol');
    orderedList.className = 'route-step-list';
    steps.forEach((step) => {
        const listItem = document.createElement('li');
        listItem.textContent = step.text;
        orderedList.appendChild(listItem);
    });
    routeStepsContainer.appendChild(orderedList);
};

const applyMapPreview = (previewMode) => {
    if (previewMode === 'via' && currentMapUrls.via) {
        mapElement.src = currentMapUrls.via;
        return;
    }
    if (previewMode === 'final' && currentMapUrls.final) {
        mapElement.src = currentMapUrls.final;
    } else if (currentMapUrls.full) {
        mapElement.src = currentMapUrls.full;
    }
};

const getPreferredPreviewMode = (option) => {
    if (option.id && (option.id.includes('hub') || option.id.includes('transfer'))) {
        return 'via';
    }
    if (option.finalLegMapUrl && option.finalLegMapUrl !== option.mapUrl && option.badge !== 'Tube-first') {
        return 'via';
    }
    return 'full';
};

const renderMapPreviewControls = (option, preferredPreview = 'full') => {
    mapPreviewControls.innerHTML = '';
    currentMapUrls = {
        full: option.mapUrl,
        via: option.waypointMapUrl || option.mapUrl,
        final: option.finalLegMapUrl || option.mapUrl
    };
    const createButton = (id, label) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'map-preview-button';
        button.dataset.preview = id;
        button.textContent = label;
        button.addEventListener('click', () => {
            mapPreviewControls.querySelectorAll('.map-preview-button').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            applyMapPreview(id);
        });
        return button;
    };
    const fullButton = createButton('full', 'Full journey map');
    const viaButton = createButton('via', 'Via interchange map');
    const finalButton = createButton('final', 'Final leg map');
    const buttonMap = { full: fullButton, via: viaButton, final: finalButton };
    const initialMode = buttonMap[preferredPreview] ? preferredPreview : 'full';
    buttonMap[initialMode].classList.add('active');
    mapPreviewControls.appendChild(fullButton);
    mapPreviewControls.appendChild(viaButton);
    mapPreviewControls.appendChild(finalButton);
    applyMapPreview(initialMode);
};

const renderRouteOptions = (options) => {
    routeOptionsContainer.innerHTML = '';
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'route-option-button';
        if (index === 0) button.classList.add('active');
        button.innerHTML = `<strong>${escapeHtml(option.title)}</strong><span>${escapeHtml(option.badge)} - ${escapeHtml(option.rationale)}</span>`;
        button.addEventListener('click', () => {
            routeOptionsContainer.querySelectorAll('.route-option-button').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            const preferredPreview = getPreferredPreviewMode(option);
            renderMapPreviewControls(option, preferredPreview);
            renderRouteSteps(option.steps);
            routeMeta.textContent = `${routeMeta.textContent.split(' | ')[0]} | Selected option: ${option.title}`;
        });
        routeOptionsContainer.appendChild(button);
    });
};

const getBaseGuidance = (start, end, startAccessibility, endAccessibility) => {
    const guidance = [];
    if (startAccessibility === 'Full' && endAccessibility === 'Partial') {
        routeRecommendation.textContent = 'Start is fully step-free, but destination is only partially step-free. Continue by Tube, then transfer to a safer final leg when needed.';
        guidance.push(`Use Tube from ${start} as normal, but plan to leave at a nearby accessible interchange before ${end} if destination platforms/exits are constrained.`);
        guidance.push(`Prefer bus or short walking transfer for the final approach to ${end} when platform assignment is uncertain.`);
    } else if (startAccessibility === 'None' || endAccessibility === 'None') {
        routeRecommendation.textContent = 'One or more stations are not step-free. We prioritise Tube where possible and add bus or walking links for inaccessible segments.';
        guidance.push(`If ${end} is inaccessible, travel to a nearby accessible interchange and complete the final leg by bus or short walk.`);
    } else if (startAccessibility === 'Partial' || endAccessibility === 'Partial') {
        routeRecommendation.textContent = 'This journey includes partial step-free access. Platform-specific checks are required.';
        guidance.push('Confirm platform access before departure and prepare a bus-link fallback.');
    } else {
        routeRecommendation.textContent = 'This route supports step-free travel and remains Tube-first.';
        guidance.push('A fully accessible route is available with backup alternatives.');
    }
    guidance.push('Check live lift and service status before travelling.');
    guidance.push('Ask station staff for boarding ramps where required.');
    return guidance;
};

const renderStationBreakdown = (stationBreakdown = []) => {
    stationBreakdownContainer.innerHTML = '';
    stationBreakdown.forEach((entry) => {
        const card = document.createElement('div');
        card.className = 'station-breakdown-card';
        card.innerHTML = `<h3>${escapeHtml(entry.station)}</h3><p>${escapeHtml(entry.summary)}</p><ul>${entry.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>`;
        stationBreakdownContainer.appendChild(card);
    });
};

const renderLiveDepartures = (departures = []) => {
    liveDeparturesContainer.innerHTML = '';
    if (departures.length === 0) {
        liveDeparturesContainer.textContent = 'Live departures unavailable for the selected origin right now.';
        return;
    }
    const title = document.createElement('h3');
    title.textContent = 'Live departures from origin area';
    liveDeparturesContainer.appendChild(title);
    const list = document.createElement('ul');
    departures.forEach((item) => {
        const row = document.createElement('li');
        row.textContent = `${item.line} to ${item.destination} - due in ${item.dueInMins} min`;
        list.appendChild(row);
    });
    liveDeparturesContainer.appendChild(list);
};

const renderLiftStatus = (liftStatus = {}) => {
    liftStatusContainer.innerHTML = '';
    const entries = [
        ['Start lift status', liftStatus.start || 'Unknown'],
        ['End lift status', liftStatus.end || 'Unknown'],
        ['Interchange lift status', liftStatus.interchange || 'Unknown']
    ];
    entries.forEach(([label, value]) => {
        const badge = document.createElement('span');
        badge.className = 'lift-badge';
        badge.textContent = `${label}: ${value}`;
        liftStatusContainer.appendChild(badge);
    });
};

const renderAssistancePanel = (start, end, startAccessibility, endAccessibility) => {
    const likelyRampNeeded = startAccessibility !== 'Full' || endAccessibility !== 'Full';
    assistancePanel.innerHTML = `
        <h3>Assistance planning</h3>
        <p>${likelyRampNeeded ? 'Ramp and staff assistance may be required on this journey.' : 'Assistance is less likely, but can still be requested in advance.'}</p>
        <ul>
            <li>Request help from station staff at departure and interchange points.</li>
            <li>If travelling to National Rail destinations, plan Passenger Assist ahead of travel.</li>
            <li>Keep a bus-link fallback ready if lifts are unavailable at any step.</li>
        </ul>
        <p><a href="https://tfl.gov.uk/transport-accessibility/help-from-staff" target="_blank" rel="noopener noreferrer">TfL staff assistance information</a></p>
        <p><a href="https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/" target="_blank" rel="noopener noreferrer">National Rail Passenger Assist</a></p>
        <p><strong>Planned journey:</strong> ${escapeHtml(start)} to ${escapeHtml(end)}</p>
    `;
};

const updateJourneyGuidance = (start, end, startAccessibility, endAccessibility) => {
    renderGuidanceList(getBaseGuidance(start, end, startAccessibility, endAccessibility));
};

const displayAccessibilityInfo = (start, end) => {
    const startAccessibility = stationService.stationData[start] || 'N/A';
    const endAccessibility = stationService.stationData[end] || 'N/A';
    document.getElementById("start-accessibility").textContent = `Accessibility: ${startAccessibility}`;
    document.getElementById("end-accessibility").textContent = `Accessibility: ${endAccessibility}`;
    updateJourneyGuidance(start, end, startAccessibility, endAccessibility);
};

const hideOverlay = () => overlay.classList.add("hidden");

const resetSelections = () => {
    startStationSelect.selectedIndex = 0;
    endStationSelect.selectedIndex = 0;
    document.getElementById("start-accessibility").textContent = '';
    document.getElementById("end-accessibility").textContent = '';
    scenarioFired.textContent = '';
    routeRecommendation.textContent = 'Select a route to see step-free guidance, interchange notes, and alternatives.';
    routeMeta.textContent = '';
    accessibilityGuidance.innerHTML = '';
    stationBreakdownContainer.innerHTML = '';
    liftStatusContainer.innerHTML = '';
    liveDeparturesContainer.innerHTML = '';
    assistancePanel.innerHTML = '';
    routeOptionsContainer.innerHTML = '';
    routeStepsContainer.innerHTML = '';
    mapPreviewControls.innerHTML = '';
    mapContainer.style.display = "none";
    overlay.classList.remove("hidden");
    mapService.reset();
    stationService.reset();
};

const planRoute = async () => {
    const start = startStationSelect.value;
    const end = endStationSelect.value;
    if (!stationService.validateRouteSelection(start, end)) return;

    const startAccessibility = stationService.stationData[start] || 'N/A';
    const endAccessibility = stationService.stationData[end] || 'N/A';
    displayAccessibilityInfo(start, end);

    try {
        const recommendations = await buildDynamicRecommendations({
            apiKey: API_KEY,
            start,
            end,
            startAccessibility,
            endAccessibility
        });
        const options = [recommendations.recommended, ...recommendations.alternatives];
        scenarioFired.textContent = `Scenario fired: ${recommendations.scenario}`;
        routeMeta.textContent = `${recommendations.degraded ? 'Fallback confidence' : 'Live-data confidence'} | Scenario: ${recommendations.scenario} | Selected option: ${options[0].title}`;
        const strictPolicyGuidance = [];
        if (recommendations.policy?.originRerouteRequired) {
            strictPolicyGuidance.push(`Origin reroute required: start at ${recommendations.liveContext.originHub || 'nearest accessible hub'} before entering Tube network.`);
        }
        if (recommendations.policy?.destinationTransferRequired) {
            strictPolicyGuidance.push(`Destination transfer required: leave rail at ${recommendations.liveContext.destinationHub || 'nearest accessible interchange'} and complete final leg by bus/walking.`);
        }
        renderGuidanceList([...getBaseGuidance(start, end, startAccessibility, endAccessibility), ...strictPolicyGuidance, ...recommendations.assumptions]);
        renderStationBreakdown(recommendations.liveContext.stationBreakdown || []);
        renderLiftStatus(recommendations.liveContext.liftStatus || {});
        renderLiveDepartures(recommendations.liveContext.liveDepartures || []);
        renderAssistancePanel(start, end, startAccessibility, endAccessibility);
        renderRouteOptions(options);
        renderRouteSteps(options[0].steps);
        const preferredPreview = (recommendations.policy?.originRerouteRequired || recommendations.policy?.destinationTransferRequired)
            ? 'via'
            : getPreferredPreviewMode(options[0]);
        renderMapPreviewControls(options[0], preferredPreview);
        mapContainer.style.display = "block";
        overlay.classList.add("hidden");
    } catch (error) {
        handleError(error, ErrorTypes.MAPS_INITIALIZATION);
    }
};

const setupEventListeners = () => {
    if (listenersInitialized) return;
    document.getElementById("plan-route").addEventListener("click", planRoute);
    overlay.addEventListener("click", hideOverlay);
    overlay.addEventListener("keydown", (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            hideOverlay();
        }
    });
    document.getElementById("reset-button").addEventListener("click", resetSelections);
    listenersInitialized = true;
};

export const fetchTFL = async () => {
    setupEventListeners();
    loadingSpinner.style.display = "block";
    try {
        await stationService.fetchStationData();
        stationService.populateDropdowns();
        await mapService.initialize(document.getElementById("map"));
    } catch (error) {
        alert(`Failed to load station data. Error: ${error.message}`);
    } finally {
        loadingSpinner.style.display = "none";
    }
};

const initializeBackToTop = () => {
    window.onscroll = function() {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    };
    backToTopButton.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

const initialize = async () => {
    initializeDarkMode();
    initializeBackToTop();
    await fetchTFL();
};

document.addEventListener('DOMContentLoaded', initialize);
