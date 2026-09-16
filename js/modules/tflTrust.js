/**
 * Trust layer: TfL Journey Planner “StepFreeToPlatform” is useful for rail timing,
 * but it is not reliable street-to-train truth. Free Flow cross-checks published
 * station accessibility and forces accessible hubs where TfL can mislead.
 */

export const assessTflTrust = ({
    startAccessibility,
    endAccessibility,
    policy,
    usedHubQuery = false,
    liveJourneyCount = 0
}) => {
    const conflicts = [];

    if (policy?.preferSurfaceRoute) {
        conflicts.push({
            code: 'LOCAL_SURFACE',
            detail: 'Both ends lack street-to-train access in the same local area. Free Flow prefers bus/walk — TfL often still suggests Tube.'
        });
    }
    if (policy?.originRerouteRequired) {
        conflicts.push({
            code: 'ORIGIN_STREET_ACCESS',
            detail: `Published access at origin is “${startAccessibility}”. TfL step-free journeys can still leave street steps — Free Flow starts via an accessible hub.`
        });
    }
    if (policy?.destinationTransferRequired) {
        conflicts.push({
            code: 'DESTINATION_STREET_ACCESS',
            detail: `Published access at destination is “${endAccessibility}”. Free Flow leaves rail at an accessible hub before the final approach.`
        });
    }
    if (policy?.wheelchairStrict && (startAccessibility === 'Interchange' || endAccessibility === 'Interchange')) {
        conflicts.push({
            code: 'INTERCHANGE_NOT_STREET',
            detail: 'Wheelchair profile on: interchange-only stations are treated as street-constrained until confirmed Full step-free.'
        });
    }

    const corrected = conflicts.length > 0;
    let trustLevel = 'aligned';
    let trustLabel = 'Published Full access aligns with step-free planning';

    if (policy?.preferSurfaceRoute) {
        trustLevel = 'surface';
        trustLabel = 'Free Flow chose surface travel over a misleading Tube hop';
    } else if (corrected && usedHubQuery) {
        trustLevel = 'corrected';
        trustLabel = 'Free Flow corrected TfL street-access gaps with accessible hubs';
    } else if (corrected) {
        trustLevel = 'override';
        trustLabel = 'Free Flow overrides risky street access even when TfL looks step-free';
    } else if (liveJourneyCount > 0) {
        trustLevel = 'live-agreed';
        trustLabel = 'Live TfL timing used where published access is Full';
    }

    return {
        corrected,
        trustLevel,
        trustLabel,
        conflicts,
        usedHubQuery: Boolean(usedHubQuery),
        liveJourneyCount,
        differsFromTfl: corrected
    };
};

export const trustBannerCopy = (trust) => {
    if (!trust?.differsFromTfl) return null;
    const conflictLines = (trust.conflicts || []).map((item) => item.detail);
    return {
        title: trust.trustLabel,
        body: 'TfL’s journey planner optimises for “step-free to platform”, which is not the same as street-to-train access. Free Flow uses published station categories as the hard gate.',
        items: conflictLines
    };
};
