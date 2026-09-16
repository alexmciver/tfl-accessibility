import { StationService } from './modules/stations.js';
import { MapService } from './modules/map.js';
import { handleError, ErrorTypes } from './utils/errorHandler.js';
import { initializeDarkMode } from './modules/darkMode.js';
import { API_KEY } from './config.js';
import { buildDynamicRecommendations } from './modules/routingEngine.js';
import { StationCombobox, getAccessMeta } from './modules/stationSearch.js';
import {
    loadAccessProfile,
    saveAccessProfile,
    readProfileFromForm,
    writeProfileToForm
} from './modules/accessProfile.js';
import { buildJourneyGuidance } from './modules/journeyGuidance.js';
import { trustBannerCopy } from './modules/tflTrust.js';
import { buildMapStages, buildMapLegend, buildMapHowto } from './modules/mapStages.js';
import { buildExampleJourneys } from './modules/hubResolver.js';
import { buildConfidenceReport, buildAssistanceBriefing } from './modules/confidenceEngine.js';
import {
    learnFromFeedback,
    memorySummary,
    loadRouteMemory
} from './modules/routeLearning.js';
import {
    readPlannerUrl,
    writePlannerUrl,
    clearPlannerUrl
} from './modules/urlState.js';

const stationService = new StationService();
const mapService = new MapService();

const loadingSpinner = document.getElementById('loading-spinner');
const startStationSelect = document.getElementById('start-station');
const endStationSelect = document.getElementById('end-station');
const mapContainer = document.getElementById('map-container');
const overlay = document.getElementById('overlay');
const backToTopButton = document.getElementById('back-to-top');
const routeRecommendation = document.getElementById('route-recommendation');
const routeMeta = document.getElementById('route-meta');
const scenarioFired = document.getElementById('scenario-fired');
const journeyQuickSummary = document.getElementById('journey-quick-summary');
const accessibilityGuidance = document.getElementById('accessibility-guidance');
const stationBreakdownContainer = document.getElementById('station-breakdown');
const liftStatusContainer = document.getElementById('lift-status');
const liveDeparturesContainer = document.getElementById('live-departures');
const assistancePanel = document.getElementById('assistance-panel');
const mapPreviewControls = document.getElementById('map-preview-controls');
const mapElement = document.getElementById('map');
const mapStageCaption = document.getElementById('map-stage-caption');
const mapLegend = document.getElementById('map-legend');
const mapHowto = document.getElementById('map-howto');
const mapHowtoList = document.getElementById('map-howto-list');
const mapStageActive = document.getElementById('map-stage-active');
const liveConditions = document.getElementById('live-conditions');
const journeyCard = document.getElementById('journey-summary');
const accessScoreEl = document.getElementById('access-score');
const journeyTimelineEl = document.getElementById('journey-timeline');
const recentListEl = document.getElementById('recent-journeys');
const exampleChipHost = document.getElementById('example-journeys');
const stepFreeFilter = document.getElementById('step-free-filter');
const swapButton = document.getElementById('swap-stations');
const copyJourneyButton = document.getElementById('copy-journey');
const copyAssistanceButton = document.getElementById('copy-assistance');
const printJourneyButton = document.getElementById('print-journey');
const degradedBanner = document.getElementById('degraded-banner');
const coachPanel = document.getElementById('coach-panel');
const planAPanel = document.getElementById('plan-a-panel');
const planBPanel = document.getElementById('plan-b-panel');

const RECENT_KEY = 'freeflow_recent_journeys';

let listenersInitialized = false;
let currentMapUrls = { full: '', via: '', final: '' };
let currentMapStages = [];
let startCombobox;
let endCombobox;
let latestJourneyText = '';
let latestAssistanceText = '';
let latestPlanContext = null;
let currentProfile = loadAccessProfile();

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getFilterMode = () => (stepFreeFilter?.checked ? 'step-free' : 'all');

const getStationList = () => Object.entries(stationService.stationData)
    .map(([name, accessibility]) => ({ name, accessibility }))
    .sort((a, b) => a.name.localeCompare(b.name));

const setJourneyActive = (isActive) => {
    if (!journeyCard) return;
    journeyCard.classList.toggle('is-active', isActive);
    journeyCard.classList.toggle('is-empty', !isActive);
};

const persistProfileFromForm = () => {
    currentProfile = saveAccessProfile(readProfileFromForm());
    return currentProfile;
};

