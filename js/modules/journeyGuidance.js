/**
 * Shared journey headline + guidance lines used by hosted planner UI.
 */
export const buildJourneyGuidance = (start, end, startAccessibility, endAccessibility, policy = {}) => {
    if (policy.preferSurfaceRoute) {
        const ontoFull = endAccessibility === 'Full' && ['None', 'Partial'].includes(startAccessibility);
        const offFull = startAccessibility === 'Full' && ['None', 'Partial'].includes(endAccessibility);
        if (ontoFull) {
            return {
                headline: `${end} is the nearby step-free station. Bus or walk from ${start} — skip a longer Tube detour for this local hop.`,
                items: [
                    `Do this now: take a local accessible bus or walk from ${start} to step-free ${end}.`
                ]
            };
        }
        if (offFull) {
            return {
                headline: `${start} is already step-free. Finish the short local hop to ${end} by bus or walk.`,
                items: [
                    `Do this now: leave ${start} on the surface and take a local bus or walk to ${end}.`
                ]
            };
        }
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
            headline: `${end} is not street-to-train step-free — you will need a bus (or short walk) at the end.`,
            items: [
                `Do this now: travel by Tube to an accessible hub near ${end}, then take a bus or short walk. Do not exit ${end} expecting street-to-train access.`
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
