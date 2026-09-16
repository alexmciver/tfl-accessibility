/**
 * Free Flow route memory — learns on-device from corrections and feedback.
 * Stored in localStorage; never sent to a server.
 */

const MEMORY_KEY = 'freeflow_route_memory_v1';
const MAX_EVENTS = 80;

/** In-memory fallback when localStorage is unavailable (Node tests / private mode). */
let sessionMemory = null;

const NORMALISE = (name = '') => String(name)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\bstation\b/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const pairKey = (start, end) => {
    const left = NORMALISE(start);
    const right = NORMALISE(end);
    return [left, right].sort().join('|');
};

const emptyMemory = () => ({
    version: 1,
    surfacePairs: {},
    hubOverrides: {},
    events: []
});

export const loadRouteMemory = () => {
    try {
        if (typeof localStorage === 'undefined') {
            return sessionMemory || emptyMemory();
        }
        const raw = JSON.parse(localStorage.getItem(MEMORY_KEY) || 'null');
        if (!raw || typeof raw !== 'object') return sessionMemory || emptyMemory();
        return {
            version: 1,
            surfacePairs: raw.surfacePairs && typeof raw.surfacePairs === 'object' ? raw.surfacePairs : {},
            hubOverrides: raw.hubOverrides && typeof raw.hubOverrides === 'object' ? raw.hubOverrides : {},
            events: Array.isArray(raw.events) ? raw.events.slice(0, MAX_EVENTS) : []
        };
    } catch (error) {
        return sessionMemory || emptyMemory();
    }
};

export const saveRouteMemory = (memory) => {
    const next = {
        version: 1,
        surfacePairs: memory.surfacePairs || {},
        hubOverrides: memory.hubOverrides || {},
        events: (memory.events || []).slice(0, MAX_EVENTS)
    };
    sessionMemory = next;
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
        }
    } catch (error) {
        // Ignore quota / private-mode failures; session memory still applies.
    }
    return next;
};

const pushEvent = (memory, event) => {
    memory.events = [{ at: new Date().toISOString(), ...event }, ...(memory.events || [])].slice(0, MAX_EVENTS);
};

export const isLearnedSurfacePair = (start, end, memory = loadRouteMemory()) => {
    const entry = memory.surfacePairs?.[pairKey(start, end)];
    return Boolean(entry && (entry.weight || 0) >= 1);
};

export const getLearnedHub = (station, memory = loadRouteMemory()) => {
    const entry = memory.hubOverrides?.[NORMALISE(station)];
    if (!entry || !entry.hub || (entry.weight || 0) < 1) return null;
    return entry.hub;
};

export const learnSurfacePair = (start, end, {
    reason = 'Local surface travel preferred',
    source = 'auto',
    weight = 1,
    memory = loadRouteMemory()
} = {}) => {
    const key = pairKey(start, end);
    const existing = memory.surfacePairs[key] || { weight: 0, reason, source, hits: 0 };
    memory.surfacePairs[key] = {
        start,
        end,
        reason,
        source,
        weight: Math.min(12, (existing.weight || 0) + weight),
        hits: (existing.hits || 0) + 1,
        updatedAt: new Date().toISOString()
    };
    pushEvent(memory, { type: 'surface', start, end, reason, source });
    return saveRouteMemory(memory);
};

export const learnHubOverride = (station, hub, {
    reason = 'Accessible hub preference',
    source = 'auto',
    weight = 1,
    memory = loadRouteMemory()
} = {}) => {
    const key = NORMALISE(station);
    const hubName = String(hub).replace(/Station,\s*London$/i, '').replace(/\s+Station$/i, '').trim();
    const existing = memory.hubOverrides[key] || { weight: 0, hub: hubName, hits: 0 };
    memory.hubOverrides[key] = {
        station,
        hub: hubName,
        reason,
        source,
        weight: Math.min(12, (existing.weight || 0) + weight),
        hits: (existing.hits || 0) + 1,
        updatedAt: new Date().toISOString()
    };
    pushEvent(memory, { type: 'hub', station, hub: hubName, reason, source });
    return saveRouteMemory(memory);
};

/**
 * Auto-learn from a Free Flow plan: surface pairs and hubs Free Flow already corrected.
 */
export const learnFromPlan = ({
    start,
    end,
    policy = {},
    liveContext = {},
    planA = null
} = {}) => {
    let memory = loadRouteMemory();

    if (policy.preferSurfaceRoute || planA?.surfaceRoute) {
        memory = learnSurfacePair(start, end, {
            reason: 'Auto-learned: both ends street-constrained in a local corridor',
            source: 'auto',
            weight: 1,
            memory
        });
    }

    if (policy.originRerouteRequired && liveContext.originHub) {
        memory = learnHubOverride(start, liveContext.originHub, {
            reason: 'Auto-learned origin hub from Free Flow access gate',
            source: 'auto',
            weight: 1,
            memory
        });
    }

    if (policy.destinationTransferRequired && liveContext.destinationHub) {
        memory = learnHubOverride(end, liveContext.destinationHub, {
            reason: 'Auto-learned destination hub from Free Flow access gate',
            source: 'auto',
            weight: 1,
            memory
        });
    }

    return memory;
};

/**
 * Explicit traveller feedback — stronger weights than auto lessons.
 */
export const learnFromFeedback = ({
    start,
    end,
    feedback,
    liveContext = {}
} = {}) => {
    let memory = loadRouteMemory();

    if (feedback === 'helpful') {
        pushEvent(memory, { type: 'feedback', start, end, feedback: 'helpful' });
        return saveRouteMemory(memory);
    }

    if (feedback === 'prefer-surface') {
        memory = learnSurfacePair(start, end, {
            reason: 'Traveller feedback: should be bus or walk',
            source: 'user',
            weight: 3,
            memory
        });
        return memory;
    }

    if (feedback === 'wrong-hub') {
        // Strengthen surface preference and weaken reliance on current hubs by
        // boosting surface and recording the complaint.
        memory = learnSurfacePair(start, end, {
            reason: 'Traveller feedback: hub plan felt wrong for this corridor',
            source: 'user',
            weight: 2,
            memory
        });
        if (liveContext.originHub) {
            memory = learnHubOverride(start, liveContext.originHub, {
                reason: 'Retained hub after feedback — verify next time',
                source: 'user',
                weight: 1,
                memory
            });
        }
        pushEvent(memory, { type: 'feedback', start, end, feedback: 'wrong-hub' });
        return saveRouteMemory(memory);
    }

    return memory;
};

export const memorySummary = (memory = loadRouteMemory()) => {
    const surfaceCount = Object.keys(memory.surfacePairs || {}).length;
    const hubCount = Object.keys(memory.hubOverrides || {}).length;
    const eventCount = (memory.events || []).length;
    return {
        surfaceCount,
        hubCount,
        eventCount,
        line: `Learned ${surfaceCount} surface link${surfaceCount === 1 ? '' : 's'} · ${hubCount} hub tip${hubCount === 1 ? '' : 's'} · ${eventCount} memory event${eventCount === 1 ? '' : 's'}`
    };
};

export const clearRouteMemory = () => {
    sessionMemory = null;
    try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(MEMORY_KEY);
    } catch (error) {
        // ignore
    }
    return emptyMemory();
};
