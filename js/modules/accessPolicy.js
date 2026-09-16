import { shouldPreferSurfaceRoute } from './localSurface.js';
import { loadRouteMemory } from './routeLearning.js';

export const STREET_CONSTRAINED = ['None', 'Partial'];
export const DESTINATION_TRANSFER_LEVELS = ['None', 'Partial', 'Interchange'];

export const classifyAccessibilityScenario = (startAccessibility, endAccessibility) => (
    `${startAccessibility}->${endAccessibility}`
);

/**
 * Resolve hub / transfer policy for a journey, including profile-aware street checks
 * and on-device learning memory.
 */
export const resolveAccessPolicy = (startAccessibility, endAccessibility, profile = {}, stations = {}) => {
    const wheelchairStrict = Boolean(profile.wheelchair);
    const start = stations.start || '';
    const end = stations.end || '';
    const memory = stations.memory || loadRouteMemory();
    const preferSurfaceRoute = Boolean(start && end)
        && shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility, memory);

    const originRerouteRequired = !preferSurfaceRoute && (
        STREET_CONSTRAINED.includes(startAccessibility)
        || (wheelchairStrict && startAccessibility === 'Interchange')
    );
    const destinationTransferRequired = !preferSurfaceRoute
        && DESTINATION_TRANSFER_LEVELS.includes(endAccessibility);

    return {
        scenario: classifyAccessibilityScenario(startAccessibility, endAccessibility),
        originRerouteRequired,
        destinationTransferRequired,
        preferSurfaceRoute,
        wheelchairStrict,
        streetAccessRisk: {
            origin: startAccessibility !== 'Full',
            destination: endAccessibility !== 'Full'
        },
        accessFirst: preferSurfaceRoute || originRerouteRequired || destinationTransferRequired
    };
};