const syncUrlFromUi = ({ plan = false, replace = true } = {}) => {
    const start = startCombobox?.getValue() || startStationSelect?.value || '';
    const end = endCombobox?.getValue() || endStationSelect?.value || '';
    writePlannerUrl({
        from: start,
        to: end,
        profile: currentProfile,
        stepFree: Boolean(stepFreeFilter?.checked),
        plan: plan && Boolean(start && end)
    }, { replace });
};

const renderGuidanceList = (guidance) => {
    if (!accessibilityGuidance) return;
    accessibilityGuidance.innerHTML = '';
    guidance.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        accessibilityGuidance.appendChild(listItem);
    });
};

const renderDegradedBanner = (recommendations) => {
    if (!degradedBanner) return;
    const trustCopy = trustBannerCopy(recommendations.trust);
    const parts = [];

    if (recommendations.degraded) {
        parts.push(`
            <details class="banner-fold">
                <summary><strong>Live TfL data is not active</strong> — showing published-access guidance</summary>
                <p>Add a TfL app key for higher rate limits on live rail timing and lift disruptions.</p>
            </details>
        `);
    }
    if (trustCopy) {
        parts.push(`
            <details class="banner-fold">
                <summary><strong>${escapeHtml(trustCopy.title)}</strong></summary>
                <p>${escapeHtml(trustCopy.body)}</p>
                <ul>${trustCopy.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            </details>
        `);
    }

    if (!parts.length) {
        degradedBanner.hidden = true;
        degradedBanner.textContent = '';
        degradedBanner.classList.remove('trust-banner', 'is-corrected');
        return;
    }

    degradedBanner.hidden = false;
    degradedBanner.classList.toggle('trust-banner', Boolean(trustCopy));
    degradedBanner.classList.toggle('is-corrected', Boolean(trustCopy));
    degradedBanner.innerHTML = parts.join('');
};

const getBaseGuidance = (start, end, startAccessibility, endAccessibility, policy = {}) => {
    const guidance = buildJourneyGuidance(start, end, startAccessibility, endAccessibility, policy);
    routeRecommendation.textContent = guidance.headline;
    return guidance.items;
};

const renderConfidenceHero = (confidence) => {
    if (!accessScoreEl) return;
    accessScoreEl.hidden = false;
    accessScoreEl.innerHTML = `
        <div class="score-ring" aria-hidden="true"><span>${confidence.score}</span></div>
        <div class="score-copy">
            <p class="score-eyebrow">Access confidence</p>
            <p class="score-grade">${escapeHtml(confidence.grade)}</p>
            <p>${escapeHtml(confidence.summary)}</p>
            <p class="score-profile">Profile: ${escapeHtml(confidence.profileLine)}</p>
        </div>
    `;
    accessScoreEl.dataset.grade = confidence.grade.toLowerCase().replace(/\s+/g, '-');
};

const renderCoach = (confidence) => {
    if (!coachPanel) return;
    coachPanel.hidden = false;
    coachPanel.innerHTML = `
        <h3 class="panel-title">Do this now</h3>
        <ul class="coach-list">${confidence.coach.now.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <h3 class="panel-title">At the station</h3>
        <ul class="coach-list">${confidence.coach.atStation.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        <h3 class="panel-title">If lifts fail</h3>
        <ul class="coach-list">${confidence.coach.ifFails.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    `;
};

const renderScoredLegs = (scoredSteps = []) => {
    if (!journeyTimelineEl) return;
    journeyTimelineEl.innerHTML = '';
    if (!scoredSteps.length) return;

    const heading = document.createElement('h3');
    heading.className = 'panel-title';
    heading.textContent = 'Leg-by-leg certainty';
    journeyTimelineEl.appendChild(heading);

    const list = document.createElement('ol');
    list.className = 'timeline-list certainty-timeline';
    scoredSteps.forEach((step, index) => {
        const certainty = step.certainty || { label: 'Unknown', className: 'certainty-medium' };
        const item = document.createElement('li');
        item.className = certainty.className;
        item.innerHTML = `
            <span class="timeline-index">${index + 1}</span>
            <span class="timeline-body">
                <span class="timeline-top">
                    <strong>${escapeHtml((step.type || 'step').replace(/^\w/, (c) => c.toUpperCase()))}</strong>
                    <span class="certainty-chip ${certainty.className}">${escapeHtml(certainty.label)}</span>
                </span>
                <span>${escapeHtml(step.text)}</span>
                ${step.durationMins ? `<em class="leg-meta">${escapeHtml(String(step.durationMins))} min</em>` : ''}
            </span>
        `;
        list.appendChild(item);
    });
    journeyTimelineEl.appendChild(list);
};

