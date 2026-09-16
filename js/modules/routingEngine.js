import { getLiveContext } from './liveContext.js';
import { fetchStepFreeJourneyStrategies, isTflLiveEnabled } from './tflApi.js';
import { resolveAccessPolicy, classifyAccessibilityScenario } from './accessPolicy.js';
import { assessTflTrust } from './tflTrust.js';
import { learnFromPlan, loadRouteMemory, memorySummary } from './routeLearning.js';

export { classifyAccessibilityScenario } from './accessPolicy.js';

const ACCESSIBILITY_WEIGHT = { Full: 3, Interchange: 2, Partial: 1, None: 0 };

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

const hubToStationName = (hub = '') => String(hub)
    .replace(/,\s*London$/i, '')
    .replace(/\s+Station$/i, '')
    .trim();

const wrapLiveStrategyWithAccessLegs = (strategy, {
    apiKey,
    start,
    end,
    policy,
    originHub,
    destinationHub
}) => {
    const steps = [...(strategy.steps || [])];
    if (policy.originRerouteRequired) {
        steps.unshift(baseStep('bus', `Start with bus/walk transfer from ${start} to accessible hub ${originHub}.`));
    }
    if (policy.destinationTransferRequired) {
        steps.push(baseStep('walk', `Use bus/walking transfer for final constrained segment to ${end}.`));
    }

    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const effectiveOrigin = policy.originRerouteRequired ? originHub : startStation;
    const railDestination = policy.destinationTransferRequired ? destinationHub : endStation;

    return {
        ...strategy,
        title: policy.accessFirst
            ? `Hub-corrected TfL timing (${strategy.title})`
            : strategy.title,
        badge: policy.accessFirst ? 'TfL + Free Flow hubs' : strategy.badge,
        freeflowVerified: true,
        tflCorrected: Boolean(policy.accessFirst),
        steps,
        mapUrl: createMapUrl(apiKey, effectiveOrigin, railDestination, 'transit'),
        waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, railDestination, 'transit'),
        finalLegMapUrl: createMapUrl(
            apiKey,
            destinationHub,
            endStation,
            policy.destinationTransferRequired ? 'walking' : 'transit'
        ),
        rationale: policy.accessFirst
            ? `${strategy.rationale} Free Flow rewrote street access via accessible hubs because TfL step-free labels are not street-to-train truth.`
            : `${strategy.rationale} Published Full access agrees with this corridor.`
    };
};

