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

/** Compass / generic prefixes that alone do not prove two stations are nearby. */
const GENERIC_LOCALITY = new Set([
    'east', 'west', 'north', 'south', 'high', 'new', 'old', 'lower', 'upper',
    'royal', 'wood', 'park', 'road', 'street', 'green', 'hill', 'cross',
    'queens', 'kings', 'manor', 'gate', 'town', 'common'
]);

const SKIP_TOKENS = new Set(['the', 'st', 'saint', 'and', 'for', 'of']);

const significantTokens = (stationName = '') => NORMALISE(stationName)
    .split(' ')
    .filter((part) => part.length > 1 && !SKIP_TOKENS.has(part));

/** First significant locality token for multi-word station names. */
export const localityKey = (stationName = '') => {
    const parts = significantTokens(stationName);
    if (parts.length < 1) return null;
    // Single-word stations have no multi-part locality cue.
    if (NORMALISE(stationName).split(' ').filter(Boolean).length < 2) return null;
    return parts[0] || null;
};

/**
 * True only when names share a meaningful locality cue — not merely
 * “East …” / “West …” / “South …” compass prefixes.
 */
export const shareLocality = (start, end) => {
    const leftTokens = significantTokens(start);
    const rightTokens = significantTokens(end);
    if (!leftTokens.length || !rightTokens.length) return false;

    const shared = leftTokens.filter((token) => rightTokens.includes(token));
    if (!shared.length) return false;

    // Two or more shared tokens (e.g. New Cross → New Cross Gate).
    if (shared.length >= 2) return true;

    // A single shared token is enough only when it is not a generic prefix.
    return !GENERIC_LOCALITY.has(shared[0]);
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