const renderPlanCard = (container, plan, label, confidenceSteps = null) => {
    if (!container) return;
    if (!plan) {
        container.innerHTML = '';
        return;
    }
    const duration = typeof plan.durationMins === 'number' ? `${plan.durationMins} mins` : 'Time varies';
    const changes = typeof plan.interchangeCount === 'number'
        ? `${plan.interchangeCount} change${plan.interchangeCount === 1 ? '' : 's'}`
        : 'Changes vary';
    const modeSet = [...new Set((plan.steps || []).map((step) => step.type).filter(Boolean))];
    const stepsHtml = (confidenceSteps || plan.steps || []).map((step, index) => {
        const certainty = step.certainty
            ? `<span class="certainty-chip ${step.certainty.className}">${escapeHtml(step.certainty.label)}</span>`
            : '';
        return `<li class="plan-step plan-step-${escapeHtml(step.type || 'step')}">
            <span class="step-type step-type-${escapeHtml(step.type || 'step')}">${escapeHtml(step.type || 'step')}</span>
            <span class="step-copy">${escapeHtml(step.text)}</span>
            ${certainty}
            ${step.durationMins ? `<em>${escapeHtml(String(step.durationMins))} min</em>` : ''}
            <span class="visually-hidden">Leg ${index + 1}</span>
        </li>`;
    }).join('');

    container.innerHTML = `
        <div class="plan-panel-header">
            <p class="plan-label">${escapeHtml(label)}</p>
            <h3>${escapeHtml(plan.title)}</h3>
            <p>${escapeHtml(plan.rationale || '')}</p>
            <div class="plan-metrics">
                <span>${escapeHtml(duration)}</span>
                <span>${escapeHtml(changes)}</span>
                <span>${escapeHtml(plan.badge || 'Route')}</span>
            </div>
            <div class="mode-chip-row">${modeSet.map((mode) => `<span class="mode-chip mode-chip-${escapeHtml(mode)}">${escapeHtml(mode)}</span>`).join('')}</div>
        </div>
        <ol class="route-step-list plan-step-list">${stepsHtml}</ol>
    `;
};

const renderJourneyQuickSummary = (start, end, confidence, planA) => {
    if (!journeyQuickSummary) return;
    const duration = planA?.durationMins ? `About ${planA.durationMins} minutes` : '';
    journeyQuickSummary.innerHTML = `
        <p class="journey-pair">${escapeHtml(start)} <span aria-hidden="true">→</span> ${escapeHtml(end)}</p>
        <p class="journey-scoreline">${escapeHtml([duration, confidence.profileLine].filter(Boolean).join(' · '))}</p>
    `;
};

const applyMapPreview = (previewMode) => {
    const stage = currentMapStages.find((item) => item.id === previewMode) || currentMapStages[0];
    if (!stage) return;
    mapService.showStage(stage);
    if (mapStageCaption) mapStageCaption.textContent = stage.caption;
    if (mapStageActive) {
        mapStageActive.hidden = false;
        mapStageActive.textContent = `Now showing: ${stage.label} — ${stage.why || stage.hint}`;
    }
    if (mapElement) mapElement.setAttribute('aria-label', `Route map: ${stage.label} — ${stage.hint}`);
};

const renderMapLegend = (items = []) => {
    if (!mapLegend) return;
    if (!items.length) {
        mapLegend.innerHTML = '';
        return;
    }
    mapLegend.innerHTML = items.map((item) => `
        <div class="map-legend-item map-legend-${escapeHtml(item.tone)}">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.note)}</span>
        </div>
    `).join('');
};

const getPreferredPreviewMode = (option, policy = {}) => {
    if (policy.preferSurfaceRoute || option?.surfaceRoute) return 'via';
    if (policy.originRerouteRequired || policy.destinationTransferRequired) return 'via';
    if (option?.id && (option.id.includes('hub') || option.id.includes('transfer') || option.contingency)) {
        return 'via';
    }
    return 'full';
};

