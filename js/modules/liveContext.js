import { stationsDataFallback } from '../data/stationsData.js';
import {
    fetchArrivalsForStation,
    fetchLiftDisruptions,
    fetchNearestFullHub,
    findLiftDisruptionsForStation,
    isTflLiveEnabled
} from './tflApi.js';
import { shouldPreferSurfaceRoute } from './localSurface.js';
import {
    hasStrongHubSignal,
    resolveAccessibleHubLabel,
    resolveAccessibleHubStation
} from './hubResolver.js';

const fallbackBreakdown = (station, accessibility, { surfaceLocal = false } = {}) => ({
    station,
    summary: surfaceLocal
        ? 'Not street-to-train step-free — for nearby trips stay on bus or walk, do not use this Tube entrance.'
        : accessibility === 'Full'
            ? 'Full step-free access expected from street to platform.'
            : accessibility === 'Interchange'
                ? 'Step-free between platforms; street access may still involve steps.'
                : accessibility === 'Partial'
                    ? 'Some step-free access, but not every platform or exit.'
                    : 'Not step-free — plan via an accessible hub instead.',
    details: surfaceLocal
        ? [
            'Avoid entering this station for a short local Tube hop.',
            'Use accessible bus stops or a surface walk instead.',
            'Re-check live conditions before you travel.'
        ]
        : [
            accessibility === 'Full'
                ? 'Street-to-platform step-free route expected.'
                : 'Expect at least one constrained segment at this station.',
            'Ask staff for boarding ramp help if you need it.',
            'Re-check lift status before you travel.'
        ]
});

const deterministicHubName = (station, accessibility) => (
    resolveAccessibleHubLabel(station, accessibility, stationsDataFallback)
);

const hubLabelFromStation = (stationName) => `${stationName} Station, London`;

const resolveLiveHubLabel = async (station, accessibility) => {
    if (accessibility === 'Full') return hubLabelFromStation(station);

    const nameDriven = resolveAccessibleHubStation(station, accessibility, stationsDataFallback);
    if (nameDriven && nameDriven !== station && hasStrongHubSignal(station, nameDriven)) {
        return hubLabelFromStation(nameDriven);
    }

    try {
        const nearbyFull = await fetchNearestFullHub(station, stationsDataFallback);
        if (nearbyFull) return hubLabelFromStation(nearbyFull);
    } catch (error) {
        // Fall through to name-driven / offline hub.
    }

    return nameDriven && nameDriven !== station
        ? hubLabelFromStation(nameDriven)
        : deterministicHubName(station, accessibility);
};

const liftStatusFromDisruptions = (station, accessibility, disruptions) => {
    const matches = findLiftDisruptionsForStation(disruptions, station);
    if (matches.length > 0) {
        return {
            state: 'disruption',
            label: 'Disruption reported',
            detail: matches[0].message || 'A lift outage is affecting step-free access here.'
        };
    }
    if (accessibility === 'None') {
        return {
            state: 'unavailable',
            label: 'No full step-free lift route',
            detail: 'This station is not fully step-free even when lifts are working.'
        };
    }
    return {
        state: 'working',
        label: 'No lift outages reported',
        detail: 'TfL is not currently listing a lift disruption for this station.'
    };
};

const deterministicLiftCheck = (station, accessibility) => {
    if (accessibility === 'None') {
        return {
            state: 'unavailable',
            label: 'No full step-free lift route',
            detail: 'Live lift feed is off — based on published access only.'
        };
    }
    if (accessibility === 'Interchange') {
        return {
            state: 'unknown',
            label: 'Check interchange lifts',
            detail: 'Live lift feed is off — confirm before you travel.'
        };
    }
    if (accessibility === 'Partial') {
        return {
            state: 'unknown',
            label: 'Partial access — confirm lifts',
            detail: 'Live lift feed is off — some platforms may still need lifts.'
        };
    }
    return {
        state: 'unknown',
        label: 'Live lift status unavailable',
        detail: 'Add a TfL app key to see if lifts are working right now.'
    };
};

const collectLiftMessages = (...groups) => {
    const messages = [];
    groups.flat().forEach((item) => {
        if (item?.message && !messages.includes(item.message)) messages.push(item.message);
    });
    return messages.slice(0, 4);
};

