import { getLiveContext } from './liveContext.js';

const ACCESSIBILITY_WEIGHT = { Full: 3, Interchange: 2, Partial: 1, None: 0 };
export const classifyAccessibilityScenario = (startAccessibility, endAccessibility) => `${startAccessibility}->${endAccessibility}`;

const getDirectionFlag = (mode) => {
    if (mode === 'walking') return 'w';
    if (mode === 'transit') return 'r';
    if (mode === 'driving') return 'd';
    return '';
};

const createMapUrl = (apiKey, origin, destination, mode, waypoints = []) => {
    if (apiKey) {
        let url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}&zoom=12`;
        if (waypoints.length > 0) url += `&waypoints=${encodeURIComponent(waypoints.join('|'))}`;
        return url;
    }

    const dirFlag = getDirectionFlag(mode);
    const fullDestination = [...waypoints, destination].join(' to:');
    let url = `https://maps.google.com/maps?output=embed&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(fullDestination)}`;
    if (dirFlag) {
        url += `&dirflg=${encodeURIComponent(dirFlag)}`;
    }
    return url;
};

const baseStep = (type, text) => ({ type, text });

const buildScenarioStrategies = (apiKey, start, end, startAccessibility, endAccessibility, hubs) => {
    const scenario = classifyAccessibilityScenario(startAccessibility, endAccessibility);
    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const originHub = hubs.originHub || `accessible station near ${start} Station, London`;
    const destinationHub = hubs.destinationHub || `accessible station near ${end} Station, London`;

    const effectiveOrigin = ['None', 'Partial'].includes(startAccessibility) ? originHub : startStation;
    const baseTube = {
        id: 'tube-core',
        title: 'Tube-first core route',
        badge: 'Tube-first',
        rationale: 'Uses Tube and rail first wherever access appears feasible.',
        mapUrl: createMapUrl(apiKey, effectiveOrigin, endStation, 'transit'),
        waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, endStation, 'transit', [destinationHub]),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'transit'),
        steps: [baseStep('tube', `Travel from ${effectiveOrigin} toward ${end}.`)]
    };

    if (startAccessibility === 'Full' && endAccessibility === 'Full') {
        return {
            scenario,
            policy: { originRerouteRequired: false, destinationTransferRequired: false },
            strategies: [baseTube, {
            id: 'bus-backup',
            title: 'Bus fallback route',
            badge: 'Backup',
            rationale: 'Use this if lifts fail or disruption affects rail access.',
            mapUrl: createMapUrl(apiKey, startStation, endStation, 'transit', [destinationHub]),
            waypointMapUrl: createMapUrl(apiKey, startStation, endStation, 'transit', [originHub, destinationHub]),
            finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'transit'),
            steps: [baseStep('bus', `Switch to bus near ${destinationHub} if needed.`)]
        }]
        };
    }

    if (startAccessibility === 'Full' && endAccessibility === 'Partial') {
        return {
            scenario,
            policy: { originRerouteRequired: false, destinationTransferRequired: true },
            strategies: [{
            id: 'partial-destination-transfer',
            title: 'Accessible interchange then final transfer',
            badge: 'Partial destination',
            rationale: 'Stay on Tube, then transfer at an accessible interchange for final approach.',
            mapUrl: createMapUrl(apiKey, startStation, destinationHub, 'transit'),
            waypointMapUrl: createMapUrl(apiKey, startStation, destinationHub, 'transit'),
            finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'walking'),
            steps: [
                baseStep('tube', `Take Tube from ${start} to ${destinationHub}.`),
                baseStep('bus', `Complete final access to ${end} by accessible bus/walk if platform access is constrained.`)
            ]
        }, {
            id: 'partial-destination-bus-first-final',
            title: 'Early bus switch for predictable final access',
            badge: 'Alternative',
            rationale: 'Switch to bus before destination to avoid uncertain platform constraints.',
            mapUrl: createMapUrl(apiKey, startStation, destinationHub, 'transit'),
            waypointMapUrl: createMapUrl(apiKey, startStation, destinationHub, 'transit'),
            finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'walking'),
            steps: [
                baseStep('tube', `Travel by Tube from ${start} to ${destinationHub}.`),
                baseStep('bus', `Use bus/walk for final approach into ${end}.`)
            ]
        }]
        };
    }

    const constrained = ['None', 'Partial', 'Interchange'].includes(startAccessibility) || ['None', 'Partial', 'Interchange'].includes(endAccessibility);
    if (constrained) {
        const originRerouteRequired = ['None', 'Partial'].includes(startAccessibility);
        const destinationTransferRequired = ['None', 'Partial', 'Interchange'].includes(endAccessibility);
        return {
            scenario,
            policy: { originRerouteRequired, destinationTransferRequired },
            strategies: [{
            id: 'access-hub',
            title: 'Accessible hub transfer',
            badge: 'Bus-link required',
            rationale: 'Reroutes via accessible hubs when origin or destination is constrained.',
            mapUrl: createMapUrl(apiKey, originHub, destinationHub, 'transit'),
            waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, destinationHub, 'transit', [originHub]),
            finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, destinationTransferRequired ? 'walking' : 'transit'),
            steps: [
                baseStep('bus', originRerouteRequired ? `Start with bus/walk transfer from ${start} to accessible hub ${originHub}.` : `Begin from ${effectiveOrigin}.`),
                baseStep('tube', `Travel by Tube from ${originHub} to accessible interchange ${destinationHub}.`),
                baseStep('walk', destinationTransferRequired ? `Use bus/walking transfer for final constrained segment to ${end}.` : `Continue directly to ${end}.`)
            ]
            }, {
                id: 'hub-backup',
                title: 'Conservative fallback via accessible hubs',
                badge: 'Backup',
                rationale: 'Maximises accessibility certainty over speed.',
                mapUrl: createMapUrl(apiKey, originHub, destinationHub, 'transit'),
                waypointMapUrl: createMapUrl(apiKey, originHub, destinationHub, 'transit'),
                finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'walking'),
                steps: [
                    baseStep('bus', `Reach ${originHub} from ${start} using an accessible transfer.`),
                    baseStep('tube', `Travel to ${destinationHub} by Tube.`),
                    baseStep('walk', `Complete final transfer to ${end}.`)
                ]
            }]
        };
    }

    return { scenario, policy: { originRerouteRequired: false, destinationTransferRequired: false }, strategies: [baseTube] };
};