const renderLearningPanel = (recommendations, start, end) => {
    const panel = document.getElementById('learning-panel');
    if (!panel) return;

    const learned = recommendations.learning || memorySummary(loadRouteMemory());
    panel.hidden = false;
    panel.innerHTML = `
        <h3 class="panel-title">Help Free Flow learn</h3>
        <p class="learning-summary">${escapeHtml(learned.line || 'No lessons stored on this device yet.')}</p>
        <p class="learning-hint">Your feedback stays on this device and improves later plans for similar corridors.</p>
        <div class="learning-actions">
            <button type="button" class="ghost-button" data-feedback="helpful">This plan helped</button>
            <button type="button" class="ghost-button" data-feedback="prefer-surface">Should be bus / walk</button>
            <button type="button" class="ghost-button" data-feedback="wrong-hub">Wrong hub / Tube detour</button>
        </div>
        <p id="learning-status" class="learning-status" aria-live="polite"></p>
    `;

    panel.querySelectorAll('[data-feedback]').forEach((button) => {
        button.addEventListener('click', () => {
            const feedback = button.getAttribute('data-feedback');
            const memory = learnFromFeedback({
                start,
                end,
                feedback,
                liveContext: recommendations.liveContext || {}
            });
            const status = panel.querySelector('#learning-status');
            const summary = memorySummary(memory);
            if (status) {
                status.textContent = feedback === 'helpful'
                    ? `Thanks — noted. ${summary.line}`
                    : `Learned for next time. ${summary.line}`;
            }
            const summaryEl = panel.querySelector('.learning-summary');
            if (summaryEl) summaryEl.textContent = summary.line;
        });
    });
};

