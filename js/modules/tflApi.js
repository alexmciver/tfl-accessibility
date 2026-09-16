import { TFL_APP_KEY } from '../config.js';
import { stationCoords } from '../data/stationCoords.js';

const API_BASE = 'https://api.tfl.gov.uk';
const REQUEST_TIMEOUT_MS = 10000;
const RAIL_MODES = new Set(['tube', 'dlr', 'overground', 'elizabeth-line', 'national-rail']);
const stopPointCache = new Map();

const buildUrl = (path, params = {}) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        url.searchParams.set(key, value);
    });
    if (TFL_APP_KEY) url.searchParams.set('app_key', TFL_APP_KEY);
    return url.toString();
};

const tflFetch = async (path, params = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(buildUrl(path, params), { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`TfL API ${response.status} for ${path}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
};

const normaliseStationKey = (name = '') => String(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\bstation\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Match station names without substring false positives (Bank ⊈ Embankment).
 * Allows “Wembley Park Station” ↔ “Wembley Park” via whole-token / prefix equality.
 */
export const stationNameMatches = (candidate, station) => {
    const left = normaliseStationKey(candidate);
    const right = normaliseStationKey(station);
    if (!left || !right) return false;
    if (left === right) return true;
    // Longer label may add a trailing qualifier after the shorter name.
    if (left.startsWith(`${right} `) || right.startsWith(`${left} `)) return true;
    return false;
};

const pickBestStopMatch = (matches = []) => {
    if (!Array.isArray(matches) || matches.length === 0) return null;
    const scored = matches.map((match) => {
        const modes = match.modes || [];
        const railScore = modes.some((mode) => RAIL_MODES.has(mode)) ? 2 : 0;
        const tubeScore = modes.includes('tube') ? 1 : 0;
        return { match, score: railScore + tubeScore };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].match;
};

const resolveArrivalsStopId = async (stop) => {
    if (!stop?.id) return null;
    if (!String(stop.id).startsWith('HUB')) return stop.id;

    const detail = await tflFetch(`/StopPoint/${encodeURIComponent(stop.id)}`);
    const children = detail.children || [];
    const railChild = children.find((child) => (child.modes || []).some((mode) => RAIL_MODES.has(mode) && mode !== 'national-rail'))
        || children.find((child) => (child.modes || []).some((mode) => RAIL_MODES.has(mode)));
    return railChild?.id || stop.id;
};

export const fetchLiftDisruptions = async () => {
    const data = await tflFetch('/Disruptions/Lifts');
    return Array.isArray(data) ? data : [];
};

export const findLiftDisruptionsForStation = (disruptions = [], stationName) => {
    return disruptions.filter((item) => {
        const haystacks = [item.stopPointName, item.message, item.naptanCode, item.icsCode];
        return haystacks.some((value) => stationNameMatches(value, stationName));
    });
};

export const searchStopPoint = async (query) => {
    const cacheKey = normaliseStationKey(query);
    if (stopPointCache.has(cacheKey)) return stopPointCache.get(cacheKey);

    const data = await tflFetch(`/StopPoint/Search/${encodeURIComponent(query)}`, {
        modes: 'tube,dlr,overground,elizabeth-line,national-rail'
    });
    const best = pickBestStopMatch(data.matches || []);
    if (!best) {
        stopPointCache.set(cacheKey, null);
        return null;
    }

    const resolved = {
        id: best.id,
        icsId: best.icsId,
        name: best.name,
        modes: best.modes || [],
        lat: best.lat,
        lon: best.lon
    };
    stopPointCache.set(cacheKey, resolved);
    return resolved;
};

/**
 * Pick the nearest published Full station using origin lat/lon against
 * the Full-station coordinate cache (no hard-coded hub names).
 */
export const fetchNearestFullHub = async (stationName, stationData = {}) => {
    const origin = await searchStopPoint(stationName);
    const originLat = Number.isFinite(origin?.lat) ? origin.lat : null;
    const originLon = Number.isFinite(origin?.lon) ? origin.lon : null;
    if (originLat == null || originLon == null) return null;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const distanceMetres = (lat1, lon1, lat2, lon2) => {
        const earth = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        return 2 * earth * Math.asin(Math.sqrt(a));
    };

    let best = null;
    let bestDistance = Infinity;
    Object.entries(stationData).forEach(([name, accessibility]) => {
        if (accessibility !== 'Full' || name === stationName) return;
        const point = stationCoords[name];
        if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return;
        const distance = distanceMetres(originLat, originLon, point.lat, point.lon);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = name;
        }
    });

    return best;
};

export const fetchArrivals = async (stopId, limit = 5) => {
    if (!stopId) return [];
    const data = await tflFetch(`/StopPoint/${encodeURIComponent(stopId)}/Arrivals`);
    if (!Array.isArray(data)) return [];

    return data
        .slice()
        .sort((a, b) => (a.timeToStation || 0) - (b.timeToStation || 0))
        .slice(0, limit)
        .map((prediction) => ({
            line: prediction.lineName || prediction.modeName || 'Service',
            destination: prediction.destinationName || prediction.towards || 'Unknown destination',
            dueInMins: Math.max(0, Math.round((prediction.timeToStation || 0) / 60))
        }));
};

export const fetchArrivalsForStation = async (stationName) => {
    const stop = await searchStopPoint(stationName);
    if (!stop) return [];
    const arrivalsId = await resolveArrivalsStopId(stop);
    return fetchArrivals(arrivalsId);
};

const mapLegType = (modeId = '') => {
    const mode = String(modeId).toLowerCase();
    if (mode === 'walking' || mode === 'walk') return 'walk';
    if (mode === 'bus' || mode === 'coach') return 'bus';
    return 'tube';
};

const journeyToStrategy = (journey, index, apiKey, start, end) => {
    const legs = journey.legs || [];
    const steps = legs.map((leg) => {
        const modeId = leg.mode?.id || leg.mode?.name || '';
        const summary = leg.instruction?.summary || `Travel by ${modeId || 'transit'}`;
        return {
            type: mapLegType(modeId),
            text: summary,
            durationMins: leg.duration || null,
            modeName: leg.mode?.name || modeId || ''
        };
    });

    const duration = journey.duration || 0;
    const interchangeCount = Math.max(0, legs.filter((leg) => {
        const modeId = String(leg.mode?.id || '').toLowerCase();
        return modeId && modeId !== 'walking' && modeId !== 'walk';
    }).length - 1);

    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const createMapUrl = (origin, destination, mode = 'transit') => {
        if (apiKey) {
            return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}&zoom=12`;
        }
        return `https://maps.google.com/maps?output=embed&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=r`;
    };

    const id = index === 0 ? 'tfl-step-free' : `tfl-step-free-alt-${index}`;
    return {
        id,
        title: index === 0 ? 'TfL step-free journey' : `TfL step-free alternative ${index}`,
        badge: index === 0 ? 'Live TfL' : 'TfL alt',
        rationale: `Official step-free plan (${duration} mins, ${interchangeCount} interchange${interchangeCount === 1 ? '' : 's'}).`,
        mapUrl: createMapUrl(startStation, endStation, 'transit'),
        waypointMapUrl: createMapUrl(startStation, endStation, 'transit'),
        finalLegMapUrl: createMapUrl(startStation, endStation, 'transit'),
        steps: steps.length ? steps : [{ type: 'tube', text: `Travel step-free from ${start} to ${end}.` }],
        durationMins: duration,
        interchangeCount,
        tflLive: true
    };
};

