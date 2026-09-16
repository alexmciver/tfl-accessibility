import assert from 'node:assert/strict';
import { buildMapStages, buildMapLegend } from '../modules/mapStages.js';
import { resolveAccessibleHubLabel } from '../modules/hubResolver.js';

const option = {
    mapUrl: 'https://maps.example/full',
    waypointMapUrl: 'https://maps.example/via',
    finalLegMapUrl: 'https://maps.example/final'
};

const originHub = resolveAccessibleHubLabel('Aldgate', 'None');
const destinationHub = resolveAccessibleHubLabel('Abbey Road', 'Full');

const constrained = buildMapStages({
    option,
    start: 'Aldgate',
    end: 'Abbey Road',
    policy: { originRerouteRequired: true, destinationTransferRequired: false },
    originHub,
    destinationHub
});

assert.equal(constrained[0].id, 'via');
assert.match(constrained[0].label, /Tube/i);
assert.match(constrained[0].caption, /Before this map: bus or short walk from Aldgate|Do not start Tube at Aldgate/i);
assert.ok(constrained[0].hint.includes(originHub.replace(/ Station, London$/i, '')));

const legend = buildMapLegend({
    start: 'Aldgate',
    end: 'Abbey Road',
    policy: { originRerouteRequired: true, destinationTransferRequired: false },
    originHub,
    destinationHub,
    startAccessibility: 'None',
    endAccessibility: 'Full'
});
assert.ok(legend.some((item) => item.tone === 'hub'));
assert.ok(legend.some((item) => item.tone === 'start'));

const direct = buildMapStages({
    option,
    start: 'Abbey Road',
    end: 'Acton Central',
    policy: { originRerouteRequired: false, destinationTransferRequired: false }
});
assert.equal(direct[0].id, 'full');
assert.match(direct[0].caption, /street-to-train step-free|Full planned route/i);

const busFinish = buildMapStages({
    option,
    start: 'Abbey Road',
    end: 'Aldgate',
    policy: { originRerouteRequired: false, destinationTransferRequired: true },
    originHub: 'Abbey Road Station, London',
    destinationHub: 'Tower Hill Station, London'
});
assert.match(busFinish[0].label, /Step-free Tube/i);
assert.match(busFinish[1].label, /Bus finish/i);
assert.match(busFinish[1].caption, /bus\/walk finish/i);
console.log('mapStages tests passed');
