/**
 * Shared journey headline + guidance lines used by hosted planner UI.
 */
export const buildJourneyGuidance = (start, end, startAccessibility, endAccessibility, policy = {}) => {
    if (policy.preferSurfaceRoute) {
        return {
            headline: 'Both stations are nearby and not street-to-train step-free. Stay on the surface — bus or walk — instead of a Tube detour.',
            items: [
                `Do this now: take a local accessible bus or walk between ${start} and ${end}. Do not enter either Tube station for a short hop.`
            ]
        };
    }

    if (startAccessibility === 'Full' && endAccessibility === 'Partial') {
        return {
            headline: 'Destination access is limited. Stay on rail for the main trip, then transfer for the last section.',
            items: [
                `Do this now: travel by Tube from ${start}, then leave at an accessible interchange before ${end}.`
            ]
        };
    }

    if (startAccessibility === 'None' && endAccessibility === 'None') {
        return {
            headline: 'Neither station is step-free. Free Flow uses accessible hubs at both ends — do not rely on TfL “step-free” labels alone.',
            items: [
                `Do this now: reach an accessible hub near ${start}, travel by Tube, then leave at an accessible hub near ${end}.`
            ]
        };
    }

    if (startAccessibility === 'None') {
        return {
            headline: 'Origin is not street-to-train step-free. Free Flow starts via an accessible hub (TfL can still suggest the inaccessible station).',
            items: [
                `Do this now: use bus or a short walk from ${start} to an accessible hub, then travel by Tube toward ${end}.`
            ]
        };
    }

    if (endAccessibility === 'None') {
        return {
            headline: 'Destination is not street-to-train step-free. Leave rail at an accessible hub, then finish by bus or walk.',
            items: [
                `Do this now: travel by Tube toward an accessible hub near ${end}, then transfer by bus or short walk.`
            ]
        };
    }

    if (startAccessibility === 'Partial' || endAccessibility === 'Partial') {
        return {
            headline: 'This journey has partial step-free access. Platform checks are required.',
            items: ['Do this now: confirm platform and exit access before departure.']
        };
    }

    if (startAccessibility === 'Interchange' || endAccessibility === 'Interchange') {
        return {
            headline: 'Interchange step-free is not the same as street-to-train access. Confirm both before you travel.',
            items: ['Do this now: follow signed interchange routes and allow extra transfer time.']
        };
    }

    return {
        headline: 'A direct step-free route looks available — still keep Plan B ready.',
        items: ['Do this now: follow Plan A, and keep the contingency ready if lifts fail.']
    };
};