export const fetchStepFreeJourneyStrategies = async ({ fromStation, toStation, apiKey = '' }) => {
    const [fromStop, toStop] = await Promise.all([
        searchStopPoint(fromStation),
        searchStopPoint(toStation)
    ]);

    const fromRef = fromStop?.icsId || fromStop?.id;
    const toRef = toStop?.icsId || toStop?.id;
    if (!fromRef || !toRef) return [];

    const data = await tflFetch(`/Journey/JourneyResults/${encodeURIComponent(fromRef)}/to/${encodeURIComponent(toRef)}`, {
        accessibilityPreference: 'StepFreeToPlatform',
        mode: 'tube,bus,dlr,overground,elizabeth-line,national-rail,walking'
    });

    const journeys = Array.isArray(data.journeys) ? data.journeys.slice(0, 2) : [];
    return journeys.map((journey, index) => journeyToStrategy(journey, index, apiKey, fromStation, toStation));
};

/**
 * Live TfL: browser always attempts public endpoints; app key raises rate limits.
 * Node unit tests stay offline unless FREEFLOW_TFL_APP_KEY (or FORCE) is set.
 * Set FREEFLOW_TFL_LIVE=0 to disable live calls in the browser (degraded mode).
 */
export const isTflLiveEnabled = () => {
    if (typeof window !== 'undefined') {
        const flag = window.FREEFLOW_TFL_LIVE;
        if (flag === 0 || flag === '0' || flag === false) return false;
        return true;
    }
    return Boolean(TFL_APP_KEY);
};
