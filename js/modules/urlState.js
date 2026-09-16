/**
 * Encode / restore planner choices in the page URL for sharing and bookmarks.
 *
 * Example:
 * ?from=Clapham%20Common&to=Clapham%20High%20Street&wheelchair=1&walk=15&plan=1
 */

const FLAG_KEYS = {
    wheelchair: 'wheelchair',
    noEscalators: 'noEscalators',
    ramp: 'ramp',
    stepFree: 'stepFree',
    plan: 'plan'
};

const normaliseStationKey = (value = '') => String(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\bstation\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const resolveStationName = (query, stationData = {}) => {
    const typed = String(query || '').trim();
    if (!typed || !stationData || typeof stationData !== 'object') return '';
    if (stationData[typed]) return typed;
    const key = normaliseStationKey(typed);
    if (!key) return '';
    const match = Object.keys(stationData).find((name) => normaliseStationKey(name) === key);
    return match || '';
};

const readFlag = (params, key) => {
    const raw = params.get(key);
    return raw === '1' || raw === 'true' || raw === 'yes';
};

/**
 * Read planner state from the current location search string.
 */
export const readPlannerUrl = (stationData = {}, search = window.location.search) => {
    const params = new URLSearchParams(search);
    const hasProfileHints = ['wheelchair', 'noEscalators', 'ramp', 'walk'].some((key) => params.has(key));
    const walkRaw = Number(params.get('walk'));
    const profile = hasProfileHints
        ? {
            wheelchair: readFlag(params, FLAG_KEYS.wheelchair),
            noEscalators: readFlag(params, FLAG_KEYS.noEscalators),
            rampNeeded: readFlag(params, FLAG_KEYS.ramp),
            maxWalkMins: Number.isFinite(walkRaw) && walkRaw > 0 ? walkRaw : undefined
        }
        : null;

    return {
        from: resolveStationName(params.get('from') || '', stationData),
        to: resolveStationName(params.get('to') || '', stationData),
        profile,
        stepFree: params.has(FLAG_KEYS.stepFree) ? readFlag(params, FLAG_KEYS.stepFree) : null,
        plan: readFlag(params, FLAG_KEYS.plan) || Boolean(params.get('from') && params.get('to')),
        hasQuery: Boolean(params.toString())
    };
};

/**
 * Write planner choices into the URL without reloading the page.
 */
export const writePlannerUrl = ({
    from = '',
    to = '',
    profile = {},
    stepFree = false,
    plan = false
} = {}, { replace = true } = {}) => {
    if (typeof window === 'undefined' || !window.history?.replaceState) return;

    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (profile.wheelchair) params.set(FLAG_KEYS.wheelchair, '1');
    if (profile.noEscalators) params.set(FLAG_KEYS.noEscalators, '1');
    if (profile.rampNeeded) params.set(FLAG_KEYS.ramp, '1');
    if (profile.maxWalkMins && Number(profile.maxWalkMins) !== 10) {
        params.set('walk', String(profile.maxWalkMins));
    }
    if (stepFree) params.set(FLAG_KEYS.stepFree, '1');
    if (plan && from && to) params.set(FLAG_KEYS.plan, '1');

    try {
        const nextUrl = new URL(window.location.href);
        nextUrl.search = params.toString();
        if (nextUrl.href === window.location.href) return;
        if (replace) {
            window.history.replaceState({ freeflow: true }, '', nextUrl.href);
        } else {
            window.history.pushState({ freeflow: true }, '', nextUrl.href);
        }
    } catch (error) {
        // file:// history updates can fail in some browsers — ignore quietly.
    }
};

export const clearPlannerUrl = () => {
    if (typeof window === 'undefined' || !window.history?.replaceState) return;
    try {
        const nextUrl = new URL(window.location.href);
        nextUrl.search = '';
        if (nextUrl.href === window.location.href) return;
        window.history.replaceState({ freeflow: true }, '', nextUrl.href);
    } catch (error) {
        // Ignore file:// history limitations.
    }
};
