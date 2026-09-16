/**
 * Data-driven accessible hub resolution.
 * No hard-coded station→hub map — hubs are chosen from published Full stations
 * using locality / name similarity, then on-device learning.
 */

import { stationsDataFallback } from '../data/stationsData.js';
import { getLearnedHub } from './routeLearning.js';
import { localityKey } from './localSurface.js';

const NORMALISE = (name = '') => String(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\bstation\b/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokens = (name = '') => NORMALISE(name).split(' ').filter((part) => part.length > 1);

const fullStationsFrom = (stationData = stationsDataFallback) => Object.entries(stationData)
    .filter(([, accessibility]) => accessibility === 'Full')
    .map(([name]) => name);

/**
 * Score how well a Full station can act as an accessible hub for `station`.
 * Higher is better. Purely derived from names + accessibility dataset.
 */
export const scoreHubCandidate = (station, candidate) => {
    if (!station || !candidate || station === candidate) return -1;

    const stationTokens = tokens(station);
    const candidateTokens = tokens(candidate);
    if (!candidateTokens.length) return -1;

    let score = 0;
    const stationLocality = localityKey(station);
    const candidateLocality = localityKey(candidate);

    // Strong locality / name signal only — never invent a hub from alphabetical neighbours.
    if (stationLocality && candidateLocality && stationLocality === candidateLocality
        && !['east', 'west', 'north', 'south', 'high', 'new', 'old', 'lower', 'upper', 'royal', 'wood', 'park', 'road', 'street', 'green', 'hill', 'cross'].includes(stationLocality)) {
        score += 100;
    }

    // Shared significant tokens (e.g. Clapham Common ↔ Clapham Junction).
    stationTokens.forEach((token) => {
        if (candidateTokens.includes(token)) score += 24;
    });

    // Containment / prefix cues without listing stations by name.
    const left = NORMALISE(station);
    const right = NORMALISE(candidate);
    if (left && right) {
        if (right.startsWith(left) || left.startsWith(right)) score += 18;
        const shorter = left.length <= right.length ? left : right;
        const longer = left.length <= right.length ? right : left;
        if (shorter.length >= 4 && longer.includes(shorter)) score += 12;
    }

    // Prefer slightly shorter hub labels when scores tie later.
    score -= Math.min(6, Math.abs(candidateTokens.length - stationTokens.length));
    return score;
};

export const STRONG_HUB_SCORE = 24;

export const pickBestFullHub = (station, stationData = stationsDataFallback) => {
    const fullStations = fullStationsFrom(stationData);
    if (!fullStations.length) return null;

    let bestSimilar = null;
    let bestSimilarScore = -Infinity;
    fullStations.forEach((candidate) => {
        const score = scoreHubCandidate(station, candidate);
        if (score > bestSimilarScore) {
            bestSimilarScore = score;
            bestSimilar = candidate;
        }
    });

    // Only accept a named hub when locality / name similarity is strong.
    // Weak alphabetical neighbours (Aldgate → Acton Town) mislead travellers.
    if (bestSimilar && bestSimilarScore >= STRONG_HUB_SCORE) return bestSimilar;
    return null;
};

export const hasStrongHubSignal = (station, hubStation) => (
    scoreHubCandidate(station, hubStation) >= STRONG_HUB_SCORE
);

/**
 * Resolve an accessible hub station name (without “Station, London” suffix).
 */
export const resolveAccessibleHubStation = (
    station,
    accessibility,
    stationData = stationsDataFallback
) => {
    if (accessibility === 'Full') return station;

    const learned = getLearnedHub(station);
    if (learned && stationData[learned] === 'Full') return learned;

    // If learning pointed at a non-Full tip, ignore it and stay data-driven.
    return pickBestFullHub(station, stationData);
};

export const resolveAccessibleHubLabel = (
    station,
    accessibility,
    stationData = stationsDataFallback
) => {
    const hubStation = resolveAccessibleHubStation(station, accessibility, stationData);
    if (hubStation) return `${hubStation} Station, London`;
    return `accessible station near ${station} Station, London`;
};

/**
 * Build example Full→Full journeys from the live dataset (no hard-coded pairs).
 */
export const buildExampleJourneys = (stationData = stationsDataFallback, limit = 4) => {
    const fullStations = fullStationsFrom(stationData);
    if (fullStations.length < 2) return [];

    const pairs = [];
    const step = Math.max(1, Math.floor(fullStations.length / (limit + 1)));
    for (let i = 0; i < limit; i += 1) {
        const start = fullStations[(i * step) % fullStations.length];
        const end = fullStations[(i * step + Math.floor(fullStations.length / 2)) % fullStations.length];
        if (start === end) continue;
        pairs.push({ start, end });
    }
    return pairs;
};
