import { isLearnedSurfacePair } from './routeLearning.js';

/**
 * Detect short local journeys where Tube-via-hubs is worse than surface travel.
 * Used when both ends lack street-to-train access and share a locality
 * (e.g. Clapham Common → Clapham High Street), or when memory has learned the pair.
 */

const NORMALISE = (name = '') => String(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\bstation\b/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** First significant locality token for multi-word station names. */
export const localityKey = (stationName = '') => {
    const parts = NORMALISE(stationName).split(' ').filter(Boolean);
    if (parts.length < 2) return null;
    const skip = new Set(['the', 'st', 'saint']);
    const first = parts.find((part) => !skip.has(part));
    return first || null;
};

export const shareLocality = (start, end) => {
    const left = localityKey(start);
    const right = localityKey(end);
    return Boolean(left && right && left === right);
};

/**
 * Prefer bus/walk when both stations are street-constrained and clearly local,
 * or when on-device memory has already learned this corridor.
 */
export const shouldPreferSurfaceRoute = (start, end, startAccessibility, endAccessibility, memory) => {
    if (isLearnedSurfacePair(start, end, memory)) return true;

    const bothStreetBlocked = startAccessibility === 'None' && endAccessibility === 'None';
    const bothConstrained = ['None', 'Partial'].includes(startAccessibility)
        && ['None', 'Partial'].includes(endAccessibility);
    if (!(bothStreetBlocked || bothConstrained)) return false;
    return shareLocality(start, end);
};