const renderMapPreviewControls = (option, context = {}) => {
    if (!mapPreviewControls || !option) return;

    const {
        preferredPreview = 'full',
        start = '',
        end = '',
        policy = {},
        originHub = '',
        destinationHub = '',
        startAccessibility = '',
        endAccessibility = ''
    } = context;

    currentMapStages = buildMapStages({
        option,
        start,
        end,
        policy,
        originHub,
        destinationHub
    });
    currentMapUrls = {
        full: option.mapUrl,
        via: option.waypointMapUrl || option.mapUrl,
        final: option.finalLegMapUrl || option.mapUrl
    };

    renderMapLegend(buildMapLegend({
        start,
        end,
        policy,
        originHub,
        destinationHub,
        startAccessibility,
        endAccessibility
    }));

    if (mapHowto && mapHowtoList) {
        const howto = buildMapHowto(currentMapStages);
        mapHowtoList.innerHTML = howto.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
        mapHowto.hidden = howto.length === 0;
    }

    mapPreviewControls.innerHTML = '';
    const preferred = currentMapStages.some((stage) => stage.id === preferredPreview)
        ? preferredPreview
        : (currentMapStages[0]?.id || 'full');

    currentMapStages.forEach((stage, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'map-preview-button';
        button.dataset.preview = stage.id;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', stage.id === preferred ? 'true' : 'false');
        button.innerHTML = `
            <span class="map-stage-index">${index + 1}</span>
            <span class="map-stage-copy">
                <strong>${escapeHtml(stage.label)}</strong>
                <em>${escapeHtml(stage.hint)}</em>
            </span>
        `;
        button.addEventListener('click', () => {
            mapPreviewControls.querySelectorAll('.map-preview-button').forEach((item) => {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            applyMapPreview(stage.id);
        });
        if (stage.id === preferred) button.classList.add('active');
        mapPreviewControls.appendChild(button);
    });

    applyMapPreview(preferred);
};

const renderStationBreakdown = (stationBreakdown = []) => {
    if (!stationBreakdownContainer) return;
    stationBreakdownContainer.innerHTML = '';
    if (!stationBreakdown.length) return;
    const heading = document.createElement('h3');
    heading.className = 'panel-title';
    heading.textContent = 'Station access detail';
    stationBreakdownContainer.appendChild(heading);

    stationBreakdown.forEach((entry) => {
        const level = stationService.stationData[entry.station] || 'Unknown';
        const meta = getAccessMeta(level);
        const card = document.createElement('div');
        card.className = 'station-breakdown-card';
        card.innerHTML = `
            <div class="station-card-top">
                <h3>${escapeHtml(entry.station)}</h3>
                <span class="access-chip ${meta.className}">${escapeHtml(meta.label)}</span>
            </div>
            <p>${escapeHtml(entry.summary)}</p>
            <ul>${entry.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}</ul>
        `;
        stationBreakdownContainer.appendChild(card);
    });
};

const renderLiveDepartures = (departures = [], isLive = false) => {
    if (!liveDeparturesContainer) return;
    liveDeparturesContainer.innerHTML = '';

    if (!isLive || !departures.length) {
        const empty = document.createElement('p');
        empty.className = 'panel-note';
        empty.textContent = 'Live departures unavailable — open TfL Go or station boards for times on the day.';
        liveDeparturesContainer.appendChild(empty);
        return;
    }

    const note = document.createElement('p');
    note.className = 'panel-note';
    note.textContent = 'Live arrivals from TfL — always confirm on the day.';
    liveDeparturesContainer.appendChild(note);

    const list = document.createElement('ul');
    list.className = 'departure-list';
    departures.forEach((item) => {
        const row = document.createElement('li');
        row.innerHTML = `<strong>${escapeHtml(item.line)}</strong><span>to ${escapeHtml(item.destination)}</span><em>${escapeHtml(String(item.dueInMins))} min</em>`;
        list.appendChild(row);
    });
    liveDeparturesContainer.appendChild(list);
};

const showLiveConditions = (visible) => {
    if (liveConditions) liveConditions.hidden = !visible;
};

const renderLiftStatus = (liveContext = {}) => {
    if (!liftStatusContainer) return;
    const liftChecks = liveContext.liftChecks || {};
    const liftMessages = liveContext.liftMessages || [];
    const hasChecks = Boolean(liftChecks.start || liftChecks.end || liftChecks.interchange);

    liftStatusContainer.innerHTML = '';
    if (!hasChecks) {
        showLiveConditions(false);
        return;
    }

    showLiveConditions(true);

    const list = document.createElement('ul');
    list.className = 'lift-check-list';
    [
        ['Start', liftChecks.start],
        ['End', liftChecks.end],
        ['Interchange', liftChecks.interchange]
    ].forEach(([role, check]) => {
        if (!check) return;
        const item = document.createElement('li');
        item.className = `lift-check lift-${check.state || 'unknown'}`;
        const detail = check.detail || '';
        item.title = detail;
        item.innerHTML = `
            <div class="lift-check-top">
                <strong>${escapeHtml(role)}: ${escapeHtml(check.station || 'Station')}</strong>
                <span class="lift-state-chip">${escapeHtml(check.label || 'Unknown')}</span>
            </div>
            <p>${escapeHtml(detail)}</p>
        `;
        list.appendChild(item);
    });
    liftStatusContainer.appendChild(list);

    if (liftMessages.length) {
        const msgHeading = document.createElement('h4');
        msgHeading.className = 'lift-message-heading';
        msgHeading.textContent = 'TfL lift notices';
        liftStatusContainer.appendChild(msgHeading);
        const messages = document.createElement('ul');
        messages.className = 'lift-message-list';
        liftMessages.forEach((message) => {
            const item = document.createElement('li');
            item.textContent = message;
            messages.appendChild(item);
        });
        liftStatusContainer.appendChild(messages);
    }
};

const renderAssistancePanel = (start, end, confidence) => {
    if (!assistancePanel) return;
    const stations = confidence.assistanceStations || [];
    assistancePanel.innerHTML = `
        <h3 class="panel-title">Assistance pack</h3>
        <p>Take this briefing to staff or Passenger Assist.</p>
        <ul class="assistance-station-list">
            ${stations.length
        ? stations.map((item) => `<li><strong>${escapeHtml(item.station)}</strong> — ${escapeHtml(item.reason)}</li>`).join('')
        : '<li>No specific assistance stations flagged for this profile.</li>'}
        </ul>
        <p><a href="https://tfl.gov.uk/transport-accessibility/help-from-staff" target="_blank" rel="noopener noreferrer">TfL staff assistance</a></p>
        <p><a href="https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/" target="_blank" rel="noopener noreferrer">Book Passenger Assist</a></p>
        <p><strong>Planned journey:</strong> ${escapeHtml(start)} to ${escapeHtml(end)}</p>
        <p class="panel-note">Use “Copy assistance pack” above for a shareable text version.</p>
    `;
};

const displayAccessibilityInfo = (start, end) => {
    const startAccessibility = stationService.stationData[start] || 'N/A';
    const endAccessibility = stationService.stationData[end] || 'N/A';
    startCombobox?.updateBadge(startAccessibility);
    endCombobox?.updateBadge(endAccessibility);
};

const readRecent = () => {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch (error) {
        return [];
    }
};

const saveRecent = (start, end) => {
    const next = [{ start, end }, ...readRecent().filter((item) => !(item.start === start && item.end === end))].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    renderRecent();
};

const applyJourneyPair = (start, end) => {
    startCombobox?.setValue(start);
    endCombobox?.setValue(end);
};

const renderRecent = () => {
    if (!recentListEl) return;
    const recent = readRecent().filter((item) => (
        stationService.stationData[item.start] && stationService.stationData[item.end]
    ));
    recentListEl.innerHTML = '';
    if (!recent.length) {
        recentListEl.hidden = true;
        return;
    }
    recentListEl.hidden = false;
    const label = document.createElement('p');
    label.className = 'chip-label';
    label.textContent = 'Recent journeys';
    recentListEl.appendChild(label);
    recent.forEach((item) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'journey-chip';
        button.textContent = `${item.start} → ${item.end}`;
        button.addEventListener('click', () => {
            applyJourneyPair(item.start, item.end);
            planRoute();
        });
        recentListEl.appendChild(button);
    });
};

const renderExamples = () => {
    if (!exampleChipHost) return;
    exampleChipHost.innerHTML = '';
    const label = document.createElement('p');
    label.className = 'chip-label';
    label.textContent = 'Try a Full step-free pair';
    exampleChipHost.appendChild(label);
    buildExampleJourneys(stationService.stationData, 4).forEach((item) => {
        if (!stationService.stationData[item.start] || !stationService.stationData[item.end]) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'journey-chip';
        button.textContent = `${item.start} → ${item.end}`;
        button.addEventListener('click', () => {
            applyJourneyPair(item.start, item.end);
            planRoute();
        });
        exampleChipHost.appendChild(button);
    });
};

const buildShareText = (start, end, confidence, planA, planB) => {
    latestJourneyText = [
        `Free Flow Routes: ${start} → ${end}`,
        `Access confidence: ${confidence.score} (${confidence.grade})`,
        confidence.summary,
        `Plan A: ${planA?.title || ''}`,
        ...(confidence.scoredSteps || []).map((step, index) => `${index + 1}. [${step.certainty?.label || 'step'}] ${step.text}`),
        planB ? `Plan B if lifts fail: ${planB.title}` : '',
        'Always re-check live lift status with TfL before travel.'
    ].filter(Boolean).join('\n');
    latestAssistanceText = buildAssistanceBriefing({ start, end, confidence, planA, planB });
};

const hideOverlay = () => overlay.classList.add('hidden');

const resetSelections = () => {
    startCombobox?.clear();
    endCombobox?.clear();
    startStationSelect.selectedIndex = 0;
    endStationSelect.selectedIndex = 0;
    if (accessScoreEl) {
        accessScoreEl.hidden = true;
        accessScoreEl.innerHTML = '';
    }
    if (journeyTimelineEl) journeyTimelineEl.innerHTML = '';
    if (coachPanel) {
        coachPanel.hidden = true;
        coachPanel.innerHTML = '';
    }
    if (planAPanel) planAPanel.innerHTML = '';
    if (planBPanel) planBPanel.innerHTML = '';
    if (degradedBanner) {
        degradedBanner.hidden = true;
        degradedBanner.textContent = '';
    }
    if (journeyQuickSummary) {
        journeyQuickSummary.innerHTML = '<p>Set your profile, choose two stations, and get Plan A with certainty on every leg — plus Plan B if lifts fail.</p>';
    }
    if (scenarioFired) scenarioFired.textContent = '';
    routeRecommendation.textContent = 'Your guidance will appear here after you plan a route.';
    routeMeta.textContent = '';
    accessibilityGuidance.innerHTML = '';
    stationBreakdownContainer.innerHTML = '';
    if (liftStatusContainer) {
        liftStatusContainer.innerHTML = '';
    }
    if (liveDeparturesContainer) liveDeparturesContainer.innerHTML = '';
    if (liveConditions) liveConditions.hidden = true;
    assistancePanel.innerHTML = '';
    mapPreviewControls.innerHTML = '';
    if (mapLegend) mapLegend.innerHTML = '';
    if (mapHowto) mapHowto.hidden = true;
    if (mapHowtoList) mapHowtoList.innerHTML = '';
    if (mapStageActive) {
        mapStageActive.hidden = true;
        mapStageActive.textContent = '';
    }
    if (mapStageCaption) {
        mapStageCaption.textContent = 'Plan a journey to see each access stage on the map.';
    }
    currentMapStages = [];
    mapContainer.style.display = 'none';
    overlay.classList.add('hidden');
    latestJourneyText = '';
    latestAssistanceText = '';
    latestPlanContext = null;
    const learningPanel = document.getElementById('learning-panel');
    if (learningPanel) {
        learningPanel.hidden = true;
        learningPanel.innerHTML = '';
    }
    setJourneyActive(false);
    mapService.reset();
    stationService.reset();
    clearPlannerUrl();
};

const planRoute = async () => {
    const start = startCombobox?.getValue() || startStationSelect.value;
    const end = endCombobox?.getValue() || endStationSelect.value;
    if (!stationService.validateRouteSelection(start, end)) return;

    const profile = persistProfileFromForm();
    const startAccessibility = stationService.stationData[start] || 'N/A';
    const endAccessibility = stationService.stationData[end] || 'N/A';
    displayAccessibilityInfo(start, end);

    try {
        const recommendations = await buildDynamicRecommendations({
            apiKey: API_KEY,
            start,
            end,
            startAccessibility,
            endAccessibility,
            profile
        });

        const planA = recommendations.planA || recommendations.recommended;
        const planB = recommendations.planB || recommendations.alternatives[0] || null;
        const confidence = buildConfidenceReport({
            start,
            end,
            startAccessibility,
            endAccessibility,
            planA,
            planB,
            liveContext: recommendations.liveContext,
            profile
        });

        const hasLiveJourney = (recommendations.liveContext?.journeyStrategies || []).length > 0;
        const confidenceLabel = recommendations.policy?.preferSurfaceRoute
            ? 'Surface-first local link (bus / walk)'
            : recommendations.trust?.differsFromTfl
                ? 'Free Flow corrected street access (ahead of TfL labels)'
                : recommendations.degraded
                    ? 'Fallback guidance (no live TfL journey)'
                    : hasLiveJourney
                        ? 'Live TfL timing + Free Flow access gate'
                        : 'Free Flow published-access guidance';

        setJourneyActive(true);
        latestPlanContext = { start, end, recommendations };
        renderDegradedBanner(recommendations);
        renderConfidenceHero(confidence);
        renderJourneyQuickSummary(start, end, confidence, planA);
        renderCoach(confidence);
        renderPlanCard(planAPanel, planA, 'Plan A — Free Flow recommended', confidence.scoredSteps);
        renderPlanCard(planBPanel, planB, 'Plan B — if lifts fail');
        renderLearningPanel(recommendations, start, end);

        if (scenarioFired) {
            const notes = [];
            if (recommendations.policy?.preferSurfaceRoute) notes.push('surface-first');
            else if (recommendations.trust?.differsFromTfl) notes.push('TfL corrected');
            scenarioFired.textContent = `${startAccessibility} → ${endAccessibility}${notes.length ? ` · ${notes.join(' · ')}` : ''}`;
        }
        routeMeta.textContent = `${confidenceLabel} · Selected: ${planA?.title || 'Plan A'}`;

        const strictPolicyGuidance = [];
        if (recommendations.policy?.preferSurfaceRoute) {
            strictPolicyGuidance.push(`Surface-first: ${start} and ${end} are local and not street-to-train step-free — use bus or walk.`);
        }
        if (recommendations.policy?.originRerouteRequired) {
            strictPolicyGuidance.push(`Origin reroute: start via ${recommendations.liveContext.originHub || 'an accessible hub'} before joining the Tube.`);
        }
        if (recommendations.policy?.destinationTransferRequired) {
            strictPolicyGuidance.push(`Bus finish required: leave rail at ${recommendations.liveContext.destinationHub || 'an accessible interchange'} and take a bus or short walk to ${end}. Do not rely on street access at ${end}.`);
        }

        renderGuidanceList([
            ...getBaseGuidance(start, end, startAccessibility, endAccessibility, recommendations.policy || {}),
            ...strictPolicyGuidance,
            ...confidence.why.slice(0, 3)
        ]);
        renderStationBreakdown(recommendations.liveContext.stationBreakdown || []);
        renderLiftStatus(recommendations.liveContext || {});
        renderLiveDepartures(
            recommendations.liveContext.liveDepartures || [],
            Boolean(recommendations.liveContext.departuresAreLive)
        );
        renderAssistancePanel(start, end, confidence);

        const preferredPreview = getPreferredPreviewMode(planA, recommendations.policy || {});
        renderMapPreviewControls(planA, {
            preferredPreview,
            start,
            end,
            policy: recommendations.policy || {},
            originHub: recommendations.liveContext?.originHub || '',
            destinationHub: recommendations.liveContext?.destinationHub || '',
            startAccessibility,
            endAccessibility
        });
        mapContainer.style.display = 'block';
        overlay.classList.add('hidden');
        saveRecent(start, end);
        buildShareText(start, end, confidence, planA, planB);
        syncUrlFromUi({ plan: true, replace: true });
        journeyCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        handleError(error, ErrorTypes.NETWORK);
    }
};

const setupComboboxes = () => {
    const stations = getStationList();
    startCombobox = new StationCombobox({
        input: document.getElementById('start-station-input'),
        listbox: document.getElementById('start-station-listbox'),
        select: startStationSelect,
        badge: document.getElementById('start-accessibility'),
        stations,
        getFilterMode,
        onChange: () => {}
    });
    endCombobox = new StationCombobox({
        input: document.getElementById('end-station-input'),
        listbox: document.getElementById('end-station-listbox'),
        select: endStationSelect,
        badge: document.getElementById('end-accessibility'),
        stations,
        getFilterMode,
        onChange: () => {}
    });
};

const setupProfileListeners = () => {
    writeProfileToForm(currentProfile);
    ['profile-wheelchair', 'profile-no-escalators', 'profile-ramp', 'profile-max-walk'].forEach((id) => {
        document.getElementById(id)?.addEventListener('change', () => {
            persistProfileFromForm();
            syncUrlFromUi({ plan: Boolean(latestPlanContext) });
        });
    });
};

const applyUrlState = (state, { autoPlan = false } = {}) => {
    if (!state) return false;

    if (state.profile) {
        currentProfile = saveAccessProfile({
            wheelchair: Boolean(state.profile.wheelchair),
            noEscalators: Boolean(state.profile.noEscalators),
            rampNeeded: Boolean(state.profile.rampNeeded),
            maxWalkMins: state.profile.maxWalkMins || currentProfile.maxWalkMins || 10
        });
        writeProfileToForm(currentProfile);
    }

    if (stepFreeFilter && state.stepFree !== null && state.stepFree !== undefined) {
        stepFreeFilter.checked = Boolean(state.stepFree);
    }

    if (state.from || state.to) {
        applyJourneyPair(state.from || '', state.to || '');
    }

    if (autoPlan && state.plan && state.from && state.to) {
        planRoute();
        return true;
    }

    if (state.from || state.to || state.profile || state.stepFree) {
        syncUrlFromUi({ plan: false });
    }
    return false;
};

const restoreFromUrl = () => {
    const state = readPlannerUrl(stationService.stationData);
    if (!state.hasQuery) return;
    applyUrlState(state, { autoPlan: true });
};

const setupEventListeners = () => {
    if (listenersInitialized) return;
    document.getElementById('plan-route').addEventListener('click', (event) => {
        event.preventDefault();
        planRoute();
    });
    document.getElementById('reset-button').addEventListener('click', resetSelections);
    overlay.addEventListener('click', hideOverlay);
    overlay.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            hideOverlay();
        }
    });
    swapButton?.addEventListener('click', () => {
        const start = startCombobox?.getValue() || '';
        const end = endCombobox?.getValue() || '';
        applyJourneyPair(end, start);
        syncUrlFromUi({ plan: Boolean(latestPlanContext && end && start) });
    });
    stepFreeFilter?.addEventListener('change', () => {
        startCombobox?.renderOptions(document.getElementById('start-station-input').value);
        endCombobox?.renderOptions(document.getElementById('end-station-input').value);
        syncUrlFromUi({ plan: Boolean(latestPlanContext) });
    });
    copyJourneyButton?.addEventListener('click', async () => {
        if (!latestJourneyText) return;
        try {
            await navigator.clipboard.writeText(latestJourneyText);
            copyJourneyButton.textContent = 'Copied';
            setTimeout(() => {
                copyJourneyButton.textContent = 'Copy plan';
            }, 1600);
        } catch (error) {
            handleError(error, ErrorTypes.NETWORK);
        }
    });
    copyAssistanceButton?.addEventListener('click', async () => {
        if (!latestAssistanceText) return;
        try {
            await navigator.clipboard.writeText(latestAssistanceText);
            copyAssistanceButton.textContent = 'Copied pack';
            setTimeout(() => {
                copyAssistanceButton.textContent = 'Copy assistance pack';
            }, 1600);
        } catch (error) {
            handleError(error, ErrorTypes.NETWORK);
        }
    });
    printJourneyButton?.addEventListener('click', () => window.print());
    document.getElementById('planner-form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        planRoute();
    });
    window.addEventListener('popstate', () => {
        const state = readPlannerUrl(stationService.stationData);
        if (!state.from && !state.to) {
            resetSelections();
            return;
        }
        applyUrlState(state, { autoPlan: true });
    });
    setupProfileListeners();
    listenersInitialized = true;
};

export const fetchTFL = async () => {
    setupEventListeners();
    loadingSpinner.style.display = 'block';
    try {
        await stationService.fetchStationData();
        stationService.populateDropdowns();
        setupComboboxes();
        renderExamples();
        renderRecent();
        await mapService.initialize(
            document.getElementById('map'),
            document.getElementById('open-external-map')
        );
        restoreFromUrl();
    } catch (error) {
        alert(`Failed to load station data. Error: ${error.message}`);
    } finally {
        loadingSpinner.style.display = 'none';
    }
};

const initializeBackToTop = () => {
    const onScroll = () => {
        if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    backToTopButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

const initialize = async () => {
    if (window.__freeflowInitialized) return;
    window.__freeflowInitialized = true;
    initializeDarkMode();
    initializeBackToTop();
    setJourneyActive(false);
    await fetchTFL();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