const buildFallbackContext = ({ start, end, startAccessibility, endAccessibility, degradedReason }) => {
    const surfaceLocal = shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility);
    return {
        degraded: true,
        assumptions: [
            degradedReason || 'Live TfL data unavailable.',
            'Guidance uses published station accessibility data.',
            'Always confirm lift and service status on the day of travel.'
        ],
        originHub: deterministicHubName(start, startAccessibility),
        destinationHub: deterministicHubName(end, endAccessibility),
        disruptedLines: [],
        liftMessages: [],
        stationBreakdown: [
            fallbackBreakdown(start, startAccessibility, { surfaceLocal }),
            fallbackBreakdown(end, endAccessibility, { surfaceLocal })
        ],
        liveDepartures: [],
        departuresAreLive: false,
        liftsAreLive: false,
        liftChecks: {
            start: { station: start, ...deterministicLiftCheck(start, startAccessibility) },
            end: { station: end, ...deterministicLiftCheck(end, endAccessibility) },
            interchange: surfaceLocal
                ? {
                    station: 'Surface link',
                    state: 'unavailable',
                    label: 'No Tube interchange',
                    detail: 'This plan stays on bus/walk — Tube hubs are not used.'
                }
                : {
                    station: deterministicHubName(end, endAccessibility).replace(/ Station, London$/i, ''),
                    ...deterministicLiftCheck(end, endAccessibility)
                }
        },
        liftStatus: {
            start: deterministicLiftCheck(start, startAccessibility).label,
            end: deterministicLiftCheck(end, endAccessibility).label,
            interchange: surfaceLocal
                ? 'No Tube interchange'
                : deterministicLiftCheck(end, endAccessibility).label
        },
        journeyStrategies: []
    };
};

const enrichBreakdownWithLifts = (entry, disruptions) => {
    const matches = findLiftDisruptionsForStation(disruptions, entry.station);
    if (!matches.length) return entry;
    const messages = matches
        .map((item) => item.message)
        .filter(Boolean)
        .slice(0, 2);
    return {
        ...entry,
        details: [
            ...entry.details,
            ...messages
        ]
    };
};

export const getLiveContext = async ({ start, end, startAccessibility, endAccessibility }) => {
    if (!isTflLiveEnabled()) {
        return buildFallbackContext({
            start,
            end,
            startAccessibility,
            endAccessibility,
            degradedReason: 'Live TfL data unavailable (offline / file mode).'
        });
    }

    try {
        const [disruptions, liveDepartures, originHub, destinationHub] = await Promise.all([
            fetchLiftDisruptions(),
            fetchArrivalsForStation(start).catch(() => []),
            resolveLiveHubLabel(start, startAccessibility),
            resolveLiveHubLabel(end, endAccessibility)
        ]);

        const startLifts = findLiftDisruptionsForStation(disruptions, start);
        const endLifts = findLiftDisruptionsForStation(disruptions, end);
        const hubNames = [originHub, destinationHub]
            .map((hub) => hub.replace(/ Station, London$/i, ''));
        const interchangeLifts = hubNames.flatMap((hub) => findLiftDisruptionsForStation(disruptions, hub));

        const disruptedLines = [...startLifts, ...endLifts, ...interchangeLifts]
            .map((item) => item.stopPointName || item.message)
            .filter(Boolean);

        const liftMessages = collectLiftMessages(startLifts, endLifts, interchangeLifts);

        const assumptions = [
            'Guidance uses published station accessibility data plus live TfL lift disruptions.',
            'Always confirm lift and service status on the day of travel.'
        ];
        if (disruptedLines.length > 0) {
            assumptions.unshift('Live lift disruption reported on this corridor — prefer alternatives if unsure.');
        }

        const liftChecks = {
            start: { station: start, ...liftStatusFromDisruptions(start, startAccessibility, disruptions) },
            end: { station: end, ...liftStatusFromDisruptions(end, endAccessibility, disruptions) },
            interchange: (() => {
                const hub = hubNames[1] || hubNames[0] || end;
                const hubAccess = stationsDataFallback[hub] || endAccessibility;
                if (interchangeLifts.length > 0) {
                    return {
                        station: hub,
                        state: 'disruption',
                        label: 'Disruption reported',
                        detail: interchangeLifts[0].message || 'A lift outage is affecting an interchange on this plan.'
                    };
                }
                return { station: hub, ...liftStatusFromDisruptions(hub, hubAccess, disruptions) };
            })()
        };

        return {
            degraded: false,
            assumptions,
            originHub,
            destinationHub,
            disruptedLines: [...new Set(disruptedLines)],
            liftMessages,
            stationBreakdown: [
                enrichBreakdownWithLifts(
                    fallbackBreakdown(start, startAccessibility, {
                        surfaceLocal: shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility)
                    }),
                    disruptions
                ),
                enrichBreakdownWithLifts(
                    fallbackBreakdown(end, endAccessibility, {
                        surfaceLocal: shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility)
                    }),
                    disruptions
                )
            ],
            liveDepartures,
            departuresAreLive: liveDepartures.length > 0,
            liftsAreLive: true,
            liftChecks,
            liftStatus: {
                start: liftChecks.start.label,
                end: liftChecks.end.label,
                interchange: liftChecks.interchange.label
            },
            journeyStrategies: []
        };
    } catch (error) {
        return buildFallbackContext({
            start,
            end,
            startAccessibility,
            endAccessibility,
            degradedReason: 'Live TfL data unavailable (request failed).'
        });
    }
};
