import { stationsDataFallback } from '../data/stationsData.js';

const fallbackBreakdown = (station, accessibility) => ({
    station,
    summary: `Step-free indicator: ${accessibility}`,
    details: [
        'Constraint baseline generated from bundled accessibility data.',
        accessibility === 'Full'
            ? 'Street-to-platform step-free route expected.'
            : 'Partial or constrained access expected on at least one station segment.',
        'Use staffed assistance and a nearby accessible interchange if required.'
    ]
});

const ACCESSIBLE_HUB_OVERRIDES = {
    Aldgate: 'Liverpool Street',
    'Aldgate East': 'Whitechapel',
    Bank: 'London Bridge',
    Barbican: 'Farringdon',
    Angel: 'King’s Cross St. Pancras',
    Waterloo: 'London Bridge',
    Victoria: 'Green Park'
};

const stationNames = Object.keys(stationsDataFallback);
const getNearestFullStation = (station) => {
    const originIndex = stationNames.indexOf(station);
    if (originIndex === -1) return 'London Bridge';

    for (let offset = 1; offset < stationNames.length; offset += 1) {
        const lowerIndex = originIndex - offset;
        if (lowerIndex >= 0) {
            const lowerName = stationNames[lowerIndex];
            if (stationsDataFallback[lowerName] === 'Full') return lowerName;
        }
        const upperIndex = originIndex + offset;
        if (upperIndex < stationNames.length) {
            const upperName = stationNames[upperIndex];
            if (stationsDataFallback[upperName] === 'Full') return upperName;
        }
    }

    return 'London Bridge';
};

const deterministicHubName = (station, accessibility, type) => {
    if (accessibility === 'Full') return `${station} Station, London`;
    const overrideHub = ACCESSIBLE_HUB_OVERRIDES[station];
    const resolvedHub = overrideHub || getNearestFullStation(station);
    return `${resolvedHub} Station, London`;
};

const deterministicLiftStatus = (accessibility) => {
    if (accessibility === 'Full') return 'Expected operational';
    if (accessibility === 'Interchange') return 'Check interchange lifts';
    if (accessibility === 'Partial') return 'Partially available';
    if (accessibility === 'None') return 'Unavailable for full route';
    return 'Unknown';
};

const deterministicDepartures = (station) => ([
    { line: 'Tube service', destination: `${station} corridor service A`, dueInMins: 3 },
    { line: 'Tube service', destination: `${station} corridor service B`, dueInMins: 8 },
    { line: 'Bus transfer', destination: `Accessible transfer near ${station}`, dueInMins: 12 }
]);

export const getLiveContext = async ({ start, end, startAccessibility, endAccessibility }) => {
    return {
        degraded: false,
        assumptions: [
            'This route context is generated from bundled accessibility data (no third-party runtime dependency).',
            'Check station noticeboards or staff for on-the-day operational changes.'
        ],
        originHub: deterministicHubName(start, startAccessibility, 'origin'),
        destinationHub: deterministicHubName(end, endAccessibility, 'destination'),
        disruptedLines: [],
        stationBreakdown: [
            fallbackBreakdown(start, startAccessibility),
            fallbackBreakdown(end, endAccessibility)
        ],
        liveDepartures: deterministicDepartures(start),
        liftStatus: {
            start: deterministicLiftStatus(startAccessibility),
            end: deterministicLiftStatus(endAccessibility),
            interchange: deterministicLiftStatus(endAccessibility)
        }
    };
};
