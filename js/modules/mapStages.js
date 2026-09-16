/**
 * Plain-English map stages so travellers understand what each embed shows.
 */

const shortHub = (hub = '') => String(hub)
    .replace(/,\s*London$/i, '')
    .replace(/\s+Station$/i, '')
    .trim() || 'accessible hub';

export const buildMapStages = ({
    option,
    start,
    end,
    policy = {},
    originHub = '',
    destinationHub = ''
}) => {
    if (!option) return [];

    const origin = shortHub(originHub) || start;
    const destination = shortHub(destinationHub) || end;

    if (policy.preferSurfaceRoute || option.surfaceRoute) {
        return [
            {
                id: 'via',
                label: 'Bus / surface',
                hint: `${start} → ${end}`,
                caption: `Showing a surface route between ${start} and ${end}. Both stations are not street-to-train step-free — stay on bus or walk, do not use Tube entrances for this short local hop.`,
                url: option.mapUrl || option.waypointMapUrl
            },
            {
                id: 'full',
                label: 'Walk link',
                hint: 'Pedestrian path',
                caption: `Walk-focused map from ${start} to ${end}. Useful if the distance suits your max walk preference.`,
                url: option.waypointMapUrl || option.finalLegMapUrl || option.mapUrl
            },
            {
                id: 'final',
                label: 'Arrival area',
                hint: end,
                caption: `Arrival area around ${end} on the surface.`,
                url: option.finalLegMapUrl || option.mapUrl
            }
        ].filter((stage) => stage.url);
    }

    const accessFirst = Boolean(policy.originRerouteRequired || policy.destinationTransferRequired);

    if (!accessFirst) {
        return [
            {
                id: 'full',
                label: 'Whole journey',
                hint: `${start} → ${end}`,
                caption: `Showing the full planned route from ${start} to ${end}. Both ends are treated as street-to-train accessible.`,
                url: option.mapUrl
            },
            {
                id: 'via',
                label: 'With hubs marked',
                hint: 'Backup points',
                caption: `Same corridor with accessible hub waypoints highlighted for Plan B if lifts fail.`,
                url: option.waypointMapUrl || option.mapUrl
            },
            {
                id: 'final',
                label: 'Arrival area',
                hint: end,
                caption: `Zoomed toward the arrival area around ${end}.`,
                url: option.finalLegMapUrl || option.mapUrl
            }
        ].filter((stage) => stage.url);
    }

    const stages = [
        {
            id: 'via',
            label: 'Step-free Tube',
            hint: `${origin} → ${destination}`,
            caption: [
                `Showing the step-free Tube between accessible hubs: ${origin} → ${destination}.`,
                policy.originRerouteRequired
                    ? `Do not start Tube at ${start} — reach ${origin} by bus or a short walk first.`
                    : `You can begin rail at ${start}.`,
                policy.destinationTransferRequired
                    ? `Leave at ${destination}, then bus or walk to ${end}.`
                    : `Finish at ${end}.`
            ].join(' '),
            url: option.waypointMapUrl || option.mapUrl
        },
        {
            id: 'full',
            label: 'Hubs only',
            hint: 'No inaccessible street starts',
            caption: `Overview between accessible hubs only (${origin} → ${destination}). Inaccessible street access is left off this map on purpose.`,
            url: option.mapUrl
        }
    ];

    if (policy.destinationTransferRequired) {
        stages.push({
            id: 'final',
            label: 'Final access',
            hint: `${destination} → ${end}`,
            caption: `Final approach from accessible hub ${destination} toward ${end}. Expect bus or walking — not a step-free Tube finish into ${end}.`,
            url: option.finalLegMapUrl || option.mapUrl
        });
    } else if (policy.originRerouteRequired) {
        stages.push({
            id: 'final',
            label: 'Arrival',
            hint: end,
            caption: `Arrival at fully accessible ${end} after starting via hub ${origin}.`,
            url: option.finalLegMapUrl || option.mapUrl
        });
    }

    return stages.filter((stage) => stage.url);
};

export const buildMapLegend = ({
    start,
    end,
    policy = {},
    originHub = '',
    destinationHub = '',
    startAccessibility = '',
    endAccessibility = ''
}) => {
    if (policy.preferSurfaceRoute) {
        return [
            { tone: 'start', label: `From: ${start}`, note: `${startAccessibility || 'Origin'} · surface` },
            { tone: 'end', label: `To: ${end}`, note: `${endAccessibility || 'Destination'} · surface` }
        ];
    }

    const origin = shortHub(originHub);
    const destination = shortHub(destinationHub);
    const items = [
        { tone: 'start', label: `From: ${start}`, note: startAccessibility || 'Selected origin' }
    ];

    if (policy.originRerouteRequired) {
        items.push({ tone: 'hub', label: `Start hub: ${origin}`, note: 'Join Tube here' });
    }
    if (policy.destinationTransferRequired) {
        items.push({ tone: 'hub', label: `Leave hub: ${destination}`, note: 'Leave Tube here' });
    }

    items.push({
        tone: 'end',
        label: `To: ${end}`,
        note: endAccessibility || 'Selected destination'
    });

    return items;
};