const scoreStrategy = (strategy, startAccessibility, endAccessibility, disruptedLines) => {
    const accessScore = ACCESSIBILITY_WEIGHT[startAccessibility] + ACCESSIBILITY_WEIGHT[endAccessibility];
    const railPenalty = disruptedLines.length > 0 ? 1 : 0;
    const hubBonus = strategy.id.includes('hub') || strategy.id.includes('transfer') ? 1 : 0;
    return accessScore + hubBonus - railPenalty;
};

export const buildDynamicRecommendations = async ({ apiKey, start, end, startAccessibility, endAccessibility }) => {
    const liveContext = await getLiveContext({ start, end, startAccessibility, endAccessibility });
    const assumptions = ['Lift and service status may change before travel; check again before departure.', ...liveContext.assumptions];
    const { scenario, policy, strategies } = buildScenarioStrategies(apiKey, start, end, startAccessibility, endAccessibility, {
        originHub: liveContext.originHub,
        destinationHub: liveContext.destinationHub
    });

    const ranked = strategies
        .map((strategy) => ({ ...strategy, score: scoreStrategy(strategy, startAccessibility, endAccessibility, liveContext.disruptedLines || []) }))
        .sort((a, b) => b.score - a.score);

    return {
        scenario,
        degraded: liveContext.degraded,
        assumptions,
        recommended: ranked[0],
        alternatives: ranked.slice(1),
        liveContext,
        policy
    };
};