const buildScenarioStrategies = (apiKey, start, end, startAccessibility, endAccessibility, hubs, policy) => {
    const scenario = policy.scenario || classifyAccessibilityScenario(startAccessibility, endAccessibility);
    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const originHub = hubs.originHub || `accessible station near ${start} Station, London`;
    const destinationHub = hubs.destinationHub || `accessible station near ${end} Station, London`;

    const effectiveOrigin = policy.originRerouteRequired ? originHub : startStation;
    const baseTube = {
        id: 'tube-core',
        title: 'Tube-first core route',
        badge: 'Tube-first',
        freeflowVerified: true,
        rationale: 'Uses Tube and rail first wherever published street-to-train access appears feasible.',
        mapUrl: createMapUrl(apiKey, effectiveOrigin, endStation, 'transit'),
        waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, endStation, 'transit', [destinationHub]),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'transit'),
        steps: [baseStep('tube', `Travel from ${effectiveOrigin} toward ${end}.`)]
    };

    // Local None/Partial pairs (e.g. Clapham Common → Clapham High Street): stay on the surface.
    if (policy.preferSurfaceRoute) {
        return {
            scenario,
            policy,
            strategies: [{
                id: 'surface-direct',
                title: 'Direct bus or walk',
                badge: 'Surface-first',
                freeflowVerified: true,
                surfaceRoute: true,
                rationale: 'Both stations lack street-to-train access and are in the same local area. A Tube hop via hubs would be longer and still force inaccessible street access — stay on bus or walk.',
                mapUrl: createMapUrl(apiKey, startStation, endStation, 'transit'),
                waypointMapUrl: createMapUrl(apiKey, startStation, endStation, 'walking'),
                finalLegMapUrl: createMapUrl(apiKey, startStation, endStation, 'walking'),
                steps: [
                    baseStep('bus', `Take a local accessible bus between ${start} and ${end} — do not enter either station for a short Tube hop.`),
                    baseStep('walk', `Or walk the short local link if it fits your access profile and max walk time.`)
                ]
            }, {
                id: 'surface-walk',
                title: 'Walk-first local link',
                badge: 'Walk',
                freeflowVerified: true,
                surfaceRoute: true,
                rationale: 'Short local surface link without using inaccessible Tube stations.',
                mapUrl: createMapUrl(apiKey, startStation, endStation, 'walking'),
                waypointMapUrl: createMapUrl(apiKey, startStation, endStation, 'walking'),
                finalLegMapUrl: createMapUrl(apiKey, startStation, endStation, 'walking'),
                steps: [
                    baseStep('walk', `Walk from ${start} toward ${end} on the surface. Avoid Tube entrances at both ends.`)
                ]
            }, {
                id: 'hub-backup',
                title: 'Only if you must use rail',
                badge: 'Backup',
                freeflowVerified: true,
                rationale: 'Contingency only: if you need rail, reach nearby accessible hubs — not a good default for this short local trip.',
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

    if (startAccessibility === 'Full' && endAccessibility === 'Full') {
        return {
            scenario,
            policy,
            strategies: [baseTube, {
                id: 'bus-backup',
                title: 'Bus fallback route',
                badge: 'Backup',
                freeflowVerified: true,
                rationale: 'Use this if lifts fail or disruption affects rail access.',
                mapUrl: createMapUrl(apiKey, startStation, endStation, 'transit', [destinationHub]),
                waypointMapUrl: createMapUrl(apiKey, startStation, endStation, 'transit', [originHub, destinationHub]),
                finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, 'transit'),
                steps: [baseStep('bus', `Switch to bus near ${destinationHub} if needed.`)]
            }]
        };
    }

    if (startAccessibility === 'Full' && endAccessibility === 'Partial' && !policy.originRerouteRequired) {
        return {
            scenario,
            policy,
            strategies: [{
                id: 'partial-destination-transfer',
                title: 'Accessible interchange then final transfer',
                badge: 'Partial destination',
                freeflowVerified: true,
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
                freeflowVerified: true,
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

    const constrained = policy.accessFirst
        || ['None', 'Partial', 'Interchange'].includes(startAccessibility)
        || ['None', 'Partial', 'Interchange'].includes(endAccessibility);

    if (constrained) {
        return {
            scenario,
            policy,
            strategies: [{
                id: 'access-hub',
                title: 'Accessible hub transfer',
                badge: 'Free Flow verified',
                freeflowVerified: true,
                rationale: 'Access-first plan: published station categories force hubs where TfL street access can be wrong.',
                mapUrl: createMapUrl(apiKey, originHub, destinationHub, 'transit'),
                waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, destinationHub, 'transit', [originHub]),
                finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, policy.destinationTransferRequired ? 'walking' : 'transit'),
                steps: [
                    baseStep('bus', policy.originRerouteRequired
                        ? `Start with bus/walk transfer from ${start} to accessible hub ${originHub}.`
                        : `Begin from ${effectiveOrigin}.`),
                    baseStep('tube', `Travel by Tube from ${originHub} to accessible interchange ${destinationHub}.`),
                    baseStep('walk', policy.destinationTransferRequired
                        ? `Use bus/walking transfer for final constrained segment to ${end}.`
                        : `Continue directly to ${end}.`)
                ]
            }, {
                id: 'hub-backup',
                title: 'Conservative fallback via accessible hubs',
                badge: 'Backup',
                freeflowVerified: true,
                rationale: 'Maximises accessibility certainty over speed when lifts or street access fail.',
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

    return { scenario, policy, strategies: [baseTube] };
};

const scoreStrategy = (strategy, startAccessibility, endAccessibility, disruptedLines, profile = {}, policy = {}) => {
    const accessFirst = Boolean(policy.accessFirst);
    const preferSurface = Boolean(policy.preferSurfaceRoute);
    const accessScore = ACCESSIBILITY_WEIGHT[startAccessibility] + ACCESSIBILITY_WEIGHT[endAccessibility];
    const railPenalty = disruptedLines.length > 0 ? 1 : 0;
    const verifiedBonus = strategy.freeflowVerified ? 4 : 0;
    const hubBonus = strategy.id.includes('hub') || strategy.id.includes('transfer') ? 2 : 0;
    const surfaceBonus = strategy.surfaceRoute || String(strategy.id).includes('surface') ? 12 : 0;
    const liveBonus = strategy.tflLive
        ? (preferSurface ? 0 : accessFirst ? 1 : 5)
        : 0;
    const accessFirstHubBonus = accessFirst && !preferSurface && !strategy.tflLive && strategy.freeflowVerified
        && !strategy.surfaceRoute
        ? 6
        : 0;
    const durationBonus = typeof strategy.durationMins === 'number'
        ? Math.max(0, 3 - Math.floor(strategy.durationMins / 30))
        : 0;
    const interchangePenalty = typeof strategy.interchangeCount === 'number'
        ? Math.min(2, strategy.interchangeCount)
        : 0;
    const walkPenalty = profile.maxWalkMins && (strategy.steps || []).filter((step) => step.type === 'walk').length * 4 > profile.maxWalkMins
        ? 1
        : 0;
    const fewChangesBonus = profile.wheelchair && (strategy.interchangeCount || 0) <= 1 ? 1 : 0;
    return accessScore + verifiedBonus + hubBonus + surfaceBonus + liveBonus + accessFirstHubBonus + durationBonus
        + fewChangesBonus - railPenalty - interchangePenalty - walkPenalty;
};

export const buildDynamicRecommendations = async ({
    apiKey,
    start,
    end,
    startAccessibility,
    endAccessibility,
    profile = {}
}) => {
    const liveContext = await getLiveContext({ start, end, startAccessibility, endAccessibility });
    const assumptions = [
        'Lift and service status may change before travel; check again before departure.',
        'Free Flow treats published station accessibility as the hard gate. TfL “step-free to platform” is not street-to-train truth.',
        ...liveContext.assumptions
    ];

    const policy = resolveAccessPolicy(startAccessibility, endAccessibility, profile, { start, end });
    const { scenario, strategies } = buildScenarioStrategies(
        apiKey,
        start,
        end,
        startAccessibility,
        endAccessibility,
        {
            originHub: liveContext.originHub,
            destinationHub: liveContext.destinationHub
        },
        policy
    );

    let journeyStrategies = [];
    let journeyDegraded = false;
    let usedHubQuery = false;

    // Skip TfL rail journeys for local surface pairs — they often suggest inaccessible Tube hops.
    if (isTflLiveEnabled() && !policy.preferSurfaceRoute) {
        try {
            const fromStation = policy.originRerouteRequired
                ? (hubToStationName(liveContext.originHub) || start)
                : start;
            const toStation = policy.destinationTransferRequired
                ? (hubToStationName(liveContext.destinationHub) || end)
                : end;
            usedHubQuery = fromStation !== start || toStation !== end;

            const liveStrategies = await fetchStepFreeJourneyStrategies({
                fromStation,
                toStation,
                apiKey
            });
            journeyStrategies = liveStrategies.map((strategy) => wrapLiveStrategyWithAccessLegs(strategy, {
                apiKey,
                start,
                end,
                policy,
                originHub: liveContext.originHub,
                destinationHub: liveContext.destinationHub
            }));
            if (usedHubQuery) {
                assumptions.push(
                    `TfL rail timing was requested between accessible hubs (${fromStation} → ${toStation}), not the constrained street stations.`
                );
            }
        } catch (error) {
            journeyDegraded = true;
            assumptions.push('TfL step-free journey lookup failed; showing Free Flow hub-based guidance.');
        }
    } else if (policy.preferSurfaceRoute) {
        assumptions.push(
            `Local surface journey: ${start} and ${end} both lack street-to-train access in the same area — Free Flow prefers bus/walk over Tube hubs.`
        );
    }

    const trust = assessTflTrust({
        startAccessibility,
        endAccessibility,
        policy,
        usedHubQuery,
        liveJourneyCount: journeyStrategies.length
    });

    if (trust.differsFromTfl) {
        assumptions.push(trust.trustLabel);
        trust.conflicts.forEach((conflict) => assumptions.push(conflict.detail));
    }

    const rankedLive = journeyStrategies
        .map((strategy) => ({
            ...strategy,
            score: scoreStrategy(
                strategy,
                startAccessibility,
                endAccessibility,
                liveContext.disruptedLines || [],
                profile,
                policy
            )
        }))
        .sort((a, b) => b.score - a.score);

    const rankedHub = strategies
        .map((strategy) => ({
            ...strategy,
            score: scoreStrategy(
                strategy,
                startAccessibility,
                endAccessibility,
                liveContext.disruptedLines || [],
                profile,
                policy
            ),
            contingency: true
        }))
        .sort((a, b) => b.score - a.score);

    // Access-first / surface-first: Free Flow verified plans beat raw TfL.
    let recommended;
    let alternatives;
    if (policy.preferSurfaceRoute || policy.accessFirst) {
        recommended = rankedHub[0] || rankedLive[0];
        alternatives = [
            ...rankedHub.filter((item) => item !== recommended),
            ...rankedLive
        ];
    } else {
        recommended = rankedLive[0] || rankedHub[0];
        alternatives = rankedLive.length > 0
            ? [...rankedLive.slice(1), ...rankedHub]
            : rankedHub.slice(1);
    }

    const degraded = liveContext.degraded || journeyDegraded;
    const memory = learnFromPlan({
        start,
        end,
        policy,
        liveContext,
        planA: recommended
    });
    const learned = memorySummary(memory);

    if (learned.surfaceCount || learned.hubCount) {
        assumptions.push(`On-device learning: ${learned.line}.`);
    }

    return {
        scenario,
        degraded,
        assumptions,
        recommended,
        alternatives,
        planA: recommended,
        planB: alternatives[0] || null,
        trust,
        learning: learned,
        liveContext: {
            ...liveContext,
            journeyStrategies
        },
        policy
    };
};
