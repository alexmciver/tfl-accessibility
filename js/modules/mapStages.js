/**
 * Plain-English map stages so travellers understand what each stage shows.
 */

const shortHub = (hub = '') => String(hub)
    .replace(/,\s*London$/i, '')
    .replace(/\s+Station$/i, '')
    .trim() || 'accessible hub';

const stage = (fields) => fields;

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
            stage({
                id: 'via',
                label: '1. Bus / surface',
                hint: `${start} → ${end}`,
                why: 'Whole surface trip — stay on bus or walk, not Tube.',
                caption: `Showing bus/walk between ${start} and ${end}. Do not use Tube entrances for this short local hop.`,
                from: start,
                to: end,
                mode: 'transit',
                url: option.mapUrl || option.waypointMapUrl
            }),
            stage({
                id: 'full',
                label: '2. Walk option',
                hint: 'Pedestrian path',
                why: 'Same corridor as a walking route, if the distance suits you.',
                caption: `Walk-focused path from ${start} to ${end}.`,
                from: start,
                to: end,
                mode: 'walking',
                url: option.waypointMapUrl || option.finalLegMapUrl || option.mapUrl
            }),
            stage({
                id: 'final',
                label: '3. Arrival area',
                hint: end,
                why: `Zoom toward ${end} on the surface.`,
                caption: `Arrival area around ${end}.`,
                from: end,
                to: end,
                mode: 'walking',
                url: option.finalLegMapUrl || option.mapUrl
            })
        ].filter((item) => item.url || (item.from && item.to));
    }

    const accessFirst = Boolean(policy.originRerouteRequired || policy.destinationTransferRequired);

    if (!accessFirst) {
        return [
            stage({
                id: 'full',
                label: '1. Whole journey',
                hint: `${start} → ${end}`,
                why: 'End-to-end route when both stations are street-to-train step-free.',
                caption: `Full planned route from ${start} to ${end}.`,
                from: start,
                to: end,
                mode: 'transit',
                url: option.mapUrl
            }),
            stage({
                id: 'via',
                label: '2. Backup hubs',
                hint: 'If lifts fail',
                why: 'Same corridor with accessible hubs marked for Plan B.',
                caption: `Same corridor with accessible hub waypoints for Plan B if lifts fail.`,
                from: origin,
                to: destination,
                mode: 'transit',
                url: option.waypointMapUrl || option.mapUrl
            }),
            stage({
                id: 'final',
                label: '3. Arrival area',
                hint: end,
                why: `Zoom toward ${end}.`,
                caption: `Arrival area around ${end}.`,
                from: end,
                to: end,
                mode: 'transit',
                url: option.finalLegMapUrl || option.mapUrl
            })
        ].filter((item) => item.url || (item.from && item.to));
    }

    const stages = [
        stage({
            id: 'via',
            label: policy.originRerouteRequired ? '1. Tube (after bus)' : '1. Step-free Tube',
            hint: `${origin} → ${destination}`,
            why: policy.originRerouteRequired
                ? `First take bus/walk to ${origin}, then this Tube map runs ${origin} → ${destination}.`
                : `Tube/rail core from ${origin} to ${destination}.`,
            caption: [
                `This map is the Tube core only: ${origin} → ${destination}.`,
                policy.originRerouteRequired
                    ? `Before this map: bus or short walk from ${start} to ${origin}.`
                    : `You can begin rail at ${start}.`,
                policy.destinationTransferRequired
                    ? `After this map: leave at ${destination} and take a bus/walk to ${end}.`
                    : `Finish at ${end}.`
            ].join(' '),
            from: origin,
            to: destination,
            mode: 'transit',
            url: option.mapUrl || option.waypointMapUrl
        })
    ];

    if (policy.destinationTransferRequired) {
        stages.push(stage({
            id: 'final',
            label: '2. Bus finish',
            hint: `${destination} → ${end}`,
            why: `Leave the Tube at ${destination}, then bus or short walk to ${end}.`,
            caption: `This map is the bus/walk finish only: ${destination} → ${end}. ${end} is not street-to-train step-free — do not stay on the Tube into ${end} for street access.`,
            from: destination,
            to: end,
            mode: 'walking',
            url: option.finalLegMapUrl || option.mapUrl
        }));
    } else if (policy.originRerouteRequired) {
        stages.push(stage({
            id: 'final',
            label: '2. Arrival',
            hint: end,
            why: `Arrive at fully accessible ${end}.`,
            caption: `Arrival at fully accessible ${end} after starting via hub ${origin}.`,
            from: origin,
            to: end,
            mode: 'transit',
            url: option.finalLegMapUrl || option.mapUrl
        }));
    } else {
        stages.push(stage({
            id: 'full',
            label: '2. Hubs overview',
            hint: `${origin} → ${destination}`,
            why: 'Wider overview of the accessible hubs only.',
            caption: `Overview between accessible hubs only (${origin} → ${destination}).`,
            from: origin,
            to: destination,
            mode: 'transit',
            url: option.waypointMapUrl || option.mapUrl
        }));
    }

    return stages.filter((item) => item.url || (item.from && item.to));
};

export const buildMapHowto = (stages = []) => stages.map((item, index) => (
    `${index + 1}. ${String(item.label).replace(/^\d+\.\s*/, '')}: ${item.why || item.caption}`
));

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
        items.push({ tone: 'hub', label: `Join Tube: ${origin}`, note: 'Bus/walk here first' });
    }
    if (policy.destinationTransferRequired) {
        items.push({ tone: 'hub', label: `Leave Tube: ${destination}`, note: 'Then bus/walk' });
    }

    items.push({
        tone: 'end',
        label: `To: ${end}`,
        note: endAccessibility || 'Selected destination'
    });

    return items;
};
